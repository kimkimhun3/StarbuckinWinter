#!/bin/bash

# ──────────────────────────────────────────────────────────────────────────────
# RETI-fov-cal-single.sh  v4.1
#
# Calibrates ONE zoom level in 3 phases:
#   Phase 1 — FOV  : tune HFOV and VFOV using 4 corner positions
#   Phase 2 — K1   : tune radial correction (mid-range drift)
#   Phase 3 — K2   : tune 2nd-order correction (edge drift)
#
# All tuning uses directional keys:
#   a / d  →  move plus LEFT / RIGHT  (adjusts HFOV or Kh)
#   w / s  →  move plus UP   / DOWN   (adjusts VFOV or Kv)
#   1~7    →  change step size
#   Enter  →  accept current value
#
# Usage:
#   ./RETI-fov-cal-single.sh <zoom_index> <cam_auth> <cam_ip> [http_port] [--full-band]
#
# --full-band : calibrate at min, mid AND max of the zoom band (3 entries).
#              All values within the band will be accurately covered.
#
# Examples:
#   ./RETI-fov-cal-single.sh 4 admin:123456 192.168.25.100 8080
#   ./RETI-fov-cal-single.sh 4 admin:123456 192.168.25.100 8080 --full-band
# ──────────────────────────────────────────────────────────────────────────────

CMDNAME=$(basename "$0")

