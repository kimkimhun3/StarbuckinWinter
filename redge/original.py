import argparse
import math
import os
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

import cv2
import numpy as np

import gi
gi.require_version("Gst", "1.0")
gi.require_version("GObject", "2.0")
from gi.repository import Gst, GObject, GLib

# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────
MIN_SCALE     = 0.1
MAX_SCALE     = 6.0
DEFAULT_SCALE = 1.0
OVERLAY_FPS   = 30

SCALE_FILE_PATH = "/root/.reti_pattmag_file"
PLUS_CTL_FILE   = "/root/.reti_plus"
PLUS_REF_FILE   = "/root/.reti_plus_ref"
FOV_CAL_FILE    = "/root/.reti_fov_cal"

PAN_UNITS_PER_DEG  = 100.0
TILT_UNITS_PER_DEG = 100.0
PAN_FULL_CIRCLE    = 36000
TILT_FULL_CIRCLE   = 36000

ZOOM_RAW_X1  = 205.0
ZOOM_RAW_MAX = 8192.0

# ── FOV defaults ──────────────────────────────
HFOV_X1_DEFAULT  = 64.1
VFOV_X1_DEFAULT  = 38.1
HFOV_MAX_DEFAULT = 2.08
VFOV_MAX_DEFAULT = 1.24

# ── Auto mode calibration factors (old algorithm) ─────────────────────────────
# Derived from physical measurement — correct spec-sheet FOV vs actual sensor FOV.
# Used only in "auto" mode; "mypreset" mode uses the FOV calibration table instead.
FOV_CAL_H = 1.069
FOV_CAL_V = 1.068

HOLD_SECONDS       = 20
HEARTBEAT_SEC      = HOLD_SECONDS - 2
MODE_FILE_POLL_SEC = 0.5

# Valid modes
VALID_MODES      = ("auto", "preset", "mypreset")
PRESET_POSITIONS = ("center", "top_left", "top_right", "bottom_left", "bottom_right")

TARGET_ARM_OUTPUT_PX    = 28
UPSCALE_COMPENSATION_PX = 2

# ──────────────────────────────────────────────
# Globals
# ──────────────────────────────────────────────
pipeline               = None
mix                    = None
overlay_src            = None
video_width            = None
video_height           = None
current_scale          = DEFAULT_SCALE
overlay_thread_running = False
_overlay_thread        = None
_pts                   = 0
_duration              = 0
_cached_frame          = None
_cached_bytes          = None
canvas_upscale         = 1.0

# FOV params — set from CLI args, used by both modes
hfov_x1  = HFOV_X1_DEFAULT
vfov_x1  = VFOV_X1_DEFAULT
hfov_max = HFOV_MAX_DEFAULT
vfov_max = VFOV_MAX_DEFAULT

# Live copies of FOV params (for log curve recalc)
_live_hfov_x1  = HFOV_X1_DEFAULT
_live_vfov_x1  = VFOV_X1_DEFAULT
_live_hfov_max = HFOV_MAX_DEFAULT
_live_vfov_max = VFOV_MAX_DEFAULT

# ── mypreset mode: FOV calibration table ──────
# List of (zoom_raw, hfov, vfov) sorted ascending
_fov_cal_table = []
_fov_cal_lock  = threading.Lock()

# Direct FOV override — set by /setfovnow during calibration
# Format: (zoom_raw, hfov_deg, vfov_deg) or None
_fov_override      = None
_fov_override_lock = threading.Lock()

# Log curve coefficients (mypreset mode fallback)
_LOG_A_H = 0.0
_LOG_B_H = 0.0
_LOG_A_V = 0.0
_LOG_B_V = 0.0

# ── Mode and PTZ state ────────────────────────
# Modes:
#   "auto"     — old algorithm: simple zoom ratio + FOV_CAL_H/V factors, no table
#   "preset"   — fixed screen position (center / corners)
#   "mypreset" — table/log-curve based FOV, full calibration
_current_mode    = "auto"
_preset_position = "center"
_cur_pan  = 0
_cur_tilt = 0
_cur_zoom = int(ZOOM_RAW_X1)
_ref_pan  = 0
_ref_tilt = 0
_ref_zoom = int(ZOOM_RAW_X1)
_flip_h   = False
_flip_v   = False

# ── Radial correction coefficients ───────────────────────────────────────────
# Separate H (horizontal/pan) and V (vertical/tilt) correction.
# Compensates for lens distortion — "plus undershoots toward center" error.
#
# Kh = 0.0  → no horizontal correction
# Kv = 0.0  → no vertical correction
# K  > 0.0  → plus moves further from center (fixes undershoot)
# K  < 0.0  → plus moves closer to center   (fixes overshoot, rare)
#
# Stored in .reti_fov_cal as columns 4 (kh) and 5 (kv).
# Tune live via:  curl "http://<board>:8080/setk?h=0.25&v=0.20"
# _radial_kh / _radial_kv override table values when non-zero.
_radial_kh = 0.0
_radial_kv = 0.0
# Second-order radial correction — fixes residual edge drift after K1 tuning.
# kh2 / kv2 are typically much smaller than kh / kv (range 0.01 ~ 0.15).
_radial_kh2 = 0.0
_radial_kv2 = 0.0

_cache_lock          = threading.Lock()
_pts_lock            = threading.Lock()
_scale_event         = threading.Event()
_upscale_ready_event = threading.Event()

COLOR_MAP = {
    "white":  (255, 255, 255, 255),
    "red":    (0,   0,   255, 255),
    "blue":   (255, 0,   0,   255),
    "black":  (0,   0,   0,   255),
    "yellow": (0,   255, 255, 255),
}
active_moji_color  = COLOR_MAP["white"]
active_frame_color = COLOR_MAP["black"]


