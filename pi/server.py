#!/usr/bin/env python3
"""VisionEx Raspberry Pi service.

camera  ->  YOLOv8 detection + tracking  ->  behaviour (behavior.py)  ->  HTTP API + MJPEG stream

  python3 server.py                      # Pi camera (picamera2), yolov8n.pt
  python3 server.py --source 0           # USB webcam
  python3 server.py --model toys.pt      # your custom-trained model
  python3 server.py --demo --source ../src/assets/animals/lion.jpg   # no YOLO, fake moving box (for testing the dashboard)

Endpoints (CORS enabled, so the dashboard in a browser can read them):
  GET /api/state     current detections, behaviours, recent events, fps, system info
  GET /api/animals   7-day statistics per animal (eating, activity, resting, pacing) + emotion
  GET /stream        MJPEG video with boxes drawn
  GET /snapshot.jpg  latest annotated frame
"""
import argparse, json, math, os, threading, time
from collections import deque
import cv2, numpy as np
from flask import Flask, Response, jsonify
from behavior import BehaviorTracker, DailyStats

HERE = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)
lock = threading.Lock()
S = {'jpeg': None, 'detections': [], 'behaviors': {}, 'events': deque(maxlen=60), 'fps': 0.0, 'ms': 0, 'w': 0, 'h': 0, 'started': time.time(), 'model': '', 'frames': 0, 'source': ''}
stats = None


def _json(path, default):
    try:
        with open(os.path.join(HERE, path)) as f:
            return {k: v for k, v in json.load(f).items() if not k.startswith('_')}
    except Exception:
        return default


@app.after_request
def cors(r):
    r.headers['Access-Control-Allow-Origin'] = '*'; r.headers['Cache-Control'] = 'no-store'; return r


def cpu_temp():
    try:
        with open('/sys/class/thermal/thermal_zone0/temp') as f:
            return round(int(f.read()) / 1000, 1)
    except Exception:
        return None


# ---------------- camera sources ----------------
def open_source(source):
    """Returns a read() -> (ok, frame BGR) function."""
    if source == 'picamera':
        from picamera2 import Picamera2
        cam = Picamera2()
        cam.configure(cam.create_video_configuration(main={'size': (1280, 720), 'format': 'RGB888'}))
        cam.start(); time.sleep(0.5)
        return lambda: (True, cv2.cvtColor(cam.capture_array(), cv2.COLOR_RGB2BGR))
    if source.lower().endswith(('.jpg', '.jpeg', '.png')):
        img = cv2.imread(source)
        if img is None:
            raise SystemExit(f'cannot read image {source}')
        return lambda: (True, img.copy())
    cap = cv2.VideoCapture(int(source) if source.isdigit() else source)
    if not cap.isOpened():
        raise SystemExit(f'cannot open camera/video {source}')
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280); cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    def read():
        ok, f = cap.read()
        if not ok and not source.isdigit():          # loop video files
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0); ok, f = cap.read()
        return ok, f
    return read


def demo_detections(w, h, t, classmap):
    """Fake detection that walks back and forth, so the dashboard can be tested without a model."""
    aid = next(iter(classmap.values()), 'lion')
    bw, bh = int(w * 0.3), int(h * 0.45)
    x = int((w - bw) * (0.5 + 0.45 * math.sin(t / 4)))
    return [{'animalId': aid, 'cls': 'demo', 'conf': 0.9, 'track': 1, 'x': x, 'y': int(h * 0.3), 'w': bw, 'h': bh}]