if [ $# -lt 3 ]; then
    echo "Usage: $CMDNAME <zoom_index> <cam_auth> <cam_ip> [http_port] [--full-band]" 1>&2
    echo "  zoom_index: 1=x1  2=x2  ...  40=x40" 1>&2
    echo "  --full-band: calibrate min+mid+max of the zoom band (3 entries)" 1>&2
    exit 1
fi

Z_INDEX="$1"
AUTH="$2"
IPADR="$3"
HTTP_PORT="${4:-8080}"

# Parse --full-band from any remaining args
FULL_BAND=0
for arg in "$@"; do
    [ "$arg" = "--full-band" ] && FULL_BAND=1
done

MYCMD_PATH=$(cat /root/.env_file)
LOG_CMD="$MYCMD_PATH/PLOG-out.sh"
FOV_CAL_FILE="/root/.reti_fov_cal"
SETTLE_SEC=3

# ── Zoom band table ───────────────────────────────────────────────────────────
declare -A ZOOM_LABEL_MAP ZOOM_MIN_MAP ZOOM_MAX_MAP ZOOM_MID_MAP
ZOOM_LABEL_MAP[1]="x1";  ZOOM_MIN_MAP[1]="205";  ZOOM_MAX_MAP[1]="408";  ZOOM_MID_MAP[1]="306"
ZOOM_LABEL_MAP[2]="x2";  ZOOM_MIN_MAP[2]="409";  ZOOM_MAX_MAP[2]="613";  ZOOM_MID_MAP[2]="511"
ZOOM_LABEL_MAP[3]="x3";  ZOOM_MIN_MAP[3]="614";  ZOOM_MAX_MAP[3]="820";  ZOOM_MID_MAP[3]="717"
ZOOM_LABEL_MAP[4]="x4";  ZOOM_MIN_MAP[4]="821";  ZOOM_MAX_MAP[4]="1022"; ZOOM_MID_MAP[4]="921"
ZOOM_LABEL_MAP[5]="x5";  ZOOM_MIN_MAP[5]="1023"; ZOOM_MAX_MAP[5]="1227"; ZOOM_MID_MAP[5]="1125"
ZOOM_LABEL_MAP[6]="x6";  ZOOM_MIN_MAP[6]="1228"; ZOOM_MAX_MAP[6]="1432"; ZOOM_MID_MAP[6]="1330"
ZOOM_LABEL_MAP[7]="x7";  ZOOM_MIN_MAP[7]="1433"; ZOOM_MAX_MAP[7]="1633"; ZOOM_MID_MAP[7]="1533"
ZOOM_LABEL_MAP[8]="x8";  ZOOM_MIN_MAP[8]="1634"; ZOOM_MAX_MAP[8]="1838"; ZOOM_MID_MAP[8]="1736"
ZOOM_LABEL_MAP[9]="x9";  ZOOM_MIN_MAP[9]="1839"; ZOOM_MAX_MAP[9]="2044"; ZOOM_MID_MAP[9]="1941"
ZOOM_LABEL_MAP[10]="x10"; ZOOM_MIN_MAP[10]="2045"; ZOOM_MAX_MAP[10]="2255"; ZOOM_MID_MAP[10]="2150"
ZOOM_LABEL_MAP[11]="x11"; ZOOM_MIN_MAP[11]="2256"; ZOOM_MAX_MAP[11]="2454"; ZOOM_MID_MAP[11]="2355"
ZOOM_LABEL_MAP[12]="x12"; ZOOM_MIN_MAP[12]="2455"; ZOOM_MAX_MAP[12]="2661"; ZOOM_MID_MAP[12]="2558"
ZOOM_LABEL_MAP[13]="x13"; ZOOM_MIN_MAP[13]="2662"; ZOOM_MAX_MAP[13]="2864"; ZOOM_MID_MAP[13]="2763"
ZOOM_LABEL_MAP[14]="x14"; ZOOM_MIN_MAP[14]="2865"; ZOOM_MAX_MAP[14]="3077"; ZOOM_MID_MAP[14]="2971"
ZOOM_LABEL_MAP[15]="x15"; ZOOM_MIN_MAP[15]="3078"; ZOOM_MAX_MAP[15]="3277"; ZOOM_MID_MAP[15]="3177"
ZOOM_LABEL_MAP[16]="x16"; ZOOM_MIN_MAP[16]="3278"; ZOOM_MAX_MAP[16]="3476"; ZOOM_MID_MAP[16]="3377"
ZOOM_LABEL_MAP[17]="x17"; ZOOM_MIN_MAP[17]="3477"; ZOOM_MAX_MAP[17]="3691"; ZOOM_MID_MAP[17]="3584"
ZOOM_LABEL_MAP[18]="x18"; ZOOM_MIN_MAP[18]="3692"; ZOOM_MAX_MAP[18]="3898"; ZOOM_MID_MAP[18]="3795"
ZOOM_LABEL_MAP[19]="x19"; ZOOM_MIN_MAP[19]="3899"; ZOOM_MAX_MAP[19]="4090"; ZOOM_MID_MAP[19]="3994"
ZOOM_LABEL_MAP[20]="x20"; ZOOM_MIN_MAP[20]="4091"; ZOOM_MAX_MAP[20]="4293"; ZOOM_MID_MAP[20]="4192"
ZOOM_LABEL_MAP[21]="x21"; ZOOM_MIN_MAP[21]="4294"; ZOOM_MAX_MAP[21]="4496"; ZOOM_MID_MAP[21]="4395"
ZOOM_LABEL_MAP[22]="x22"; ZOOM_MIN_MAP[22]="4497"; ZOOM_MAX_MAP[22]="4729"; ZOOM_MID_MAP[22]="4613"
ZOOM_LABEL_MAP[23]="x23"; ZOOM_MIN_MAP[23]="4730"; ZOOM_MAX_MAP[23]="4903"; ZOOM_MID_MAP[23]="4816"
ZOOM_LABEL_MAP[24]="x24"; ZOOM_MIN_MAP[24]="4904"; ZOOM_MAX_MAP[24]="5135"; ZOOM_MID_MAP[24]="5019"
ZOOM_LABEL_MAP[25]="x25"; ZOOM_MIN_MAP[25]="5140"; ZOOM_MAX_MAP[25]="5303"; ZOOM_MID_MAP[25]="5221"
ZOOM_LABEL_MAP[26]="x26"; ZOOM_MIN_MAP[26]="5304"; ZOOM_MAX_MAP[26]="5495"; ZOOM_MID_MAP[26]="5399"
ZOOM_LABEL_MAP[27]="x27"; ZOOM_MIN_MAP[27]="5496"; ZOOM_MAX_MAP[27]="5700"; ZOOM_MID_MAP[27]="5598"
ZOOM_LABEL_MAP[28]="x28"; ZOOM_MIN_MAP[28]="5701"; ZOOM_MAX_MAP[28]="5905"; ZOOM_MID_MAP[28]="5803"
ZOOM_LABEL_MAP[29]="x29"; ZOOM_MIN_MAP[29]="5906"; ZOOM_MAX_MAP[29]="6110"; ZOOM_MID_MAP[29]="6008"
ZOOM_LABEL_MAP[30]="x30"; ZOOM_MIN_MAP[30]="6111"; ZOOM_MAX_MAP[30]="6314"; ZOOM_MID_MAP[30]="6212"
ZOOM_LABEL_MAP[31]="x31"; ZOOM_MIN_MAP[31]="6315"; ZOOM_MAX_MAP[31]="6519"; ZOOM_MID_MAP[31]="6417"
ZOOM_LABEL_MAP[32]="x32"; ZOOM_MIN_MAP[32]="6520"; ZOOM_MAX_MAP[32]="6724"; ZOOM_MID_MAP[32]="6622"
ZOOM_LABEL_MAP[33]="x33"; ZOOM_MIN_MAP[33]="6725"; ZOOM_MAX_MAP[33]="6929"; ZOOM_MID_MAP[33]="6827"
ZOOM_LABEL_MAP[34]="x34"; ZOOM_MIN_MAP[34]="6930"; ZOOM_MAX_MAP[34]="7134"; ZOOM_MID_MAP[34]="7032"
ZOOM_LABEL_MAP[35]="x35"; ZOOM_MIN_MAP[35]="7135"; ZOOM_MAX_MAP[35]="7320"; ZOOM_MID_MAP[35]="7227"
ZOOM_LABEL_MAP[36]="x36"; ZOOM_MIN_MAP[36]="7321"; ZOOM_MAX_MAP[36]="7525"; ZOOM_MID_MAP[36]="7423"
ZOOM_LABEL_MAP[37]="x37"; ZOOM_MIN_MAP[37]="7526"; ZOOM_MAX_MAP[37]="7678"; ZOOM_MID_MAP[37]="7602"
ZOOM_LABEL_MAP[38]="x38"; ZOOM_MIN_MAP[38]="7679"; ZOOM_MAX_MAP[38]="7883"; ZOOM_MID_MAP[38]="7781"
ZOOM_LABEL_MAP[39]="x39"; ZOOM_MIN_MAP[39]="7884"; ZOOM_MAX_MAP[39]="8088"; ZOOM_MID_MAP[39]="7986"
ZOOM_LABEL_MAP[40]="x40"; ZOOM_MIN_MAP[40]="8089"; ZOOM_MAX_MAP[40]="8192"; ZOOM_MID_MAP[40]="8140"

# ── Validate input ────────────────────────────────────────────────────────────
Z_LABEL="${ZOOM_LABEL_MAP[$Z_INDEX]}"
Z_MIN="${ZOOM_MIN_MAP[$Z_INDEX]}"
Z_MAX="${ZOOM_MAX_MAP[$Z_INDEX]}"
Z_MID="${ZOOM_MID_MAP[$Z_INDEX]}"
if [ -z "$Z_MID" ]; then
    echo "[$CMDNAME][ERROR] Invalid zoom_index: $Z_INDEX (valid: 1~40)" 1>&2
    exit 1
fi

# ── Helpers ───────────────────────────────────────────────────────────────────
sep() { echo "  ────────────────────────────────────────────────────────────"; }
hdr() { echo ""; echo "  ════════════════════════════════════════════════════════════"; echo "  $1"; echo "  ════════════════════════════════════════════════════════════"; }
ok()  { echo "  ✓ $1"; }
step(){ echo "  ▶ $1"; }
warn(){ echo "  ⚠ $1"; }

# Safe float arithmetic — works with negative values on all Python versions
pyf() {
    python3 -c "v = $1; print(f'{v:.4f}')"
}

fetch_ptz() {
    local RES PAN TILT ZOOM
    RES=$(curl --silent --digest -u "$AUTH" \
        "http://${IPADR}/httpapi/SendPTZ?action=sendptz&PTZ_GETPOSITION=0")
    [ -z "$RES" ] && return 1
    PAN=$(awk  -F'[=,]' '{print $2}' <<< "$RES" | tr -d '\r\n')
    TILT=$(awk -F'[=,]' '{print $3}' <<< "$RES" | tr -d '\r\n')
    ZOOM=$(awk -F'[=,]' '{print $4}' <<< "$RES" | tr -d '\r\n')
    [ -z "$PAN" ] || [ -z "$TILT" ] || [ -z "$ZOOM" ] && return 1
    echo "$PAN $TILT $ZOOM"
}

cam_move() {
    # cam_move PAN TILT ZOOM
    # Focus value selected based on zoom level from physical measurement table
    local FOCUS
    FOCUS=$(python3 -c "
z = int('$Z_MID')
# Focus value table: (zoom_min, focus_value)
table = [
    (205,  65512), (409,  64480), (614,  64648), (821,  65156),
    (1023, 189),   (1228, 675),   (1433, 1078),  (1634, 1412),
    (1839, 1648),  (2045, 1811),  (2256, 1868),  (2455, 1891),
    (2662, 1822),  (2865, 1777),  (3078, 1609),  (3278, 1547),
    (3477, 1198),  (3692, 997),   (3899, 850),   (4091, 590),
    (4294, 350),   (4497, 144),   (4730, 65441), (4904, 65200),
    (5140, 64773), (5304, 64575), (5496, 64507), (5701, 64339),
    (5906, 64017), (6111, 64105), (6315, 63928), (6520, 63721),
    (6725, 63471), (6930, 63270), (7135, 63047), (7321, 62911),
    (7526, 62696), (7679, 62299), (7884, 62485), (8089, 62529),
]
# Find closest matching zoom_min entry
best = table[0][1]
best_diff = abs(z - table[0][0])
for zmin, fval in table:
    diff = abs(z - zmin)
    if diff < best_diff:
        best_diff = diff
        best = fval
print(best)
")
    curl --silent --digest -u "$AUTH" \
        "http://${IPADR}/httpapi/SendPTZ?action=sendptz&PTZ_ABSOLUTEPOSITION=$1,$2,$3,$FOCUS" \
        > /dev/null
}

autofocus() {
    curl --silent --digest -u "$AUTH" \
        "http://${IPADR}/httpapi/SendPTZ?action=PTZ_FOCUSAUTO=1" > /dev/null
    sleep 1
}

py_call() {
    local RESP CODE
    RESP=$(curl --silent --write-out "\n%{http_code}" "http://0.0.0.0:${HTTP_PORT}$1")
    CODE=$(echo "$RESP" | tail -n1)
    BODY=$(echo "$RESP" | head -n-1)
    [ "$CODE" = "200" ] && { echo "$BODY"; return 0; }
    return 1
}

get_status() {
    py_call "/status" 2>/dev/null
}

get_plus_xy() {
    local ST="$1"
    PLX=$(echo "$ST" | grep "plus_x=" | grep -oP "plus_x=\K[0-9.]+")
    PLY=$(echo "$ST" | grep "plus_y=" | grep -oP "plus_y=\K[0-9.]+")
}

# auto step size based on FOV
auto_step() {
    python3 << PYEOF
h = float("$1")
if   h > 30.0: print("0.50")
elif h > 10.0: print("0.20")
elif h >  3.0: print("0.05")
else:          print("0.02")
PYEOF
}

# ── Phase 1: tune_corner ──────────────────────────────────────────────────────
# Tune HFOV (H) and VFOV (V) at one corner position.
# Keys:  a=left  d=right  w=up  s=down  1~7=step  Enter=accept
# Sets globals: TUNED_H  TUNED_V
tune_corner() {
    local C_NAME="$1" Z_RAW="$2" CUR_H="$3" CUR_V="$4" EXP_X="$5" EXP_Y="$6"
    local STEP KEY ST PLX PLY NEW_H NEW_V DIFF_X DIFF_Y

    STEP=$(auto_step "$CUR_H")
    py_call "/setfovnow?h=${CUR_H}&v=${CUR_V}" > /dev/null

    while true; do
        ST=$(get_status)
        get_plus_xy "$ST"

        # Pixel difference from target
        DIFF_X=$(python3 << PYEOF
px = float("${PLX:-960}")
tx = float("$EXP_X")
d  = px - tx
arrow = "→ move RIGHT" if d < 0 else ("← move LEFT" if d > 0 else "✓ aligned")
print(f"{d:+.0f}px  {arrow}")
PYEOF
)
        DIFF_Y=$(python3 << PYEOF
py_ = float("${PLY:-540}")
ty  = float("$EXP_Y")
d   = py_ - ty
arrow = "↓ move DOWN" if d < 0 else ("↑ move UP" if d > 0 else "✓ aligned")
print(f"{d:+.0f}px  {arrow}")
PYEOF
)

        clear
        echo ""
        echo "  ╔══════════════════════════════════════════════════════════════╗"
        printf "  ║  PHASE 1 — FOV Tuning  │  %s  │  %s  (raw=%s)\n" "$Z_LABEL" "$C_NAME" "$Z_RAW"
        echo "  ╠══════════════════════════════════════════════════════════════╣"
        printf "  ║  Target  X=%-6s  Y=%-6s\n" "$EXP_X" "$EXP_Y"
        printf "  ║  Plus    X=%-6s  Y=%-6s\n" "${PLX:-?}" "${PLY:-?}"
        echo "  ╠══════════════════════════════════════════════════════════════╣"
        printf "  ║  X diff: %-40s  ║\n" "$DIFF_X"
        printf "  ║  Y diff: %-40s  ║\n" "$DIFF_Y"
        echo "  ╠══════════════════════════════════════════════════════════════╣"
        printf "  ║  hfov=%-8s  vfov=%-8s  step=±%s°\n" "$CUR_H" "$CUR_V" "$STEP"
        echo "  ╠══════════════════════════════════════════════════════════════╣"
        echo "  ║  d = plus RIGHT   a = plus LEFT   (adjusts HFOV)           ║"
        echo "  ║  s = plus DOWN    w = plus UP     (adjusts VFOV)           ║"
        echo "  ║  1=±1.0  2=±0.5  3=±0.2  4=±0.1  5=±0.05  6=±0.02  7=±0.01 ║"
        echo "  ║  Enter = accept this corner                                ║"
        echo "  ╚══════════════════════════════════════════════════════════════╝"
        read -r -s -n1 -p "  Key: " KEY
        echo ""

        case "$KEY" in
            "")
                TUNED_H="$CUR_H"; TUNED_V="$CUR_V"
                ok "Accepted  hfov=$CUR_H°  vfov=$CUR_V°"
                break ;;
            "1") STEP="1.0";  ok "Step → ±1.0°" ;;
            "2") STEP="0.5";  ok "Step → ±0.5°" ;;
            "3") STEP="0.2";  ok "Step → ±0.2°" ;;
            "4") STEP="0.1";  ok "Step → ±0.1°" ;;
            "5") STEP="0.05"; ok "Step → ±0.05°" ;;
            "6") STEP="0.02"; ok "Step → ±0.02°" ;;
            "7") STEP="0.01"; ok "Step → ±0.01°" ;;
            "d")
                NEW_H=$(pyf "float('$CUR_H') + float('$STEP')")
                py_call "/setfovnow?h=${NEW_H}&v=${CUR_V}" > /dev/null
                CUR_H="$NEW_H"; ok "hfov=$CUR_H° → plus RIGHT" ;;
            "a")
                NEW_H=$(pyf "float('$CUR_H') - float('$STEP')")
                py_call "/setfovnow?h=${NEW_H}&v=${CUR_V}" > /dev/null
                CUR_H="$NEW_H"; ok "hfov=$CUR_H° → plus LEFT" ;;
            "s")
                NEW_V=$(pyf "float('$CUR_V') + float('$STEP')")
                py_call "/setfovnow?h=${CUR_H}&v=${NEW_V}" > /dev/null
                CUR_V="$NEW_V"; ok "vfov=$CUR_V° → plus DOWN" ;;
            "w")
                NEW_V=$(pyf "float('$CUR_V') - float('$STEP')")
                py_call "/setfovnow?h=${CUR_H}&v=${NEW_V}" > /dev/null
                CUR_V="$NEW_V"; ok "vfov=$CUR_V° → plus UP" ;;
            *) echo "  Keys: a d w s  1~7  Enter" ;;
        esac
    done
}

