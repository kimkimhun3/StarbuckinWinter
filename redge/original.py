import argparse
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

import gi
gi.require_version("Gst", "1.0")
gi.require_version("GObject", "2.0")
from gi.repository import Gst, GObject, GLib

MIN_SCALE = 0.3
MAX_SCALE = 3.0
DEFAULT_SCALE = 1.0

SCALE_FILE_PATH = "/root/.reti_pattmag_file"

pipeline = None
mix = None
crop = None
video_width = None
video_height = None


def write_scale_file(scale: float) -> None:
    try:
        with open(SCALE_FILE_PATH, "w") as f:
            f.write(f"{scale:.3f}\n")
    except Exception as e:
        print(f"[WARN] Failed to write scale to {SCALE_FILE_PATH}: {e}")


def _get_video_resolution_from_mix() -> bool:
    global mix, video_width, video_height
    pad0 = mix.get_static_pad("sink_0") if mix else None
    if pad0 is None:
        print("[WARN] mix sink_0 pad not found")
        return False

    caps = pad0.get_current_caps() or pad0.get_allowed_caps()
    if not caps:
        print("[WARN] mix sink_0 caps not available yet")
        return False

    s = caps.get_structure(0)
    w_ok, w = s.get_int("width")
    h_ok, h = s.get_int("height")
    if not (w_ok and h_ok):
        print("[WARN] failed to get width/height from caps:", s.to_string())
        return False

    video_width = w
    video_height = h
    print(f"[INFO] Video resolution detected: {video_width}x{video_height}")
    return True


def _set_crop_zero() -> None:
    global crop
    if crop is None:
        return
    try:
        crop.set_property("left", 0)
        crop.set_property("right", 0)
        crop.set_property("top", 0)
        crop.set_property("bottom", 0)
    except Exception as e:
        print(f"[WARN] Failed to set crop=0: {e}")


def _apply_scale_by_pad(scale: float) -> None:
    global mix, video_width, video_height

    pad1 = mix.get_static_pad("sink_1") if mix else None
    if pad1 is None:
        print("[ERROR] mix sink_1 pad not found")
        return

    overlay_size = int(video_height * scale + 0.5)
    overlay_size = max(1, overlay_size)

    xpos = int((video_width - overlay_size) / 2)
    ypos = int((video_height - overlay_size) / 2)

    try:
        pad1.set_property("width", overlay_size)
        pad1.set_property("height", overlay_size)
        pad1.set_property("xpos", xpos)
        pad1.set_property("ypos", ypos)
    except Exception as e:
        print(f"[ERROR] Failed to set sink_1 pad props: {e}")
        return

    print(f"[INFO] Applied: scale={scale:.3f}, overlay={overlay_size}x{overlay_size}, xpos={xpos}, ypos={ypos}")


def _apply_scale_in_mainthread(scale: float) -> bool:
    global video_width, video_height

    if video_width is None or video_height is None:
        if not _get_video_resolution_from_mix():
            print("[WARN] Could not detect video resolution yet. Try again later.")
            return False

    _set_crop_zero()
    _apply_scale_by_pad(scale)
    return False


def request_set_scale(scale: float) -> None:
    if scale < MIN_SCALE:
        scale = MIN_SCALE
    if scale > MAX_SCALE:
        scale = MAX_SCALE

    write_scale_file(scale)
    GLib.idle_add(_apply_scale_in_mainthread, scale)


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


def main():
    parser = argparse.ArgumentParser(
        description="Dynamic overlay scaler (imxcompositor_g2d pad scaling) - FINAL"
    )
    parser.add_argument("--pipeline", required=True)
    parser.add_argument("--http-port", type=int, default=8080)
    args = parser.parse_args()

    global pipeline, mix, crop

    Gst.init(None)
    GObject.threads_init()

    try:
        pipeline = Gst.parse_launch(args.pipeline)
    except GLib.Error as e:
        print("[ERROR] Failed to create pipeline:", e)
        return

    mix = pipeline.get_by_name("mix")
    crop = pipeline.get_by_name("crop")  # optional

    if mix is None:
        print("[ERROR] compositor element name 'mix' not found in pipeline.")
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
    GLib.idle_add(_apply_scale_in_mainthread, DEFAULT_SCALE)

    th = threading.Thread(target=run_http_server, args=(args.http_port,), daemon=True)
    th.start()

    print(f"[INFO] Ready. Access: http://<board-ip>:{args.http_port}/scale?value=0.9")

    try:
        loop.run()
    except KeyboardInterrupt:
        print("[INFO] Interrupted by user.")

    pipeline.set_state(Gst.State.NULL)
    print("[INFO] Pipeline stopped.")


if __name__ == "__main__":
    main()