# ──────────────────────────────────────────────
# mypreset mode: FOV calibration table — load / save
# ──────────────────────────────────────────────
def _load_fov_cal_table() -> bool:
    global _fov_cal_table
    entries = []
    try:
        with open(FOV_CAL_FILE, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                parts = line.split(",")
                if len(parts) < 3:
                    continue
                try:
                    zr  = float(parts[0])
                    hf  = float(parts[1])
                    vf  = float(parts[2])
                    kh  = float(parts[3]) if len(parts) >= 4 else 0.0
                    kv  = float(parts[4]) if len(parts) >= 5 else kh
                    kh2 = float(parts[5]) if len(parts) >= 6 else 0.0
                    kv2 = float(parts[6]) if len(parts) >= 7 else kh2
                    if zr > 0 and hf > 0 and vf > 0:
                        entries.append((zr, hf, vf, kh, kv, kh2, kv2))
                except ValueError:
                    continue
    except FileNotFoundError:
        print(f"[INFO] No FOV calibration table ({FOV_CAL_FILE}) — mypreset uses log curve.")
        with _fov_cal_lock:
            _fov_cal_table = []
        return False
    except Exception as e:
        print(f"[WARN] Failed to read FOV calibration table: {e}")
        with _fov_cal_lock:
            _fov_cal_table = []
        return False

    if len(entries) < 1:
        print(f"[WARN] FOV calibration table is empty — mypreset uses log curve.")
        with _fov_cal_lock:
            _fov_cal_table = []
        return False

    entries.sort(key=lambda x: x[0])
    with _fov_cal_lock:
        _fov_cal_table = entries

    print(f"[INFO] FOV calibration table loaded: {len(entries)} points")
    for zr, hf, vf, kh, kv, kh2, kv2 in entries:
        print(f"       zoom_raw={zr:.0f}  hfov={hf:.4f}  vfov={vf:.4f}"
              f"  kh={kh:.4f}  kv={kv:.4f}  kh2={kh2:.4f}  kv2={kv2:.4f}")
    return True


def _save_fov_cal_entry(zoom_raw: float, hfov: float, vfov: float,
                        kh: float = 0.0, kv: float = 0.0,
                        kh2: float = 0.0, kv2: float = 0.0) -> bool:
    try:
        data = []
        if os.path.exists(FOV_CAL_FILE):
            with open(FOV_CAL_FILE, "r") as f:
                for line in f:
                    s = line.strip()
                    if not s or s.startswith("#"):
                        continue
                    parts = s.split(",")
                    if len(parts) >= 3:
                        try:
                            zr = float(parts[0])
                            if abs(zr - zoom_raw) > 10.0:
                                kh_old  = float(parts[3]) if len(parts) >= 4 else 0.0
                                kv_old  = float(parts[4]) if len(parts) >= 5 else kh_old
                                kh2_old = float(parts[5]) if len(parts) >= 6 else 0.0
                                kv2_old = float(parts[6]) if len(parts) >= 7 else kh2_old
                                data.append((zr, float(parts[1]), float(parts[2]),
                                             kh_old, kv_old, kh2_old, kv2_old))
                        except ValueError:
                            pass
        data.append((zoom_raw, hfov, vfov, kh, kv, kh2, kv2))
        data.sort(key=lambda x: x[0])
        dir_name = os.path.dirname(FOV_CAL_FILE) or "."
        fd, tmp  = tempfile.mkstemp(dir=dir_name, prefix=".reti_fov_tmp_")
        try:
            with os.fdopen(fd, "w") as f:
                f.write("# RETI FOV calibration table\n")
                f.write("# zoom_raw,hfov_deg,vfov_deg,kh,kv,kh2,kv2\n")
                for zr, hf, vf, kh_v, kv_v, kh2_v, kv2_v in data:
                    f.write(f"{zr:.0f},{hf:.6f},{vf:.6f},"
                            f"{kh_v:.6f},{kv_v:.6f},{kh2_v:.6f},{kv2_v:.6f}\n")
            os.replace(tmp, FOV_CAL_FILE)
        except Exception:
            os.unlink(tmp)
            raise
        return True
    except Exception as e:
        print(f"[WARN] Failed to save FOV cal entry: {e}")
        return False


# ──────────────────────────────────────────────
# mypreset mode: log curve fallback
# ──────────────────────────────────────────────
def _init_zoom_curves() -> None:
    global _LOG_A_H, _LOG_B_H, _LOG_A_V, _LOG_B_V
    global _live_hfov_x1, _live_vfov_x1, _live_hfov_max, _live_vfov_max

    _live_hfov_x1  = hfov_x1
    _live_vfov_x1  = vfov_x1
    _live_hfov_max = hfov_max
    _live_vfov_max = vfov_max

    zoom_eff_h = (math.tan(math.radians(hfov_x1  / 2.0)) /
                  math.tan(math.radians(hfov_max  / 2.0)))
    zoom_eff_v = (math.tan(math.radians(vfov_x1  / 2.0)) /
                  math.tan(math.radians(vfov_max  / 2.0)))

    _LOG_A_H = math.log(zoom_eff_h) / (ZOOM_RAW_MAX - ZOOM_RAW_X1)
    _LOG_B_H = -_LOG_A_H * ZOOM_RAW_X1
    _LOG_A_V = math.log(zoom_eff_v) / (ZOOM_RAW_MAX - ZOOM_RAW_X1)
    _LOG_B_V = -_LOG_A_V * ZOOM_RAW_X1

    print(f"[INFO] Log curve: H eff={zoom_eff_h:.4f}x  V eff={zoom_eff_v:.4f}x")


def _zoom_raw_to_fov_log(raw_clamped: float) -> tuple:
    mag_h = math.exp(_LOG_A_H * raw_clamped + _LOG_B_H)
    mag_v = math.exp(_LOG_A_V * raw_clamped + _LOG_B_V)
    hfov  = 2.0 * math.degrees(math.atan(math.tan(math.radians(_live_hfov_x1 / 2.0)) / mag_h))
    vfov  = 2.0 * math.degrees(math.atan(math.tan(math.radians(_live_vfov_x1 / 2.0)) / mag_v))
    return hfov, vfov, 0.0, 0.0, 0.0, 0.0


# ──────────────────────────────────────────────
# mypreset mode: zoom_raw → (hfov, vfov)
# Priority: override → table → log curve
# ──────────────────────────────────────────────
def _zoom_raw_to_fov(zoom_raw: int) -> tuple:
    """
    Returns (hfov, vfov, kh, kv, kh2, kv2) for the given zoom_raw.

    Priority:
      1. _fov_override  — /setfovnow during calibration
      2. Calibration table — optical scaling from nearest anchor
      3. Log curve fallback

    Optical scaling (physically correct for real lenses):
      hfov(z) = 2 * atan( tan(hfov_a/2) * z_a / z )
      vfov(z) = 2 * atan( tan(vfov_a/2) * z_a / z )
      kh(z)   = kh_a  * (z_a / z)^2   — distortion ∝ 1/focal²
      kv(z)   = kv_a  * (z_a / z)^2
      kh2(z)  = kh2_a * (z_a / z)^3   — 2nd order ∝ 1/focal³
      kv2(z)  = kv2_a * (z_a / z)^3

    This means a single calibration point covers its entire zoom band
    accurately — no need for multiple points per band.
    """
    raw_clamped = max(ZOOM_RAW_X1, min(float(zoom_raw), ZOOM_RAW_MAX))

    # Priority 1: direct override (calibration in progress)
    with _fov_override_lock:
        ov = _fov_override
    if ov is not None:
        ov_raw, ov_h, ov_v = ov
        if abs(raw_clamped - ov_raw) <= 10.0:
            return ov_h, ov_v, _radial_kh, _radial_kv, _radial_kh2, _radial_kv2

    # Priority 2: calibration table with optical scaling
    with _fov_cal_lock:
        table = list(_fov_cal_table)

    if len(table) >= 1:
        # Exact match — return directly
        for zr, hf, vf, kh, kv, kh2, kv2 in table:
            if abs(raw_clamped - zr) < 0.5:
                return hf, vf, kh, kv, kh2, kv2

        # Find nearest anchor point by zoom_raw distance
        nearest = min(table, key=lambda e: abs(e[0] - raw_clamped))
        z_a, hf_a, vf_a, kh_a, kv_a, kh2_a, kv2_a = nearest

        # Optical scaling from nearest anchor
        ratio = z_a / raw_clamped   # focal length ratio (anchor / target)

        # FOV: gnomonic projection scaling
        hfov = 2.0 * math.degrees(
            math.atan(math.tan(math.radians(hf_a / 2.0)) * ratio))
        vfov = 2.0 * math.degrees(
            math.atan(math.tan(math.radians(vf_a / 2.0)) * ratio))

        # K scaling: distortion decreases as focal length increases
        ratio2 = ratio ** 2
        ratio3 = ratio ** 3
        kh  = kh_a  * ratio2
        kv  = kv_a  * ratio2
        kh2 = kh2_a * ratio3
        kv2 = kv2_a * ratio3

        return hfov, vfov, kh, kv, kh2, kv2

    # Priority 3: log curve fallback (no table entries)
    return _zoom_raw_to_fov_log(raw_clamped)


# ──────────────────────────────────────────────
# File helpers
# ──────────────────────────────────────────────
def write_scale_file(scale: float) -> None:
    try:
        dir_name = os.path.dirname(SCALE_FILE_PATH) or "."
        fd, tmp  = tempfile.mkstemp(dir=dir_name, prefix=".reti_tmp_")
        try:
            with os.fdopen(fd, "w") as f:
                f.write(f"{scale:.3f}\n")
            os.replace(tmp, SCALE_FILE_PATH)
        except Exception:
            os.unlink(tmp)
            raise
    except Exception as e:
        print(f"[WARN] Failed to write scale file: {e}")


def read_ctl_file() -> tuple:
    """
    Reads PLUS_CTL_FILE and returns (mode, position).

    File format:
        "auto"               → ("auto",     "center")
        "mypreset"           → ("mypreset", "center")
        "preset"             → ("preset",   "center")
        "preset:center"      → ("preset",   "center")
        "preset:top_left"    → ("preset",   "top_left")
        "preset:top_right"   → ("preset",   "top_right")
        "preset:bottom_left" → ("preset",   "bottom_left")
        "preset:bottom_right"→ ("preset",   "bottom_right")

    Defaults to ("auto", "center") if missing or unreadable.
    """
    try:
        with open(PLUS_CTL_FILE, "r") as f:
            val = f.read().strip().lower()
        if val == "auto":
            return ("auto", "center")
        if val == "mypreset":
            return ("mypreset", "center")
        if val == "preset":
            return ("preset", "center")
        if val.startswith("preset:"):
            pos = val.split(":", 1)[1]
            return ("preset", pos if pos in PRESET_POSITIONS else "center")
    except Exception:
        pass
    return ("auto", "center")


def load_ref_position() -> bool:
    global _ref_pan, _ref_tilt, _ref_zoom
    try:
        with open(PLUS_REF_FILE, "r") as f:
            parts = f.read().strip().split(",")
        if len(parts) >= 3:
            _ref_pan, _ref_tilt, _ref_zoom = int(parts[0]), int(parts[1]), int(parts[2])
            print(f"[INFO] Reference loaded: pan={_ref_pan} tilt={_ref_tilt} zoom={_ref_zoom}")
            return True
    except Exception as e:
        print(f"[WARN] Could not load reference: {e}")
    return False


# ──────────────────────────────────────────────
# Pan / tilt delta (shared by both tracking modes)
# ──────────────────────────────────────────────
def _pan_delta(current: int, reference: int) -> int:
    d = current - reference
    if d >  PAN_FULL_CIRCLE // 2:      d -= (PAN_FULL_CIRCLE + 1)
    elif d < -(PAN_FULL_CIRCLE // 2):  d += (PAN_FULL_CIRCLE + 1)
    return d


def _tilt_delta(current: int, reference: int) -> int:
    d = current - reference
    if d >  TILT_FULL_CIRCLE // 2:     d -= TILT_FULL_CIRCLE
    elif d < -(TILT_FULL_CIRCLE // 2): d += TILT_FULL_CIRCLE
    return d


# ──────────────────────────────────────────────
# Preset mode offset
# ──────────────────────────────────────────────
def _compute_preset_offset(width: int, height: int) -> tuple:
    arm      = max(4, int(round(TARGET_ARM_OUTPUT_PX / canvas_upscale)))
    margin_x = arm + int(round(10 / canvas_upscale))
    margin_y = arm + int(round(10 / canvas_upscale))
    if   _preset_position == "top_left":      return (-(width//2 - margin_x), -(height//2 - margin_y))
    elif _preset_position == "top_right":     return (+(width//2 - margin_x), -(height//2 - margin_y))
    elif _preset_position == "bottom_left":   return (-(width//2 - margin_x), +(height//2 - margin_y))
    elif _preset_position == "bottom_right":  return (+(width//2 - margin_x), +(height//2 - margin_y))
    else:                                     return (0.0, 0.0)


# ──────────────────────────────────────────────
# AUTO mode offset computation (old algorithm)
#
# Uses simple zoom magnification ratio:
#   zoom_mag = _cur_zoom / ZOOM_RAW_X1
# FOV at current zoom:
#   hfov = hfov_x1 / zoom_mag
# Focal length corrected by FOV_CAL_H / FOV_CAL_V
# (physically measured correction factors).
# No calibration table required.
# ──────────────────────────────────────────────
def _is_target_in_fov(delta_pan_deg: float, delta_tilt_deg: float, zoom_mag: float) -> bool:
    """FOV visibility check for auto mode (simple zoom ratio)."""
    effective_hfov_half = (hfov_x1 / zoom_mag) / 2.0
    effective_vfov_half = (vfov_x1 / zoom_mag) / 2.0
    return (abs(delta_pan_deg)  <= effective_hfov_half and
            abs(delta_tilt_deg) <= effective_vfov_half)


def compute_plus_offset_auto(width: int, height: int) -> tuple:
    """
    AUTO mode — original algorithm.
    Gnomonic projection with simple zoom ratio and FOV_CAL_H/V correction factors.
    Does not use the FOV calibration table.
    """
    zoom_mag = max(1.0, _cur_zoom / ZOOM_RAW_X1)

    delta_pan_deg  = _pan_delta(_cur_pan,  _ref_pan)  / PAN_UNITS_PER_DEG
    delta_tilt_deg = _tilt_delta(_cur_tilt, _ref_tilt) / TILT_UNITS_PER_DEG

    in_fov = _is_target_in_fov(delta_pan_deg, delta_tilt_deg, zoom_mag)

    p_ref = math.radians(_ref_pan  / PAN_UNITS_PER_DEG)
    p_cur = math.radians(_cur_pan  / PAN_UNITS_PER_DEG)
    t_ref = math.radians(_tilt_delta(_ref_tilt, 0) / TILT_UNITS_PER_DEG)
    t_cur = math.radians(_tilt_delta(_cur_tilt, 0) / TILT_UNITS_PER_DEG)

    r_x =  math.sin(p_ref) * math.cos(t_ref)
    r_y = -math.sin(t_ref)
    r_z =  math.cos(p_ref) * math.cos(t_ref)

    f_x =  math.sin(p_cur) * math.cos(t_cur)
    f_y = -math.sin(t_cur)
    f_z =  math.cos(p_cur) * math.cos(t_cur)

    ri_x =  math.cos(p_cur);  ri_y = 0.0;  ri_z = -math.sin(p_cur)

    u_x = f_y*ri_z - f_z*ri_y
    u_y = f_z*ri_x - f_x*ri_z
    u_z = f_x*ri_y - f_y*ri_x

    d_fwd   = r_x*f_x  + r_y*f_y  + r_z*f_z
    d_right = r_x*ri_x + r_y*ri_y + r_z*ri_z
    d_up    = r_x*u_x  + r_y*u_y  + r_z*u_z

    if d_fwd <= 0.0:
        return (0.0, 0.0, False)

    # Focal length from simple zoom ratio, corrected by calibration factors
    focal_x = (width  / 2.0) / math.tan(math.radians(hfov_x1 / zoom_mag / 2.0)) * FOV_CAL_H
    focal_y = (height / 2.0) / math.tan(math.radians(vfov_x1 / zoom_mag / 2.0)) * FOV_CAL_V

    raw_x =  (d_right / d_fwd)
    raw_y = -(d_up    / d_fwd)

    # Radial correction — 1st order (K1) + 2nd order (K2).
    # K1 fixes mid-range drift, K2 fixes residual edge drift.
    if _radial_kh != 0.0 or _radial_kv != 0.0 or _radial_kh2 != 0.0 or _radial_kv2 != 0.0:
        angle_r  = math.sqrt(raw_x ** 2 + raw_y ** 2)
        angle_r2 = angle_r ** 2
        offset_x = raw_x * focal_x * (1.0 + _radial_kh  * angle_r + _radial_kh2 * angle_r2)
        offset_y = raw_y * focal_y * (1.0 + _radial_kv  * angle_r + _radial_kv2 * angle_r2)
    else:
        offset_x = raw_x * focal_x
        offset_y = raw_y * focal_y

    if _flip_h: offset_x = -offset_x
    if _flip_v: offset_y = -offset_y

    return (offset_x, offset_y, in_fov)


# ──────────────────────────────────────────────
# MYPRESET mode offset computation (table-based)
#
# Uses _zoom_raw_to_fov() which resolves FOV via:
#   Priority 1: /setfovnow override
#   Priority 2: calibration table (linear interpolation)
#   Priority 3: log curve fallback
# No FOV_CAL_H/V factors — table measurements are ground truth.
# ──────────────────────────────────────────────
def compute_plus_offset_mypreset(width: int, height: int) -> tuple:
    """
    MYPRESET mode — table-based algorithm.
    Gnomonic projection with FOV from calibration table / log curve.
    Kh/Kv from table unless _radial_kh/_radial_kv override (live /setk).
    """
    hfov_cur, vfov_cur, kh_table, kv_table, kh2_table, kv2_table = _zoom_raw_to_fov(_cur_zoom)

    # _radial_kh/kv/kh2/kv2 replace table values when non-zero
    effective_kh  = _radial_kh  if _radial_kh  != 0.0 else kh_table
    effective_kv  = _radial_kv  if _radial_kv  != 0.0 else kv_table
    effective_kh2 = _radial_kh2 if _radial_kh2 != 0.0 else kh2_table
    effective_kv2 = _radial_kv2 if _radial_kv2 != 0.0 else kv2_table

    delta_pan_deg  = _pan_delta(_cur_pan,   _ref_pan)  / PAN_UNITS_PER_DEG
    delta_tilt_deg = _tilt_delta(_cur_tilt, _ref_tilt) / TILT_UNITS_PER_DEG

    in_fov = (abs(delta_pan_deg)  <= hfov_cur / 2.0 and
              abs(delta_tilt_deg) <= vfov_cur / 2.0)

    p_ref = math.radians(_ref_pan  / PAN_UNITS_PER_DEG)
    p_cur = math.radians(_cur_pan  / PAN_UNITS_PER_DEG)
    t_ref = math.radians(_tilt_delta(_ref_tilt, 0) / TILT_UNITS_PER_DEG)
    t_cur = math.radians(_tilt_delta(_cur_tilt, 0) / TILT_UNITS_PER_DEG)

    r_x =  math.sin(p_ref) * math.cos(t_ref)
    r_y = -math.sin(t_ref)
    r_z =  math.cos(p_ref) * math.cos(t_ref)

    f_x =  math.sin(p_cur) * math.cos(t_cur)
    f_y = -math.sin(t_cur)
    f_z =  math.cos(p_cur) * math.cos(t_cur)

    ri_x =  math.cos(p_cur);  ri_y = 0.0;  ri_z = -math.sin(p_cur)

    u_x = f_y*ri_z - f_z*ri_y
    u_y = f_z*ri_x - f_x*ri_z
    u_z = f_x*ri_y - f_y*ri_x

    d_fwd   = r_x*f_x  + r_y*f_y  + r_z*f_z
    d_right = r_x*ri_x + r_y*ri_y + r_z*ri_z
    d_up    = r_x*u_x  + r_y*u_y  + r_z*u_z

    if d_fwd <= 0.0:
        return (0.0, 0.0, False)

    # Focal length from calibrated FOV — no additional correction factors
    focal_x = (width  / 2.0) / math.tan(math.radians(hfov_cur / 2.0))
    focal_y = (height / 2.0) / math.tan(math.radians(vfov_cur / 2.0))

    raw_x =  (d_right / d_fwd)
    raw_y = -(d_up    / d_fwd)

    # Radial correction — 1st order (K1) + 2nd order (K2).
    if effective_kh != 0.0 or effective_kv != 0.0 or effective_kh2 != 0.0 or effective_kv2 != 0.0:
        angle_r  = math.sqrt(raw_x ** 2 + raw_y ** 2)
        angle_r2 = angle_r ** 2
        offset_x = raw_x * focal_x * (1.0 + effective_kh  * angle_r + effective_kh2 * angle_r2)
        offset_y = raw_y * focal_y * (1.0 + effective_kv  * angle_r + effective_kv2 * angle_r2)
    else:
        offset_x = raw_x * focal_x
        offset_y = raw_y * focal_y

    if _flip_h: offset_x = -offset_x
    if _flip_v: offset_y = -offset_y

    return (offset_x, offset_y, in_fov)


# ──────────────────────────────────────────────
# Offset dispatcher — routes to correct algorithm
# ──────────────────────────────────────────────
def _dispatch_offset(width: int, height: int) -> tuple:
    """
    Returns (offset_x, offset_y, in_fov) for the current mode.
    For "preset" mode returns in_fov=True (always visible).
    """
    if _current_mode == "auto":
        return compute_plus_offset_auto(width, height)
    elif _current_mode == "mypreset":
        return compute_plus_offset_mypreset(width, height)
    else:
        # preset — no PTZ tracking, always in FOV
        ox, oy = _compute_preset_offset(width, height)
        return (ox, oy, True)


# ──────────────────────────────────────────────
# GStreamer setup
# ──────────────────────────────────────────────
def _get_appsrc_caps_info() -> bool:
    global OVERLAY_FPS, _duration, video_width, video_height
    caps = overlay_src.get_property("caps")
    if caps is None:
        print("[ERROR] appsrc has no caps"); return False
    s = caps.get_structure(0)
    ok_w, w = s.get_int("width");  ok_h, h = s.get_int("height")
    if not (ok_w and ok_h):
        print("[ERROR] Could not read width/height from appsrc caps"); return False
    video_width = w;  video_height = h
    ok, num, den = s.get_fraction("framerate")
    if ok and den > 0: OVERLAY_FPS = num / den
    _duration = HOLD_SECONDS * Gst.SECOND
    print(f"[INFO] Canvas: {video_width}x{video_height}, FPS: {OVERLAY_FPS}")
    print(f"[INFO] Buffer hold: {HOLD_SECONDS}s, heartbeat: {HEARTBEAT_SEC}s")
    return True


def _detect_upscale_thread() -> None:
    global canvas_upscale
    pad = mix.get_static_pad("sink_0") if mix else None
    if pad is None:
        print("[WARN] mix sink_0 pad not found — canvas_upscale stays 1.0")
        _upscale_ready_event.set(); return
    caps = None
    for _ in range(40):
        caps = pad.get_current_caps()
        if caps: break
        time.sleep(0.1)
    if not caps:
        print("[WARN] mix sink_0 caps not available — canvas_upscale stays 1.0")
        _upscale_ready_event.set(); return
    s = caps.get_structure(0)
    w_ok, w = s.get_int("width");  h_ok, h = s.get_int("height")
    if not (w_ok and h_ok):
        _upscale_ready_event.set(); return
    scale_x = w / video_width;  scale_y = h / video_height
    new_upscale = round(scale_x * 4) / 4 if abs(scale_x - scale_y) < 0.01 else scale_x
    print(f"[INFO] Output: {w}x{h}, canvas: {video_width}x{video_height}, upscale: {new_upscale}x")
    with _cache_lock:
        canvas_upscale = new_upscale
        global _cached_frame, _cached_bytes
        _cached_frame = None;  _cached_bytes = None
    _upscale_ready_event.set()


# ──────────────────────────────────────────────
# Mode file watcher
# ──────────────────────────────────────────────
def mode_file_watcher() -> None:
    """
    Polls PLUS_CTL_FILE every MODE_FILE_POLL_SEC seconds.

    File format:
        "auto"               → auto mode   (old algorithm, no table)
        "mypreset"           → mypreset    (table/log curve)
        "preset"             → preset center
        "preset:top_left"    → preset top-left corner
        "preset:top_right"   → preset top-right corner
        "preset:bottom_left" → preset bottom-left corner
        "preset:bottom_right"→ preset bottom-right corner

    When switching to "auto" or "mypreset":
        current PTZ is snapshotted as new reference.
    When switching to "preset":
        preset position is updated, no ref snapshot needed.
    """
    global overlay_thread_running
    last_mode, last_pos = read_ctl_file()
    print(f"[INFO] Mode file watcher started (poll every {MODE_FILE_POLL_SEC}s)")

    while overlay_thread_running:
        time.sleep(MODE_FILE_POLL_SEC)
        new_mode, new_pos = read_ctl_file()

        if new_mode != last_mode or new_pos != last_pos:
            print(f"[INFO] Mode file: {last_mode}:{last_pos} → {new_mode}:{new_pos}")

            if new_mode == "auto":
                request_snapshot_reference()
                request_set_mode("auto")
            elif new_mode == "mypreset":
                request_snapshot_reference()
                request_set_mode("mypreset")
            elif new_mode == "preset":
                request_set_preset_position(new_pos)

            last_mode = new_mode;  last_pos = new_pos

    print("[INFO] Mode file watcher stopped")


# ──────────────────────────────────────────────
# Plus sign drawing
# ──────────────────────────────────────────────
def draw_plus_rgba(width, height, upscale=1.0, offset_x=0.0, offset_y=0.0):
    canvas = np.zeros((height, width, 4), dtype=np.uint8)
    cx = int(round(width  / 2.0 + offset_x)) & ~1
    cy = int(round(height / 2.0 + offset_y)) & ~1
    comp = UPSCALE_COMPENSATION_PX if upscale >= 2.0 else 0
    arm  = max(4, int(round(TARGET_ARM_OUTPUT_PX / upscale)) + comp)
    if cx < -arm or cx >= width+arm or cy < -arm or cy >= height+arm:
        return canvas
    ft = max(1, int(round(3.0 / upscale)))
    ot = ft + max(1, int(round(2.0 / upscale)))
    cv2.line(canvas, (cx-arm, cy), (cx+arm, cy), active_frame_color, ot, cv2.LINE_8)
    cv2.line(canvas, (cx-arm, cy), (cx+arm, cy), active_moji_color,  ft, cv2.LINE_8)
    cv2.line(canvas, (cx, cy-arm), (cx, cy+arm), active_frame_color, ot, cv2.LINE_8)
    cv2.line(canvas, (cx, cy-arm), (cx, cy+arm), active_moji_color,  ft, cv2.LINE_8)
    return canvas


# ──────────────────────────────────────────────
# Frame cache
# ──────────────────────────────────────────────
def _get_cached_bytes() -> bytes:
    """Must be called with _cache_lock held."""
    global _cached_frame, _cached_bytes
    if _cached_frame is None:
        if _current_mode in ("auto", "mypreset"):
            ox, oy, in_fov = _dispatch_offset(video_width, video_height)
            if not in_fov:
                # Target outside FOV — push blank transparent frame
                _cached_frame = np.zeros((video_height, video_width, 4), dtype=np.uint8)
                _cached_bytes = _cached_frame.tobytes()
                return _cached_bytes
        else:
            # preset mode
            ox, oy, _ = _dispatch_offset(video_width, video_height)

        _cached_frame = draw_plus_rgba(video_width, video_height, canvas_upscale, ox, oy)
        _cached_bytes = _cached_frame.tobytes()
    return _cached_bytes


# ──────────────────────────────────────────────
# appsrc push
# ──────────────────────────────────────────────
def push_overlay_frame() -> bool:
    global _pts
    if overlay_src is None or video_width is None: return True
    with _cache_lock:
        b = _get_cached_bytes()
    with _pts_lock:
        clock = pipeline.get_clock();  base_time = pipeline.get_base_time()
        if clock is not None and base_time != Gst.CLOCK_TIME_NONE:
            ct = clock.get_time()
            if ct > base_time: _pts = ct - base_time
        pts_now = _pts
    buf = Gst.Buffer.new_wrapped(b)
    buf.pts = buf.dts = pts_now;  buf.duration = _duration
    ret = overlay_src.emit("push-buffer", buf)
    if ret == Gst.FlowReturn.FLUSHING: return False
    return True


def overlay_push_loop() -> None:
    global overlay_thread_running
    print("[INFO] Overlay heartbeat thread started")
    _upscale_ready_event.wait(timeout=5.0)
    while overlay_thread_running:
        _scale_event.clear()
        next_push = time.monotonic() + HEARTBEAT_SEC
        if not push_overlay_frame(): break
        remaining = next_push - time.monotonic()
        if remaining > 0: _scale_event.wait(timeout=remaining)
    print("[INFO] Overlay heartbeat thread stopped")


# ──────────────────────────────────────────────
# Request handlers
# ──────────────────────────────────────────────
def _invalidate_cache_and_wake():
    """Invalidate frame cache and wake heartbeat. Must be called with _cache_lock held."""
    global _cached_frame, _cached_bytes
    _cached_frame = None;  _cached_bytes = None;  _scale_event.set()


def request_set_scale(scale):
    global current_scale
    scale = max(MIN_SCALE, min(MAX_SCALE, scale))
    write_scale_file(scale)
    with _cache_lock:
        current_scale = scale;  _invalidate_cache_and_wake()


def request_set_position(pan, tilt, zoom):
    global _cur_pan, _cur_tilt, _cur_zoom
    if video_width is None:
        _cur_pan, _cur_tilt, _cur_zoom = pan, tilt, zoom;  return False
    # preset mode: PTZ doesn't affect plus position at all
    if _current_mode == "preset":
        _cur_pan, _cur_tilt, _cur_zoom = pan, tilt, zoom;  return False
    old = _dispatch_offset(video_width, video_height)
    _cur_pan, _cur_tilt, _cur_zoom = pan, tilt, zoom
    new = _dispatch_offset(video_width, video_height)
    if (old[2] != new[2]) or (new[2] and (abs(new[0]-old[0]) >= 1.0 or abs(new[1]-old[1]) >= 1.0)):
        with _cache_lock: _invalidate_cache_and_wake()
        return True
    return False


def request_set_reference(pan, tilt, zoom):
    global _ref_pan, _ref_tilt, _ref_zoom
    _ref_pan, _ref_tilt, _ref_zoom = pan, tilt, zoom
    print(f"[INFO] Reference: pan={pan} tilt={tilt} zoom={zoom}")
    with _cache_lock: _invalidate_cache_and_wake()


def request_snapshot_reference():
    global _ref_pan, _ref_tilt, _ref_zoom
    _ref_pan, _ref_tilt, _ref_zoom = _cur_pan, _cur_tilt, _cur_zoom
    print(f"[INFO] Ref snapshotted: pan={_ref_pan} tilt={_ref_tilt} zoom={_ref_zoom}")
    try:
        with open(PLUS_REF_FILE, "w") as f:
            f.write(f"{_ref_pan},{_ref_tilt},{_ref_zoom}\n")
    except Exception as e:
        print(f"[WARN] Could not write ref file: {e}")
    with _cache_lock: _invalidate_cache_and_wake()
    return (_ref_pan, _ref_tilt, _ref_zoom)


def request_set_mode(mode: str):
    global _current_mode
    with _cache_lock:
        _current_mode = mode;  _invalidate_cache_and_wake()
    print(f"[INFO] Mode: {mode}")


def request_set_preset_position(position: str):
    global _current_mode, _preset_position
    with _cache_lock:
        _preset_position = position;  _current_mode = "preset"
        _invalidate_cache_and_wake()
    print(f"[INFO] Preset position: {position}")


def request_set_flip(flip_h=None, flip_v=None):
    global _flip_h, _flip_v
    changed = False
    if flip_h is not None and flip_h != _flip_h: _flip_h = flip_h;  changed = True;  print(f"[INFO] flip_h={_flip_h}")
    if flip_v is not None and flip_v != _flip_v: _flip_v = flip_v;  changed = True;  print(f"[INFO] flip_v={_flip_v}")
    if changed:
        with _cache_lock: _invalidate_cache_and_wake()


def request_set_k(kh: float, kv: float,
                  kh2: float = None, kv2: float = None) -> None:
    """Sets radial correction coefficients. None = leave unchanged."""
    global _radial_kh, _radial_kv, _radial_kh2, _radial_kv2
    _radial_kh = kh
    _radial_kv = kv
    if kh2 is not None: _radial_kh2 = kh2
    if kv2 is not None: _radial_kv2 = kv2
    print(f"[INFO] radial_kh={_radial_kh:.4f} kv={_radial_kv:.4f} "
          f"kh2={_radial_kh2:.4f} kv2={_radial_kv2:.4f}")
    with _cache_lock: _invalidate_cache_and_wake()


# ──────────────────────────────────────────────
# mypreset mode: FOV override setter
# ──────────────────────────────────────────────
def _set_fov_override(value):
    global _fov_override
    with _fov_override_lock:
        _fov_override = value
    with _cache_lock:
        _invalidate_cache_and_wake()


# ──────────────────────────────────────────────
# HTTP server
# ──────────────────────────────────────────────
class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        qs     = parse_qs(parsed.query)

        # ── /scale ────────────────────────────────────────────────────────────
        if path == "/scale":
            if "value" not in qs: return self._respond(400, b"Missing value\n")
            try: val = float(qs["value"][0])
            except ValueError: return self._respond(400, b"Invalid value\n")
            request_set_scale(val)
            return self._respond(200, f"OK scale={val:.3f}\n".encode())

        # ── /pos ──────────────────────────────────────────────────────────────
        elif path == "/pos":
            try:
                pan  = int(qs["pan"][0])
                tilt = int(qs["tilt"][0])
                zoom = int(qs["zoom"][0])
            except (KeyError, ValueError):
                return self._respond(400, b"Missing/invalid pan,tilt,zoom\n")
            redrawn = request_set_position(pan, tilt, zoom)
            return self._respond(200, f"OK pan={pan} tilt={tilt} zoom={zoom} redrawn={redrawn}\n".encode())

        # ── /ref ──────────────────────────────────────────────────────────────
        elif path == "/ref":
            try:
                pan  = int(qs["pan"][0])
                tilt = int(qs["tilt"][0])
                zoom = int(qs["zoom"][0])
            except (KeyError, ValueError):
                return self._respond(400, b"Missing/invalid pan,tilt,zoom\n")
            request_set_reference(pan, tilt, zoom)
            return self._respond(200, f"OK ref pan={pan} tilt={tilt} zoom={zoom}\n".encode())

        # ── /setref ───────────────────────────────────────────────────────────
        elif path == "/setref":
            pan, tilt, zoom = request_snapshot_reference()
            return self._respond(200, f"OK ref snapshotted pan={pan} tilt={tilt} zoom={zoom}\n".encode())

        # ── /mode ─────────────────────────────────────────────────────────────
        elif path == "/mode":
            val = qs.get("value", [None])[0]
            if val not in VALID_MODES:
                return self._respond(400,
                    f"value must be one of: {', '.join(VALID_MODES)}\n".encode())
            if val in ("auto", "mypreset"):
                # Both tracking modes snapshot current PTZ as reference on switch
                request_snapshot_reference()
                request_set_mode(val)
            else:
                # preset — keep existing _preset_position, just switch mode
                request_set_mode("preset")
            return self._respond(200, f"OK mode={val}\n".encode())

        # ── /setk ─────────────────────────────────────────────────────────────
        # Radial correction. h/v = K1 (mid-range).  h2/v2 = K2 (edge).
        # curl "http://192.168.25.51:8080/setk?h=0.25&v=0.20&h2=0.05&v2=0.04"
        # Omit any param to leave it unchanged.
        elif path == "/setk":
            new_kh = new_kv = new_kh2 = new_kv2 = None
            for param, setter in [("h","kh"),("v","kv"),("h2","kh2"),("v2","kv2")]:
                if param in qs:
                    try:
                        val = float(qs[param][0])
                        if not math.isfinite(val):
                            return self._respond(400,
                                f"{param} must be a finite number\n".encode())
                        if setter == "kh":   new_kh  = val
                        elif setter == "kv":  new_kv  = val
                        elif setter == "kh2": new_kh2 = val
                        elif setter == "kv2": new_kv2 = val
                    except ValueError:
                        return self._respond(400, f"Invalid {param}\n".encode())
            # Legacy: ?value=X sets kh and kv
            if "value" in qs and new_kh is None and new_kv is None:
                try:
                    val = float(qs["value"][0])
                    if not math.isfinite(val):
                        return self._respond(400, b"value must be a finite number\n")
                    new_kh = new_kv = val
                except ValueError:
                    return self._respond(400, b"Invalid value\n")
            if all(v is None for v in [new_kh, new_kv, new_kh2, new_kv2]):
                return self._respond(400, b"Missing h, v, h2, v2, or value\n")
            kh_s  = new_kh  if new_kh  is not None else _radial_kh
            kv_s  = new_kv  if new_kv  is not None else _radial_kv
            kh2_s = new_kh2 if new_kh2 is not None else _radial_kh2
            kv2_s = new_kv2 if new_kv2 is not None else _radial_kv2
            request_set_k(kh_s, kv_s, kh2_s, kv2_s)
            return self._respond(200,
                f"OK kh={kh_s:.4f} kv={kv_s:.4f} "
                f"kh2={kh2_s:.4f} kv2={kv2_s:.4f}\n".encode())

        # ── /flip ─────────────────────────────────────────────────────────────
        elif path == "/flip":
            new_h = new_v = None
            if "h" in qs:
                if qs["h"][0] not in ("0", "1"): return self._respond(400, b"h must be 0 or 1\n")
                new_h = qs["h"][0] == "1"
            if "v" in qs:
                if qs["v"][0] not in ("0", "1"): return self._respond(400, b"v must be 0 or 1\n")
                new_v = qs["v"][0] == "1"
            if new_h is None and new_v is None:
                return self._respond(400, b"Missing h or v\n")
            request_set_flip(flip_h=new_h, flip_v=new_v)
            return self._respond(200, f"OK flip_h={_flip_h} flip_v={_flip_v}\n".encode())

        # ── /setfovnow (mypreset calibration) ────────────────────────────────
        elif path == "/setfovnow":
            new_h = new_v = None
            if "h" in qs:
                try:
                    new_h = float(qs["h"][0])
                    if not (0.01 <= new_h <= 180.0):
                        return self._respond(400, b"h must be 0.01~180\n")
                except ValueError:
                    return self._respond(400, b"Invalid h\n")
            if "v" in qs:
                try:
                    new_v = float(qs["v"][0])
                    if not (0.01 <= new_v <= 180.0):
                        return self._respond(400, b"v must be 0.01~180\n")
                except ValueError:
                    return self._respond(400, b"Invalid v\n")
            if new_h is None or new_v is None:
                return self._respond(400, b"Both h and v required\n")
            zr = max(ZOOM_RAW_X1, min(float(_cur_zoom), ZOOM_RAW_MAX))
            _set_fov_override((zr, new_h, new_v))
            print(f"[INFO] FOV override: zoom_raw={zr:.0f} hfov={new_h} vfov={new_v}")
            hf, vf, kh_tbl, kv_tbl = _zoom_raw_to_fov(_cur_zoom)
            return self._respond(200,
                f"OK setfovnow zoom_raw={zr:.0f} hfov={hf:.6f} vfov={vf:.6f}\n".encode())

        # ── /savefov (mypreset calibration) ──────────────────────────────────
        elif path == "/savefov":
            zr = max(ZOOM_RAW_X1, min(float(_cur_zoom), ZOOM_RAW_MAX))
            with _fov_override_lock:
                ov = _fov_override
            if ov is not None and abs(ov[0] - zr) <= 10.0:
                hf, vf = ov[1], ov[2]
            else:
                hf, vf, _, _, _, _ = _zoom_raw_to_fov_log(zr)
            # Kh/Kv/Kh2/Kv2: use live value if set, else preserve existing table
            _, _, kh_tbl, kv_tbl, kh2_tbl, kv2_tbl = _zoom_raw_to_fov(int(zr))
            kh_save  = _radial_kh  if _radial_kh  != 0.0 else kh_tbl
            kv_save  = _radial_kv  if _radial_kv  != 0.0 else kv_tbl
            kh2_save = _radial_kh2 if _radial_kh2 != 0.0 else kh2_tbl
            kv2_save = _radial_kv2 if _radial_kv2 != 0.0 else kv2_tbl
            print(f"[INFO] Saving zoom_raw={zr:.0f} hfov={hf:.4f} vfov={vf:.4f} "
                  f"kh={kh_save:.4f} kv={kv_save:.4f} "
                  f"kh2={kh2_save:.4f} kv2={kv2_save:.4f}")
            if not _save_fov_cal_entry(zr, hf, vf, kh_save, kv_save, kh2_save, kv2_save):
                return self._respond(500, b"Failed to save FOV entry\n")
            return self._respond(200,
                f"OK saved zoom_raw={zr:.0f} hfov={hf:.6f} vfov={vf:.6f} "
                f"kh={kh_save:.6f} kv={kv_save:.6f} "
                f"kh2={kh2_save:.6f} kv2={kv2_save:.6f}\n".encode())

        # ── /reloadfov (mypreset calibration) ────────────────────────────────
        elif path == "/reloadfov":
            # Reload table from file.
            # Clears all live overrides — FOV and K — so table values take over
            # immediately for every zoom level without restarting Python.
            loaded = _load_fov_cal_table()
            _set_fov_override(None)
            request_set_k(0.0, 0.0, 0.0, 0.0)
            with _fov_cal_lock: n = len(_fov_cal_table)
            return self._respond(200, f"OK reloaded {n} points loaded={loaded}\n".encode())

        # ── /status ───────────────────────────────────────────────────────────
        elif path == "/status":
            if video_width:
                ox, oy, in_fov = _dispatch_offset(video_width, video_height)
                plus_x = (video_width  / 2.0 + ox) * canvas_upscale
                plus_y = (video_height / 2.0 + oy) * canvas_upscale
            else:
                ox = oy = plus_x = plus_y = 0.0;  in_fov = True

            # Mode-specific FOV info
            if _current_mode == "auto":
                zoom_mag = max(1.0, _cur_zoom / ZOOM_RAW_X1)
                hf = hfov_x1 / zoom_mag
                vf = vfov_x1 / zoom_mag
                kh_table = kv_table = kh2_table = kv2_table = 0.0
                fov_src = "auto_ratio"
            elif _current_mode == "mypreset":
                hf, vf, kh_table, kv_table, kh2_table, kv2_table = (
                    _zoom_raw_to_fov(_cur_zoom) if video_width
                    else (_live_hfov_x1, _live_vfov_x1, 0.0, 0.0, 0.0, 0.0))
                with _fov_cal_lock: n_cal = len(_fov_cal_table)
                with _fov_override_lock: ov = _fov_override
                if ov is not None and video_width:
                    fov_src = f"override(zoom={ov[0]:.0f})"
                elif n_cal >= 1:
                    fov_src = "optical_scale"
                else:
                    fov_src = "log_curve"
            else:
                hf = vf = kh_table = kv_table = kh2_table = kv2_table = 0.0
                fov_src = "preset"

            with _fov_cal_lock: n_cal = len(_fov_cal_table)

            body = (
                f"mode={_current_mode}\n"
                f"preset_position={_preset_position}\n"
                f"ref_pan={_ref_pan} ref_tilt={_ref_tilt} ref_zoom={_ref_zoom}\n"
                f"cur_pan={_cur_pan} cur_tilt={_cur_tilt} cur_zoom={_cur_zoom}\n"
                f"offset_x={ox:.1f} offset_y={oy:.1f} in_fov={in_fov}\n"
                f"plus_x={plus_x:.1f} plus_y={plus_y:.1f}\n"
                f"canvas={video_width}x{video_height} upscale={canvas_upscale}\n"
                f"flip_h={_flip_h} flip_v={_flip_v}\n"
                f"hfov_x1={_live_hfov_x1} vfov_x1={_live_vfov_x1}\n"
                f"hfov_max={_live_hfov_max} vfov_max={_live_vfov_max}\n"
                f"hfov_now={hf:.4f} vfov_now={vf:.4f}\n"
                f"fov_source={fov_src}\n"
                f"fov_cal_points={n_cal}\n"
                f"fov_cal_h={FOV_CAL_H} fov_cal_v={FOV_CAL_V}\n"
                f"kh_table={kh_table:.4f}  kv_table={kv_table:.4f}\n"
                f"kh2_table={kh2_table:.4f} kv2_table={kv2_table:.4f}\n"
                f"radial_kh={_radial_kh:.4f}  radial_kv={_radial_kv:.4f}\n"
                f"radial_kh2={_radial_kh2:.4f} radial_kv2={_radial_kv2:.4f}\n"
                f"kh_effective={(_radial_kh  if _radial_kh  != 0.0 else kh_table):.4f}\n"
                f"kv_effective={(_radial_kv  if _radial_kv  != 0.0 else kv_table):.4f}\n"
                f"kh2_effective={(_radial_kh2 if _radial_kh2 != 0.0 else kh2_table):.4f}\n"
                f"kv2_effective={(_radial_kv2 if _radial_kv2 != 0.0 else kv2_table):.4f}\n"
            )
            return self._respond(200, body.encode())

        else:
            return self._respond(404, b"Not Found\n")

    def _respond(self, code, body):
        self.send_response(code);  self.end_headers();  self.wfile.write(body)

    def log_message(self, format, *args):
        pass


def run_http_server(port):
    httpd = HTTPServer(("0.0.0.0", port), RequestHandler)
    print(f"[INFO] HTTP server on port {port}")
    httpd.serve_forever()


def on_bus_message(bus, message, loop):
    t = message.type
    if t == Gst.MessageType.ERROR:
        err, debug = message.parse_error();  print("[ERROR]", err, debug);  loop.quit()
    elif t == Gst.MessageType.EOS:
        print("[INFO] EOS");  loop.quit()
    return True


# ──────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Plus-sign overlay — modes: auto / preset / mypreset"
    )
    parser.add_argument("--pipeline",    required=True)
    parser.add_argument("--http-port",   type=int, default=8080)
    parser.add_argument("--moji_color",  default="white",  choices=list(COLOR_MAP.keys()))
    parser.add_argument("--frame_color", default="black",  choices=list(COLOR_MAP.keys()))
    parser.add_argument("--hfov",        type=float, default=HFOV_X1_DEFAULT,
                        help=f"Camera HFOV at zoom x1 (default: {HFOV_X1_DEFAULT}°)")
    parser.add_argument("--vfov",        type=float, default=VFOV_X1_DEFAULT,
                        help=f"Camera VFOV at zoom x1 (default: {VFOV_X1_DEFAULT}°)")
    parser.add_argument("--hfov-max",    type=float, default=HFOV_MAX_DEFAULT, dest="hfov_max",
                        help=f"Camera HFOV at max zoom (default: {HFOV_MAX_DEFAULT}°)")
    parser.add_argument("--vfov-max",    type=float, default=VFOV_MAX_DEFAULT, dest="vfov_max",
                        help=f"Camera VFOV at max zoom (default: {VFOV_MAX_DEFAULT}°)")
    parser.add_argument("--flip-h", action="store_true", default=False,
                        help="Horizontal flip — inverts offset_x")
    parser.add_argument("--flip-v", action="store_true", default=False,
                        help="Vertical flip   — inverts offset_y")
    parser.add_argument("--radial-k", type=float, default=0.0, dest="radial_k",
                        help="Radial K1 for both H and V (default: 0.0)")
    parser.add_argument("--radial-kh",  type=float, default=None, dest="radial_kh",
                        help="Radial K1 H only (pan/left-right)")
    parser.add_argument("--radial-kv",  type=float, default=None, dest="radial_kv",
                        help="Radial K1 V only (tilt/up-down)")
    parser.add_argument("--radial-kh2", type=float, default=0.0,  dest="radial_kh2",
                        help="Radial K2 H — fixes residual edge drift (default: 0.0)")
    parser.add_argument("--radial-kv2", type=float, default=0.0,  dest="radial_kv2",
                        help="Radial K2 V — fixes residual edge drift (default: 0.0)")
    args = parser.parse_args()

    global pipeline, mix, overlay_src, overlay_thread_running, _overlay_thread
    global active_moji_color, active_frame_color
    global hfov_x1, vfov_x1, hfov_max, vfov_max
    global _flip_h, _flip_v, _current_mode, _preset_position
    global _cur_pan, _cur_tilt, _cur_zoom, _radial_kh, _radial_kv, _radial_kh2, _radial_kv2

    active_moji_color  = COLOR_MAP[args.moji_color]
    active_frame_color = COLOR_MAP[args.frame_color]
    hfov_x1  = args.hfov
    vfov_x1  = args.vfov
    hfov_max = args.hfov_max
    vfov_max = args.vfov_max
    _flip_h  = args.flip_h
    _flip_v  = args.flip_v

    base_k     = args.radial_k
    _radial_kh  = args.radial_kh  if args.radial_kh  is not None else base_k
    _radial_kv  = args.radial_kv  if args.radial_kv  is not None else base_k
    _radial_kh2 = args.radial_kh2
    _radial_kv2 = args.radial_kv2

    print(f"[INFO] moji={args.moji_color} frame={args.frame_color} "
          f"flip_h={_flip_h} flip_v={_flip_v}")
    print(f"[INFO] FOV x1: H={hfov_x1}° V={vfov_x1}°  max: H={hfov_max}° V={vfov_max}°")
    print(f"[INFO] FOV_CAL_H={FOV_CAL_H} FOV_CAL_V={FOV_CAL_V} (auto mode factors)")
    print(f"[INFO] radial_kh={_radial_kh:.4f} kv={_radial_kv:.4f} "
          f"kh2={_radial_kh2:.4f} kv2={_radial_kv2:.4f}")

    # Init log curve for mypreset mode
    _init_zoom_curves()
    # Load calibration table for mypreset mode (non-fatal if missing)
    _load_fov_cal_table()

    Gst.init(None)
    try:
        pipeline = Gst.parse_launch(args.pipeline)
    except GLib.Error as e:
        print("[ERROR]", e);  return

    mix         = pipeline.get_by_name("mix")
    overlay_src = pipeline.get_by_name("overlay_src")
    if mix is None:         print("[ERROR] 'mix' element not found");         return
    if overlay_src is None: print("[ERROR] 'overlay_src' element not found"); return
    if not _get_appsrc_caps_info(): return

    # Always start in auto mode
    _current_mode    = "auto"
    _preset_position = "center"
    load_ref_position()
    _cur_pan  = _ref_pan
    _cur_tilt = _ref_tilt
    _cur_zoom = _ref_zoom
    print(f"[INFO] Startup: mode=auto, cur=ref: pan={_cur_pan} tilt={_cur_tilt} zoom={_cur_zoom}")

    # Write mode file so watcher starts from known state
    try:
        with open(PLUS_CTL_FILE, "w") as f: f.write("auto\n")
    except Exception as e:
        print(f"[WARN] Could not write mode file: {e}")

    bus = pipeline.get_bus();  bus.add_signal_watch()
    loop = GLib.MainLoop()
    bus.connect("message", on_bus_message, loop)

    if pipeline.set_state(Gst.State.PLAYING) == Gst.StateChangeReturn.FAILURE:
        print("[ERROR] Pipeline failed to start");  return

    print("[INFO] Pipeline PLAYING")
    threading.Thread(target=_detect_upscale_thread, daemon=True).start()
    write_scale_file(DEFAULT_SCALE)

    overlay_thread_running = True
    _overlay_thread = threading.Thread(target=overlay_push_loop, daemon=True)
    _overlay_thread.start()
    threading.Thread(target=run_http_server,   args=(args.http_port,), daemon=True).start()
    threading.Thread(target=mode_file_watcher, daemon=True).start()

    print("[INFO] Endpoints: /scale /pos /ref /setref /mode /flip /setk "
          "/setfovnow /savefov /reloadfov /status")
    print(f"[INFO] Valid modes: {', '.join(VALID_MODES)}")

    try:
        loop.run()
    except KeyboardInterrupt:
        print("[INFO] Interrupted.")

    overlay_thread_running = False;  _scale_event.set()
    if _overlay_thread:
        _overlay_thread.join(timeout=3.0)
        if _overlay_thread.is_alive():
            print("[WARN] Heartbeat thread did not exit cleanly")

    pipeline.set_state(Gst.State.NULL)

    # Write auto back on shutdown so next run starts in auto
    try:
        with open(PLUS_CTL_FILE, "w") as f: f.write("auto\n")
    except Exception: pass

    print("[INFO] Pipeline stopped.")


if __name__ == "__main__":
    main()