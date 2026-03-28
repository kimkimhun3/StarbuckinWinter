import argparse
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

MIN_SCALE       = 0.3
MAX_SCALE       = 3.0
DEFAULT_SCALE   = 1.0
OVERLAY_FPS     = 30        # fallback — overwritten by appsrc caps at startup

SCALE_FILE_PATH = "/root/.reti_pattmag_file"

pipeline               = None
mix                    = None
overlay_src            = None

video_width            = None   # read from appsrc caps at startup
video_height           = None   # read from appsrc caps at startup

current_scale          = DEFAULT_SCALE
overlay_thread_running = False

# Buffer timestamp tracking
_pts      = 0
_duration = 0   # set after OVERLAY_FPS is known

# Cached frame — invalidated on scale change, redrawn once, reused until next change
_cached_frame = None


# ──────────────────────────────────────────────
# Scale file
# ──────────────────────────────────────────────
def write_scale_file(scale: float) -> None:
    try:
        with open(SCALE_FILE_PATH, "w") as f:
            f.write(f"{scale:.3f}\n")
    except Exception as e:
        print(f"[WARN] Failed to write scale to {SCALE_FILE_PATH}: {e}")


# ──────────────────────────────────────────────
# Read canvas size + FPS from appsrc caps
# Called BEFORE pipeline starts.
# Avoids compositor deadlock — video_width/height known before first push.
# ──────────────────────────────────────────────
def _get_appsrc_caps_info() -> bool:
    global OVERLAY_FPS, _duration, video_width, video_height

    caps = overlay_src.get_property("caps")
    if caps is None:
        print("[ERROR] appsrc has no caps set")
        return False

    s = caps.get_structure(0)

    ok_w, w = s.get_int("width")
    ok_h, h = s.get_int("height")
    if not (ok_w and ok_h):
        print("[ERROR] Could not read width/height from appsrc caps")
        return False
    video_width  = w
    video_height = h

    ok, num, den = s.get_fraction("framerate")
    if ok and den > 0:
        OVERLAY_FPS = num / den
    else:
        print(f"[WARN] Could not read framerate from appsrc caps, using fallback {OVERLAY_FPS} fps")

    _duration = int(Gst.SECOND / OVERLAY_FPS)
    print(f"[INFO] Canvas: {video_width}x{video_height}, FPS: {OVERLAY_FPS}")
    return True