# ── Phase 2 & 3: tune_k ───────────────────────────────────────────────────────
tune_k() {
    local PHASE="$1"
    local KH_INIT="$2"
    local KV_INIT="$3"
    local KH_FIXED="$4"
    local KV_FIXED="$5"

    local CUR_KH="$KH_INIT"
    local CUR_KV="$KV_INIT"
    local TEST_MODE="PAN"
    local KEY ST PLX PLY NEW_K

    # ── Compute auto step and expected px change ──────────────────────────────
    local K_PCT
    [ "$PHASE" = "K1" ] && K_PCT="0.50" || K_PCT="0.80"

    local STEP PX_PER_STEP
    read -r STEP PX_PER_STEP < <(python3 -c "
import math
h      = float('$INIT_H')
pct    = float('$K_PCT')
phase  = '$PHASE'
angle  = math.radians(h / 2.0 * pct)
r      = math.tan(angle)
focal  = 960.0 / math.tan(math.radians(h / 2.0))
effect = (focal * r * r * r) if phase == 'K2' else (focal * r * r)
target = 20.0
raw_step = (target / effect) if effect > 0.001 else 0.5
step = 0.002
for s in [0.500, 0.200, 0.100, 0.050, 0.020, 0.010, 0.005, 0.002]:
    if raw_step >= s * 0.7:
        step = s
        break
px_per_step = effect * step
print(f'{step:.3f} {px_per_step:.1f}')
")
    # Safety fallback if python3 failed
    [ -z "$STEP" ]        && STEP="0.100"
    [ -z "$PX_PER_STEP" ] && PX_PER_STEP="0.0"

    # Set initial K in Python
    if [ "$PHASE" = "K1" ]; then
        py_call "/setk?h=${CUR_KH}&v=${CUR_KV}" > /dev/null
    else
        py_call "/setk?h=${KH_FIXED}&v=${KV_FIXED}&h2=${CUR_KH}&v2=${CUR_KV}" > /dev/null
    fi

    # Move to PAN test position
    step "Moving to PAN test position (+${K_PAN_UNITS} units from ref)..."
    cam_move "$K_PAN_TARGET" "$REF_TILT" "$Z_MID"
    sleep 2; autofocus
    py_call "/pos?pan=${K_PAN_TARGET}&tilt=${REF_TILT}&zoom=${Z_MID}" > /dev/null

    while true; do
        # Always refresh /pos so plus tracks current camera position
        if [ "$TEST_MODE" = "PAN" ]; then
            py_call "/pos?pan=${K_PAN_TARGET}&tilt=${REF_TILT}&zoom=${Z_MID}" > /dev/null
        else
            py_call "/pos?pan=${REF_PAN}&tilt=${K_TILT_TARGET}&zoom=${Z_MID}" > /dev/null
        fi

        ST=$(get_status)
        get_plus_xy "$ST"

        if [ "$TEST_MODE" = "PAN" ]; then
            DRIFT_INFO=$(python3 << PYEOF
px  = float("${PLX:-960}")
ref = 960.0
d   = px - ref
if   d > 5:  arrow = "← plus LEFT of center   →  Kh too LOW,  press d"
elif d < -5: arrow = "→ plus RIGHT of center  →  Kh too HIGH, press a"
else:        arrow = "✓ aligned  (drift < 5px)"
print(f"plus_x={px:.0f}   drift={d:+.0f}px   {arrow}")
PYEOF
)
            AXIS_INFO="PAN test → tune Kh   (d = Kh up = plus RIGHT,  a = Kh down = plus LEFT)"
        else
            DRIFT_INFO=$(python3 << PYEOF
py_ = float("${PLY:-540}")
ref = 540.0
d   = py_ - ref
if   d > 5:  arrow = "↑ plus ABOVE center  →  Kv too LOW,  press s"
elif d < -5: arrow = "↓ plus BELOW center  →  Kv too HIGH, press w"
else:        arrow = "✓ aligned  (drift < 5px)"
print(f"plus_y={py_:.0f}   drift={d:+.0f}px   {arrow}")
PYEOF
)
            AXIS_INFO="TILT test → tune Kv   (s = Kv up = plus DOWN,  w = Kv down = plus UP)"
        fi

        if [ "$PHASE" = "K1" ]; then
            K_DISPLAY="Kh=$CUR_KH   Kv=$CUR_KV"
        else
            K_DISPLAY="K1: Kh=$KH_FIXED Kv=$KV_FIXED  |  K2: Kh2=$CUR_KH Kv2=$CUR_KV"
        fi

        # Warn if K2 effect per step is too small to be useful
        local EFFECT_WARN=""
        if [ "$PHASE" = "K2" ]; then
            EFFECT_WARN=$(python3 << PYEOF
px = float("$PX_PER_STEP")
if px < 2.0:
    print(f"  ⚠ K2 effect = {px:.1f}px/step at this zoom — K2 may not be needed, press Enter")
else:
    print(f"  ✓ K2 effect = {px:.1f}px/step at this zoom")
PYEOF
)
        fi

        clear
        echo ""
        echo "  ╔══════════════════════════════════════════════════════════════╗"
        printf "  ║  PHASE %s — Radial Correction  │  %s  (raw=%s)\n" "$PHASE" "$Z_LABEL" "$Z_MID"
        echo "  ╠══════════════════════════════════════════════════════════════╣"
        printf "  ║  %-62s║\n" "$AXIS_INFO"
        printf "  ║  %-62s║\n" "$K_DISPLAY"
        printf "  ║  step=±%-10s  (~%.1fpx per press)%s\n" "$STEP" "$PX_PER_STEP" ""
        [ -n "$EFFECT_WARN" ] && printf "  ║  %-62s║\n" "$EFFECT_WARN"
        echo "  ╠══════════════════════════════════════════════════════════════╣"
        printf "  ║  %-62s║\n" "$DRIFT_INFO"
        echo "  ╠══════════════════════════════════════════════════════════════╣"
        echo "  ║  p = PAN test (Kh)       t = TILT test (Kv)               ║"
        echo "  ║  d / a  →  Kh +/- step  (plus right / left)              ║"
        echo "  ║  s / w  →  Kv +/- step  (plus down  / up)                ║"
        echo "  ║  r = reset current K to 0.0  (if value went too far)      ║"
        echo "  ║  0=±0.500  1=±0.200  2=±0.100  3=±0.050                  ║"
        echo "  ║  4=±0.020  5=±0.010  6=±0.005  7=±0.002                  ║"
        echo "  ║  Enter = accept                                            ║"
        echo "  ╚══════════════════════════════════════════════════════════════╝"
        read -r -s -n1 -p "  Key: " KEY
        echo ""

        case "$KEY" in
            "")
                if [ "$PHASE" = "K1" ]; then
                    TUNED_KH="$CUR_KH"; TUNED_KV="$CUR_KV"
                else
                    TUNED_KH2="$CUR_KH"; TUNED_KV2="$CUR_KV"
                fi
                ok "Accepted  Kh=$CUR_KH  Kv=$CUR_KV"
                break ;;

            "p")
                TEST_MODE="PAN"
                step "Moving to PAN test..."
                cam_move "$K_PAN_TARGET" "$REF_TILT" "$Z_MID"
                sleep 2; autofocus
                py_call "/pos?pan=${K_PAN_TARGET}&tilt=${REF_TILT}&zoom=${Z_MID}" > /dev/null
                ok "PAN test — tune Kh (d/a)" ;;

            "t")
                TEST_MODE="TILT"
                step "Moving to TILT test..."
                cam_move "$REF_PAN" "$K_TILT_TARGET" "$Z_MID"
                sleep 2; autofocus
                py_call "/pos?pan=${REF_PAN}&tilt=${K_TILT_TARGET}&zoom=${Z_MID}" > /dev/null
                ok "TILT test — tune Kv (s/w)" ;;

            "0") STEP="0.500"; ok "Step → ±0.500  (coarse)" ;;
            "1") STEP="0.200"; ok "Step → ±0.200" ;;
            "2") STEP="0.100"; ok "Step → ±0.100" ;;
            "3") STEP="0.050"; ok "Step → ±0.050" ;;
            "4") STEP="0.020"; ok "Step → ±0.020" ;;
            "5") STEP="0.010"; ok "Step → ±0.010" ;;
            "6") STEP="0.005"; ok "Step → ±0.005" ;;
            "7") STEP="0.002"; ok "Step → ±0.002" ;;

            "r")
                # Reset current axis K to 0.0
                if [ "$TEST_MODE" = "PAN" ]; then
                    CUR_KH="0.0000"
                else
                    CUR_KV="0.0000"
                fi
                if [ "$PHASE" = "K1" ]; then
                    py_call "/setk?h=${CUR_KH}&v=${CUR_KV}" > /dev/null
                else
                    py_call "/setk?h=${KH_FIXED}&v=${KV_FIXED}&h2=${CUR_KH}&v2=${CUR_KV}" > /dev/null
                fi
                ok "Reset → Kh=$CUR_KH  Kv=$CUR_KV" ;;

            "d")
                NEW_K=$(pyf "float('$CUR_KH') + float('$STEP')")
                CUR_KH="$NEW_K"
                if [ "$PHASE" = "K1" ]; then
                    py_call "/setk?h=${CUR_KH}&v=${CUR_KV}" > /dev/null
                else
                    py_call "/setk?h=${KH_FIXED}&v=${KV_FIXED}&h2=${CUR_KH}&v2=${CUR_KV}" > /dev/null
                fi
                ok "Kh=$CUR_KH  (+$STEP)  → plus moves RIGHT" ;;

            "a")
                NEW_K=$(pyf "float('$CUR_KH') - float('$STEP')")
                CUR_KH="$NEW_K"
                if [ "$PHASE" = "K1" ]; then
                    py_call "/setk?h=${CUR_KH}&v=${CUR_KV}" > /dev/null
                else
                    py_call "/setk?h=${KH_FIXED}&v=${KV_FIXED}&h2=${CUR_KH}&v2=${CUR_KV}" > /dev/null
                fi
                ok "Kh=$CUR_KH  (-$STEP)  → plus moves LEFT" ;;

            "s")
                NEW_K=$(pyf "float('$CUR_KV') + float('$STEP')")
                CUR_KV="$NEW_K"
                if [ "$PHASE" = "K1" ]; then
                    py_call "/setk?h=${CUR_KH}&v=${CUR_KV}" > /dev/null
                else
                    py_call "/setk?h=${KH_FIXED}&v=${KV_FIXED}&h2=${CUR_KH}&v2=${CUR_KV}" > /dev/null
                fi
                ok "Kv=$CUR_KV  (+$STEP)  → plus moves DOWN" ;;

            "w")
                NEW_K=$(pyf "float('$CUR_KV') - float('$STEP')")
                CUR_KV="$NEW_K"
                if [ "$PHASE" = "K1" ]; then
                    py_call "/setk?h=${CUR_KH}&v=${CUR_KV}" > /dev/null
                else
                    py_call "/setk?h=${KH_FIXED}&v=${KV_FIXED}&h2=${CUR_KH}&v2=${CUR_KV}" > /dev/null
                fi
                ok "Kv=$CUR_KV  (-$STEP)  → plus moves UP" ;;

            *) echo "  Keys: p t  d a s w  r  0~7  Enter" ;;
        esac
    done
}