# ---------------- main loop ----------------
def capture_loop(args):
    global stats
    classmap = _json('classmap.json', {}); zones = _json('zones.json', {})
    read = open_source(args.source)
    model = None
    if not args.demo:
        from ultralytics import YOLO
        model = YOLO(args.model); S['model'] = os.path.basename(args.model)
    tracker = BehaviorTracker(zones); stats = DailyStats(os.path.join(HERE, 'data'))
    tick, n = time.time(), 0
    while True:
        ok, frame = read()
        if not ok:
            time.sleep(0.2); continue
        t0 = time.time(); h, w = frame.shape[:2]
        dets = []
        if model is not None:
            res = model.track(frame, persist=True, conf=args.conf, imgsz=args.imgsz, verbose=False)[0]
            for b in res.boxes:
                name = res.names[int(b.cls)]; aid = classmap.get(name)
                if not aid:
                    continue
                x1, y1, x2, y2 = b.xyxy[0].tolist()
                dets.append({'animalId': aid, 'cls': name, 'conf': round(float(b.conf), 2), 'track': int(b.id) if b.id is not None else -1,
                             'x': round(x1), 'y': round(y1), 'w': round(x2 - x1), 'h': round(y2 - y1)})
        else:
            dets = demo_detections(w, h, t0, classmap); time.sleep(0.08)
        behaviors, events = tracker.update(dets, t0, w, h)
        stats.add(behaviors, t0)
        # draw boxes into the video only with --draw (the dashboard overlays its own boxes)
        for d in (dets if args.draw else []):
            color = (60, 76, 231) if d.get('behavior') == 'pacing' else (96, 174, 39)
            cv2.rectangle(frame, (d['x'], d['y']), (d['x'] + d['w'], d['y'] + d['h']), color, 2)
            cv2.putText(frame, f"{d['animalId']} {d.get('behavior', '')} {int(d['conf'] * 100)}%", (d['x'], max(18, d['y'] - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        ok, buf = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        n += 1
        if time.time() - tick >= 1:
            S['fps'] = round(n / (time.time() - tick), 1); n, tick = 0, time.time()
        with lock:
            S['jpeg'] = buf.tobytes(); S['detections'] = dets; S['behaviors'] = behaviors; S['w'], S['h'] = w, h
            S['ms'] = int((time.time() - t0) * 1000); S['frames'] += 1
            for e in events:
                S['events'].appendleft(e)


# ---------------- HTTP ----------------
@app.route('/api/state')
def api_state():
    with lock:
        return jsonify({'ok': True, 'time': time.strftime('%H:%M:%S'), 'fps': S['fps'], 'ms': S['ms'], 'frame': {'w': S['w'], 'h': S['h']},
                        'detections': S['detections'], 'behaviors': S['behaviors'], 'events': list(S['events']),
                        'system': {'cpuTemp': cpu_temp(), 'uptime': int(time.time() - S['started']), 'model': S['model'] or 'demo', 'frames': S['frames'], 'source': S['source']}})


@app.route('/api/animals')
def api_animals():
    return jsonify(stats.summary() if stats else {})


@app.route('/snapshot.jpg')
def snapshot():
    with lock:
        jpg = S['jpeg']
    return Response(jpg or b'', mimetype='image/jpeg')


@app.route('/stream')
def stream():
    def gen():
        last = None
        while True:
            with lock:
                jpg = S['jpeg']
            if jpg and jpg is not last:
                last = jpg
                yield b'--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ' + str(len(jpg)).encode() + b'\r\n\r\n' + jpg + b'\r\n'
            time.sleep(0.05)
    return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/')
def index():
    return '<h3>VisionEx Pi service</h3><img src="/stream" style="max-width:100%"><p><a href="/api/state">/api/state</a> · <a href="/api/animals">/api/animals</a></p>'


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--source', default='picamera', help="'picamera', a webcam index like 0, a video file or an image")
    ap.add_argument('--model', default='yolov8n.pt', help='YOLO weights (.pt). Use your custom-trained model for toy animals')
    ap.add_argument('--conf', type=float, default=0.4)
    ap.add_argument('--imgsz', type=int, default=640)
    ap.add_argument('--port', type=int, default=8000)
    ap.add_argument('--demo', action='store_true', help='no YOLO; fake moving detection for testing')
    ap.add_argument('--draw', action='store_true', help='also draw boxes into the video stream (useful on the Pi index page)')
    args = ap.parse_args(); S['source'] = args.source
    threading.Thread(target=capture_loop, args=(args,), daemon=True).start()
    print(f'VisionEx Pi service on http://0.0.0.0:{args.port}  (source={args.source}, model={"demo" if args.demo else args.model})')
    app.run(host='0.0.0.0', port=args.port, threaded=True)