# ──────────────────────────────────────────────
# OpenCV crosshair drawing
#
# Canvas: always full video resolution (width x height).
# Lines:  always span full width and full height — never affected by scale.
# scale:  only affects unit_px — tick spacing and label density.
#
# unit_px = (height * scale / 2) / 50.0
#   This matches the original PNG base: overlay_size = video_height * scale
#   50 units = center to top/bottom edge at scale=1.0
#
# zoom x1  → scale=0.300 → unit_px=3.24  → dense ticks, many labels
# zoom x10 → scale=1.000 → unit_px=10.8  → medium
# zoom x40 → scale=2.800 → unit_px=30.24 → sparse ticks, few labels
#
# Frame is cached — only redrawn when scale changes.
# During stable zoom: same cached bytes pushed every tick (like imagefreeze).
# ──────────────────────────────────────────────
def draw_reticle_rgba(width: int, height: int, scale: float) -> np.ndarray:
    canvas = np.zeros((height, width, 4), dtype=np.uint8)
    cx, cy = width // 2, height // 2

    black          = (0, 0, 0, 255)
    line_thickness = 1
    tick_thickness = 1
    major_len      = 8
    minor_len      = 4
    font           = cv2.FONT_HERSHEY_SIMPLEX
    font_scale     = 0.4
    font_thickness = 1
    label_offset   = 10

    # unit_px based on video_height * scale — resolution independent
    unit_px = max(1.0, (height * scale / 2) / 50.0)

    # Minimum pixel gap between labels to avoid overlap
    sample_w = cv2.getTextSize("000", font, font_scale, font_thickness)[0][0]
    min_label_gap = sample_w + 6

    # ── Full screen crosshair lines — always fixed regardless of scale ──
    cv2.line(canvas, (0, cy),  (width - 1, cy),  black, line_thickness, cv2.LINE_AA)
    cv2.line(canvas, (cx, 0),  (cx, height - 1), black, line_thickness, cv2.LINE_AA)

    max_h = int(cx / unit_px) + 1
    max_v = int(cy / unit_px) + 1

    # ── Horizontal ticks + labels ──
    last_label_px_pos = None
    last_label_px_neg = None

    for i in range(10, max_h + 1, 10):
        px_pos = int(cx + i * unit_px)
        px_neg = int(cx - i * unit_px)

        for px, is_pos in [(px_pos, True), (px_neg, False)]:
            if px < 0 or px >= width:
                continue

            # Major tick
            cv2.line(canvas, (px, cy - major_len), (px, cy + major_len),
                     black, tick_thickness, cv2.LINE_AA)

            # Label — skip if too close to previous on same side
            last_ref = last_label_px_pos if is_pos else last_label_px_neg
            if last_ref is None or abs(px - last_ref) >= min_label_gap:
                label       = str(i)
                (tw, th), _ = cv2.getTextSize(label, font, font_scale, font_thickness)
                x = max(2, min(px - tw // 2, width - tw - 2))
                y = max(th + 2, cy - label_offset)
                cv2.putText(canvas, label, (x, y),
                            font, font_scale, black, font_thickness, cv2.LINE_AA)
                if is_pos:
                    last_label_px_pos = px
                else:
                    last_label_px_neg = px

        # Minor ticks between major ticks
        for step in range(5, 10, 5):
            for sign in [1, -1]:
                px_minor = int(cx + (i - step) * sign * unit_px)
                if 0 <= px_minor < width:
                    cv2.line(canvas,
                             (px_minor, cy - minor_len),
                             (px_minor, cy + minor_len),
                             black, tick_thickness, cv2.LINE_AA)

    # ── Vertical ticks + labels ──
    last_label_py_pos = None
    last_label_py_neg = None

    for i in range(10, max_v + 1, 10):
        py_pos = int(cy + i * unit_px)
        py_neg = int(cy - i * unit_px)

        for py, is_pos in [(py_pos, True), (py_neg, False)]:
            if py < 0 or py >= height:
                continue

            # Major tick
            cv2.line(canvas, (cx - major_len, py), (cx + major_len, py),
                     black, tick_thickness, cv2.LINE_AA)

            # Label — skip if too close to previous on same side
            last_ref = last_label_py_pos if is_pos else last_label_py_neg
            if last_ref is None or abs(py - last_ref) >= min_label_gap:
                label       = str(i)
                (tw, th), _ = cv2.getTextSize(label, font, font_scale, font_thickness)
                x = min(cx + label_offset, width - tw - 2)
                y = max(th + 2, min(py + th // 2, height - 2))
                cv2.putText(canvas, label, (x, y),
                            font, font_scale, black, font_thickness, cv2.LINE_AA)
                if is_pos:
                    last_label_py_pos = py
                else:
                    last_label_py_neg = py

        # Minor ticks between major ticks
        for step in range(5, 10, 5):
            for sign in [1, -1]:
                py_minor = int(cy + (i - step) * sign * unit_px)
                if 0 <= py_minor < height:
                    cv2.line(canvas,
                             (cx - minor_len, py_minor),
                             (cx + minor_len, py_minor),
                             black, tick_thickness, cv2.LINE_AA)

    return cv2.cvtColor(canvas, cv2.COLOR_BGRA2RGBA)


# ──────────────────────────────────────────────
# Frame cache
# draw_reticle_rgba() called only when scale changes.
# All other pushes reuse the same cached bytes — like imagefreeze.
# ──────────────────────────────────────────────
def _get_cached_frame() -> np.ndarray:
    global _cached_frame
    if _cached_frame is None:
        _cached_frame = draw_reticle_rgba(video_width, video_height, current_scale)
    return _cached_frame


# ──────────────────────────────────────────────
# appsrc push
# ──────────────────────────────────────────────
def push_overlay_frame() -> None:
    global _pts, _duration

    if overlay_src is None or video_width is None or video_height is None:
        return

    frame        = _get_cached_frame() # Copy
    buf          = Gst.Buffer.new_wrapped(frame.tobytes()) # Buffer referencing frame bytes without copy
    buf.pts      = _pts
    buf.duration = _duration
    _pts        += _duration

    ret = overlay_src.emit("push-buffer", buf)
    if ret != Gst.FlowReturn.OK:
        print(f"[WARN] push-buffer returned: {ret}")


def overlay_push_loop() -> None:
    """Keep appsrc fed at camera FPS. Reuses cached frame between scale changes."""
    global overlay_thread_running

    print("[INFO] Overlay push thread started")

    while overlay_thread_running:
        push_overlay_frame()
        time.sleep(1.0 / OVERLAY_FPS)

    print("[INFO] Overlay push thread stopped")


# ──────────────────────────────────────────────
# Scale request
# Called by HTTP from RETI-process.sh when zoom changes.
# Invalidates cache → redraws once → pushes immediately → loop reuses new cache.
# ──────────────────────────────────────────────
def request_set_scale(scale: float) -> None:
    global current_scale, _cached_frame

    scale         = max(MIN_SCALE, min(MAX_SCALE, scale))
    write_scale_file(scale)
    current_scale = scale
    _cached_frame = None   # invalidate — force redraw at new scale

    push_overlay_frame()   # immediate update, no waiting for next loop tick


# ──────────────────────────────────────────────
# HTTP server
# ──────────────────────────────────────────────
class ScaleRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path != "/scale":
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found\n")
            return

        qs = parse_qs(parsed.query)
        if "value" not in qs:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Missing 'value' parameter\n")
            return

        try:
            val = float(qs["value"][0])
        except ValueError:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Invalid 'value' parameter\n")
            return

        request_set_scale(val)

        self.send_response(200)
        self.end_headers()
        self.wfile.write(f"OK scale requested {val}\n".encode("utf-8"))

    def log_message(self, format, *args):
        print("[HTTP]", format % args)


def run_http_server(port: int) -> None:
    httpd = HTTPServer(("0.0.0.0", port), ScaleRequestHandler)
    print(f"[INFO] HTTP server started on port {port}")
    httpd.serve_forever()


# ──────────────────────────────────────────────
# GStreamer bus
# ──────────────────────────────────────────────
def on_bus_message(bus, message, loop):
    t = message.type
    if t == Gst.MessageType.ERROR:
        err, debug = message.parse_error()
        print("[ERROR]", err, debug)
        loop.quit()
    elif t == Gst.MessageType.EOS:
        print("[INFO] End-Of-Stream")
        loop.quit()
    return True


# ──────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Dynamic overlay — full-screen crosshair via appsrc"
    )
    parser.add_argument("--pipeline",  required=True)
    parser.add_argument("--http-port", type=int, default=8080)
    args = parser.parse_args()

    global pipeline, mix, overlay_src, overlay_thread_running

    Gst.init(None)
    GObject.threads_init()

    try:
        pipeline = Gst.parse_launch(args.pipeline)
    except GLib.Error as e:
        print("[ERROR] Failed to create pipeline:", e)
        return

    mix         = pipeline.get_by_name("mix")
    overlay_src = pipeline.get_by_name("overlay_src")

    if mix is None:
        print("[ERROR] compositor element 'mix' not found in pipeline.")
        return
    if overlay_src is None:
        print("[ERROR] appsrc element 'overlay_src' not found in pipeline.")
        return

    # Read canvas size + FPS from appsrc caps before pipeline starts.
    # video_width/height must be known before first push_overlay_frame().
    if not _get_appsrc_caps_info():
        return

    bus = pipeline.get_bus()
    bus.add_signal_watch()
    loop = GLib.MainLoop()
    bus.connect("message", on_bus_message, loop)

    ret = pipeline.set_state(Gst.State.PLAYING)
    if ret == Gst.StateChangeReturn.FAILURE:
        print("[ERROR] Failed to set pipeline to PLAYING.")
        return

    print("[INFO] Pipeline is set to PLAYING")

    write_scale_file(DEFAULT_SCALE)

    # Push first frame immediately to unblock compositor sink_1
    push_overlay_frame()

    # Keep appsrc fed in background at camera FPS
    overlay_thread_running = True
    threading.Thread(target=overlay_push_loop, daemon=True).start()

    threading.Thread(target=run_http_server, args=(args.http_port,), daemon=True).start()

    print(f"[INFO] Ready. Access: http://<board-ip>:{args.http_port}/scale?value=0.9")

    try:
        loop.run()
    except KeyboardInterrupt:
        print("[INFO] Interrupted by user.")

    overlay_thread_running = False
    pipeline.set_state(Gst.State.NULL)
    print("[INFO] Pipeline stopped.")


if __name__ == "__main__":
    main()