# ──────────────────────────────────────────────────────────────────────────────
# calibrate_at ZOOM_RAW SUB_LABEL INIT_H_OVERRIDE INIT_V_OVERRIDE
#
# Runs the full 3-phase calibration at a specific zoom_raw value.
#   $1 = zoom_raw to use (e.g. 821 for x4 min)
#   $2 = sub-label for display (e.g. "min", "mid", "max")
#   $3 = starting HFOV estimate (optional, pass "" to auto-detect)
#   $4 = starting VFOV estimate (optional, pass "" to auto-detect)
#
# On success, sets globals: FINAL_H FINAL_V FINAL_KH FINAL_KV FINAL_KH2 FINAL_KV2
# ──────────────────────────────────────────────────────────────────────────────
calibrate_at() {
    local CAL_RAW="$1"
    local SUB_LABEL="$2"
    local OVERRIDE_H="$3"
    local OVERRIDE_V="$4"

    # Override Z_MID for this calibration run
    Z_MID="$CAL_RAW"

$LOG_CMD "[$CMDNAME][INFOM] v4.1 start: $Z_LABEL/$SUB_LABEL zoom_raw=$CAL_RAW (band $Z_MIN~$Z_MAX)"

hdr "RETI FOV Calibration v4.1 — $Z_LABEL/$SUB_LABEL  (zoom_raw=$CAL_RAW, band $Z_MIN~$Z_MAX)"
echo ""
echo "  3 phases:"
echo "    1. FOV   — move camera to 4 corners, tune hfov/vfov (a d w s)"
echo "    2. K1    — pan/tilt test, fix mid-range drift  (a d w s)"
echo "    3. K2    — pan/tilt test, fix edge drift        (a d w s)"
echo ""
echo "  All phases use the same keys:"
echo "    d = plus RIGHT   a = plus LEFT   (horizontal)"
echo "    s = plus DOWN    w = plus UP     (vertical)"
echo "    1~7 = change step size"
echo "    Enter = accept and continue"
echo ""

# ── x1 anchor ────────────────────────────────────────────────────────────────
if [ "$Z_MIN" = "205" ]; then
    echo "  x1 = spec anchor: hfov=64.1°  vfov=38.1°  — no tuning needed."
    read -r -p "  Press Enter to save and exit..." _
    py_call "/setfovnow?h=64.1&v=38.1" > /dev/null
    py_call "/setk?h=0&v=0&h2=0&v2=0"  > /dev/null
    py_call "/savefov" > /dev/null
    py_call "/reloadfov" > /dev/null && ok "Saved and reloaded."
    $LOG_CMD "[$CMDNAME][OK] x1 anchor saved"
    return 0
fi

read -r -p "  Press Enter to begin calibration at zoom_raw=$CAL_RAW..." _

# ── Get flip flags ─────────────────────────────────────────────────────────────
ST_INIT=$(get_status)
FLIP_H=$(echo "$ST_INIT" | grep "flip_h=" | grep -oP "flip_h=\K\S+")
FLIP_V=$(echo "$ST_INIT" | grep "flip_v=" | grep -oP "flip_v=\K\S+")
[ -z "$FLIP_H" ] && FLIP_H="False"
[ -z "$FLIP_V" ] && FLIP_V="False"

# ── Move to CAL_RAW ────────────────────────────────────────────────────────────
step "Moving camera to zoom_raw=$CAL_RAW (band mid)..."
PTZ=$(fetch_ptz) || { echo "[$CMDNAME][ERROR] Cannot reach camera"; return 1; }
read B_PAN B_TILT B_ZOOM <<< "$PTZ"
cam_move "$B_PAN" "$B_TILT" "$CAL_RAW"
sleep "$SETTLE_SEC"
ok "Camera at zoom_raw=$CAL_RAW (band $Z_MIN~$Z_MAX)"

# ── Lock reference ─────────────────────────────────────────────────────────────
step "Locking reference — camera should be pointing at your target..."
py_call "/setref" > /dev/null || { echo "[$CMDNAME][ERROR] /setref failed"; return 1; }
PTZ=$(fetch_ptz) || { echo "[$CMDNAME][ERROR] fetch_ptz failed"; return 1; }
read REF_PAN REF_TILT REF_ZOOM_ACTUAL <<< "$PTZ"
ok "Reference: pan=$REF_PAN  tilt=$REF_TILT"

# ── Starting FOV estimate ──────────────────────────────────────────────────────
ST_NOW=$(get_status)
INIT_H=$(echo "$ST_NOW" | grep "hfov_now=" | grep -oP "hfov_now=\K[0-9.]+")
INIT_V=$(echo "$ST_NOW" | grep "vfov_now=" | grep -oP "vfov_now=\K[0-9.]+")
# Use override if provided (carry-forward from previous sub-point)
[ -n "$OVERRIDE_H" ] && INIT_H="$OVERRIDE_H"
[ -n "$OVERRIDE_V" ] && INIT_V="$OVERRIDE_V"
[ -z "$INIT_H" ] && INIT_H="10.0"
[ -z "$INIT_V" ] && INIT_V="6.0"
ok "Starting FOV estimate: hfov=$INIT_H°  vfov=$INIT_V°"

# ── Compute corner and K test positions ───────────────────────────────────────
# Corner movement percentage of half-FOV — decreases with zoom:
#   x1~x5  (Z_MID ≤ 1125):  70%
#   x6~x7  (Z_MID ≤ 1533):  55%
#   x8~x10 (Z_MID ≤ 2150):  40%
#   x11~x15(Z_MID ≤ 3177):  30%
#   x16~x25(Z_MID ≤ 5221):  22%
#   x26~x40(Z_MID > 5221):  15%
CORNER_PCT=$(python3 -c "
z = int('$CAL_RAW')
if   z <= 1125: print(0.70)
elif z <= 1533: print(0.55)
elif z <= 2150: print(0.40)
elif z <= 3177: print(0.30)
elif z <= 5221: print(0.22)
else:           print(0.15)
")

CORNER_PAN_UNITS=$(python3 -c "
units = int(round(float('$INIT_H') / 2.0 * $CORNER_PCT * 100))
print(max(30, min(900, units)))
")
CORNER_TILT_UNITS=$(python3 -c "
units = int(round(float('$INIT_V') / 2.0 * $CORNER_PCT * 100))
print(max(20, min(500, units)))
")

K_PAN_UNITS=$(python3 -c "
units = int(round(float('$INIT_H') / 2.0 * 0.50 * 100))
print(max(30, min(500, units)))
")
K_TILT_UNITS=$(python3 -c "
units = int(round(float('$INIT_V') / 2.0 * 0.50 * 100))
print(max(20, min(300, units)))
")
K_PAN_TARGET=$(python3  -c "print(($REF_PAN  - $K_PAN_UNITS  + 36000) % 36000)")
K_TILT_TARGET=$(python3 -c "print(max(0, min(9000, $REF_TILT + $K_TILT_UNITS)))")

K2_PAN_UNITS=$(python3 -c "
units = int(round(float('$INIT_H') / 2.0 * 0.80 * 100))
print(max(30, min(900, units)))
")
K2_TILT_UNITS=$(python3 -c "
units = int(round(float('$INIT_V') / 2.0 * 0.80 * 100))
print(max(20, min(500, units)))
")
K2_PAN_TARGET=$(python3  -c "print(($REF_PAN  + $K2_PAN_UNITS  + 36000) % 36000)")
K2_TILT_TARGET=$(python3 -c "print(max(0, min(9000, $REF_TILT + $K2_TILT_UNITS)))")

echo ""
ok "Corner: ${CORNER_PCT} of half-FOV  ±pan=${CORNER_PAN_UNITS}u  ±tilt=${CORNER_TILT_UNITS}u"
ok "K1 test: pan LEFT  target=$K_PAN_TARGET   tilt target=$K_TILT_TARGET"
ok "K2 test: pan RIGHT target=$K2_PAN_TARGET  tilt target=$K2_TILT_TARGET"

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 1 — FOV calibration at 4 corners
# ══════════════════════════════════════════════════════════════════════════════
hdr "PHASE 1 / 3 — FOV  ($Z_LABEL/$SUB_LABEL)"
echo ""
echo "  Camera will move to 4 corner positions."
echo "  At each corner, align the plus sign onto the reference target:"
echo "    d = plus RIGHT (HFOV ↑)    a = plus LEFT  (HFOV ↓)"
echo "    s = plus DOWN  (VFOV ↑)    w = plus UP    (VFOV ↓)"
echo "  Enter when plus is on the target."
echo ""

CORNER_NAMES=("TOP-RIGHT" "TOP-LEFT" "BOTTOM-RIGHT" "BOTTOM-LEFT")
CORNER_PAN_DIRS=(1 -1 1 -1)
CORNER_TILT_DIRS=(-1 -1 1 1)
declare -a H_VALS=()
declare -a V_VALS=()

for c_idx in 0 1 2 3; do
    C_NAME="${CORNER_NAMES[$c_idx]}"
    PAN_DIR="${CORNER_PAN_DIRS[$c_idx]}"
    TILT_DIR="${CORNER_TILT_DIRS[$c_idx]}"
    C_NUM=$(( c_idx + 1 ))

    C_PAN=$(python3  -c "print(($REF_PAN  + $PAN_DIR  * $CORNER_PAN_UNITS  + 36000) % 36000)")
    C_TILT=$(python3 -c "print(max(0, min(9000, $REF_TILT + $TILT_DIR * $CORNER_TILT_UNITS)))")

    sep
    echo "  Corner $C_NUM / 4 — $C_NAME"
    step "Moving: pan=$C_PAN  tilt=$C_TILT"
    cam_move "$C_PAN" "$C_TILT" "$CAL_RAW"
    sleep 2; autofocus
    py_call "/pos?pan=${C_PAN}&tilt=${C_TILT}&zoom=${CAL_RAW}" > /dev/null

    ST_CHK=$(get_status)
    CPC=$(echo "$ST_CHK" | grep "cur_pan=" | grep -oP "cur_pan=\K[0-9]+")
    RPC=$(echo "$ST_CHK" | grep "ref_pan=" | grep -oP "ref_pan=\K[0-9]+")
    if [ "$CPC" = "$RPC" ]; then
        warn "delta=0 — retrying..."
        sleep 1
        py_call "/pos?pan=${C_PAN}&tilt=${C_TILT}&zoom=${CAL_RAW}" > /dev/null
        ST_CHK=$(get_status)
    fi

    PLX=$(echo "$ST_CHK" | grep "plus_x=" | grep -oP "plus_x=\K[0-9.]+")
    PLY=$(echo "$ST_CHK" | grep "plus_y=" | grep -oP "plus_y=\K[0-9.]+")
    EXP_X=$(python3 -c "print(1882 if float('${PLX:-960}') >= 960 else 38)")
    EXP_Y=$(python3 -c "print(1042 if float('${PLY:-540}') >= 540 else 38)")
    ok "Plus at X=${PLX:-?}  Y=${PLY:-?}  →  target X=$EXP_X  Y=$EXP_Y"

    tune_corner "$C_NAME" "$CAL_RAW" "$INIT_H" "$INIT_V" "$EXP_X" "$EXP_Y"

    H_VALS+=("$TUNED_H")
    V_VALS+=("$TUNED_V")
    INIT_H="$TUNED_H"
    INIT_V="$TUNED_V"

    step "Returning to reference..."
    cam_move "$REF_PAN" "$REF_TILT" "$CAL_RAW"
    sleep 2; autofocus
    py_call "/pos?pan=${REF_PAN}&tilt=${REF_TILT}&zoom=${CAL_RAW}" > /dev/null
    py_call "/setref" > /dev/null
    ok "Back at reference"

    if [ $c_idx -lt 3 ]; then
        echo ""
        ok "Corner $C_NUM done → moving to corner $((C_NUM+1)): ${CORNER_NAMES[$((c_idx+1))]}"
        sleep 1
    fi
done

FINAL_H=$(python3 << PYEOF
vals = [float(v) for v in ["${H_VALS[0]}","${H_VALS[1]}","${H_VALS[2]}","${H_VALS[3]}"]]
print(f'{sum(vals)/len(vals):.6f}')
PYEOF
)
FINAL_V=$(python3 << PYEOF
vals = [float(v) for v in ["${V_VALS[0]}","${V_VALS[1]}","${V_VALS[2]}","${V_VALS[3]}"]]
print(f'{sum(vals)/len(vals):.6f}')
PYEOF
)

sep
echo "  Phase 1 results:"
for i in 0 1 2 3; do
    printf "    Corner %d  %-14s  hfov=%-12s  vfov=%s\n" \
        "$((i+1))" "${CORNER_NAMES[$i]}" "${H_VALS[$i]}°" "${V_VALS[$i]}°"
done
ok "Average  →  hfov=$FINAL_H°   vfov=$FINAL_V°"

py_call "/setfovnow?h=${FINAL_H}&v=${FINAL_V}" > /dev/null

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 2 — K1
# ══════════════════════════════════════════════════════════════════════════════
hdr "PHASE 2 / 3 — K1 Radial Correction  ($Z_LABEL/$SUB_LABEL)"
echo ""
echo "  K1 fixes plus drift at mid-range angles."
echo "  Camera pans LEFT so reference target appears on the RIGHT side."
echo ""
echo "  p = PAN  test LEFT   (tune Kh with d/a)"
echo "  t = TILT test DOWN   (tune Kv with s/w)"
echo "  Enter when drift is corrected."
echo ""

tune_k "K1" "0.0000" "0.0000" "" ""
FINAL_KH="$TUNED_KH"
FINAL_KV="$TUNED_KV"
ok "K1 result: Kh=$FINAL_KH  Kv=$FINAL_KV"

step "Returning to reference..."
cam_move "$REF_PAN" "$REF_TILT" "$CAL_RAW"
sleep 2; autofocus
py_call "/pos?pan=${REF_PAN}&tilt=${REF_TILT}&zoom=${CAL_RAW}" > /dev/null
py_call "/setref" > /dev/null
ok "Back at reference"

K_PAN_UNITS="$K2_PAN_UNITS"
K_TILT_UNITS="$K2_TILT_UNITS"
K_PAN_TARGET="$K2_PAN_TARGET"
K_TILT_TARGET="$K2_TILT_TARGET"

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 3 — K2
# ══════════════════════════════════════════════════════════════════════════════
hdr "PHASE 3 / 3 — K2 Edge Correction  ($Z_LABEL/$SUB_LABEL)"
echo ""
echo "  K2 fixes residual drift at large angles (screen edges)."
echo "  Camera pans RIGHT so reference target appears on the LEFT side."
echo "  If K1 already corrected everything, press Enter now (K2=0 is fine)."
echo ""
echo "  p = PAN  test RIGHT  (tune Kh2 with d/a)"
echo "  t = TILT test DOWN   (tune Kv2 with s/w)"
echo ""

tune_k "K2" "0.0000" "0.0000" "$FINAL_KH" "$FINAL_KV"
FINAL_KH2="$TUNED_KH2"
FINAL_KV2="$TUNED_KV2"
ok "K2 result: Kh2=$FINAL_KH2  Kv2=$FINAL_KV2"

step "Returning to reference..."
cam_move "$REF_PAN" "$REF_TILT" "$CAL_RAW"
sleep 2; autofocus
py_call "/pos?pan=${REF_PAN}&tilt=${REF_TILT}&zoom=${CAL_RAW}" > /dev/null
py_call "/setref" > /dev/null
ok "Back at reference"

# ══════════════════════════════════════════════════════════════════════════════
# Save this sub-point
# ══════════════════════════════════════════════════════════════════════════════
hdr "Saving — $Z_LABEL/$SUB_LABEL  (zoom_raw=$CAL_RAW)"
echo ""
printf "  hfov=%s°  vfov=%s°  kh=%s  kv=%s  kh2=%s  kv2=%s\n" \
    "$FINAL_H" "$FINAL_V" "$FINAL_KH" "$FINAL_KV" "$FINAL_KH2" "$FINAL_KV2"
echo ""

py_call "/setfovnow?h=${FINAL_H}&v=${FINAL_V}" > /dev/null
py_call "/setk?h=${FINAL_KH}&v=${FINAL_KV}&h2=${FINAL_KH2}&v2=${FINAL_KV2}" > /dev/null

# savefov saves at current _cur_zoom — make sure it's at CAL_RAW
py_call "/pos?pan=${REF_PAN}&tilt=${REF_TILT}&zoom=${CAL_RAW}" > /dev/null

SAVE_RESP=$(py_call "/savefov")
if [ $? -ne 0 ]; then
    echo "[$CMDNAME][ERROR] /savefov failed for zoom_raw=$CAL_RAW" 1>&2
    $LOG_CMD "[$CMDNAME][ERROR] /savefov failed for $Z_LABEL/$SUB_LABEL raw=$CAL_RAW"
    return 1
fi
ok "Saved at zoom_raw=$CAL_RAW: $SAVE_RESP"
$LOG_CMD "[$CMDNAME][INFOM] Saved $Z_LABEL/$SUB_LABEL raw=$CAL_RAW h=$FINAL_H v=$FINAL_V kh=$FINAL_KH kv=$FINAL_KV kh2=$FINAL_KH2 kv2=$FINAL_KV2"
return 0
}   # end calibrate_at()


# ──────────────────────────────────────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────────────────────────────────────
$LOG_CMD "[$CMDNAME][INFOM] v4.1 start: $Z_LABEL full_band=$FULL_BAND"

if [ "$FULL_BAND" = "1" ]; then
    # ── Full-band mode: calibrate at MIN, MID, MAX ──────────────────────────
    hdr "RETI FOV Full-Band Calibration — $Z_LABEL  (band $Z_MIN~$Z_MAX)"
    echo ""
    echo "  Full-band mode: calibrating at 3 points within the $Z_LABEL band."
    echo "  This ensures accurate FOV for ALL zoom_raw values in $Z_MIN~$Z_MAX."
    echo ""
    printf "  Point 1/3 — min  : zoom_raw=%s\n" "$Z_MIN"
    printf "  Point 2/3 — mid  : zoom_raw=%s\n" "$Z_MID"
    printf "  Point 3/3 — max  : zoom_raw=%s\n" "$Z_MAX"
    echo ""
    read -r -p "  Press Enter to begin (3 calibration sessions)..." _

    # Point 1 — MIN
    sep
    echo "  POINT 1 / 3 — MIN  (zoom_raw=$Z_MIN)"
    calibrate_at "$Z_MIN" "min" "" ""
    if [ $? -ne 0 ]; then
        echo "[$CMDNAME][ERROR] Calibration failed at min ($Z_MIN)"
        exit 1
    fi
    CARRY_H="$FINAL_H"
    CARRY_V="$FINAL_V"

    echo ""
    ok "Point 1/3 (min) done — auto-advancing to Point 2/3 (mid)..."
    sleep 2

    # Point 2 — MID (carry forward FOV estimate from min)
    sep
    echo "  POINT 2 / 3 — MID  (zoom_raw=$Z_MID)"
    calibrate_at "$Z_MID" "mid" "$CARRY_H" "$CARRY_V"
    if [ $? -ne 0 ]; then
        echo "[$CMDNAME][ERROR] Calibration failed at mid ($Z_MID)"
        exit 1
    fi
    CARRY_H="$FINAL_H"
    CARRY_V="$FINAL_V"

    echo ""
    ok "Point 2/3 (mid) done — auto-advancing to Point 3/3 (max)..."
    sleep 2

    # Point 3 — MAX (carry forward FOV estimate from mid)
    sep
    echo "  POINT 3 / 3 — MAX  (zoom_raw=$Z_MAX)"
    calibrate_at "$Z_MAX" "max" "$CARRY_H" "$CARRY_V"
    if [ $? -ne 0 ]; then
        echo "[$CMDNAME][ERROR] Calibration failed at max ($Z_MAX)"
        exit 1
    fi

    # Reload table — all 3 new entries now active
    RELOAD_RESP=$(py_call "/reloadfov")
    ok "Table reloaded: $RELOAD_RESP"

    hdr "Full-Band Calibration Complete — $Z_LABEL"
    echo ""
    echo "  3 entries saved for $Z_LABEL (band $Z_MIN~$Z_MAX):"
    for zr in "$Z_MIN" "$Z_MID" "$Z_MAX"; do
        LINE=$(grep "^${zr}," "$FOV_CAL_FILE" 2>/dev/null)
        [ -n "$LINE" ] && echo "    $LINE" || echo "    $zr — not found"
    done
    echo ""
    echo "  Any zoom_raw from $Z_MIN to $Z_MAX will now interpolate"
    echo "  between real measurements — no extrapolation from adjacent bands."
    echo ""

else
    # ── Standard mode: calibrate at MID only ──────────────────────────────
    calibrate_at "$Z_MID" "mid" "" ""
    EXIT=$?

    RELOAD_RESP=$(py_call "/reloadfov")
    ok "Table reloaded: $RELOAD_RESP"

    echo ""
    echo "  Entry in ~/.reti_fov_cal:"
    grep "^${Z_MID}," "$FOV_CAL_FILE" 2>/dev/null | while IFS= read -r line; do
        echo "    $line"
    done
    echo ""

    [ $EXIT -ne 0 ] && exit $EXIT
fi

$LOG_CMD "[$CMDNAME][OK] $Z_LABEL complete (full_band=$FULL_BAND)"
echo "  Done. Run ./RETI-fov-verify.sh to check."
echo ""
exit 0