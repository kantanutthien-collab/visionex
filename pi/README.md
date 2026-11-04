# VisionEx on the Raspberry Pi 5

This folder runs on the Pi. It reads the camera, finds animals with YOLOv8, decides what each one is
doing (resting, walking, pacing, eating, drinking), keeps daily statistics, and serves everything to
the dashboard over HTTP.

## 1. Install (once)

```bash
sudo apt update && sudo apt install -y python3-picamera2 python3-venv git
cd ~ && git clone <your repo> visionex && cd visionex/pi
python3 -m venv --system-site-packages .venv
source .venv/bin/activate
pip install -r requirements.txt        # ultralytics pulls in PyTorch, takes a few minutes
```

## 2. Run

```bash
source .venv/bin/activate
python3 server.py                      # Pi camera module
python3 server.py --source 0           # USB webcam instead
python3 server.py --draw               # also draw boxes into the video (handy when checking on the Pi itself)
```

Open `http://<pi-ip>:8000/` in a browser on the same Wi‑Fi to check the video. Find the IP with `hostname -I`.

## 3. Connect the dashboard

In the dashboard go to **Add / Edit Animals → Connect Raspberry Pi**, type `http://<pi-ip>:8000`
and press **Connect**. The Live Cameras page gets a new **Raspberry Pi** camera with real boxes, the
behaviour log fills from real detections, and animal statistics come from `pi/data/*.json`.
If the Pi is off, the dashboard falls back to demo data automatically.

## 4. Toy animals: which model?

- `yolov8n.pt` (default, downloaded automatically) is trained on everyday photos. It usually recognises
  **toy giraffes, zebras, elephants and bears**, and sometimes penguins as "bird". The mapping from
  YOLO class names to dashboard animals is in `classmap.json`.
- For **lions, tigers, monkeys, penguins, otters** (or to be reliable with your exact toys) train a small
  custom model. It takes about an hour:
  1. Take 30–60 photos of each toy from different angles and distances (phone is fine).
  2. Label them at https://roboflow.com (free) or with https://www.cvat.ai, export as **YOLOv8** format.
  3. On a laptop: `pip install ultralytics` then
     `yolo train model=yolov8n.pt data=path/to/data.yaml epochs=40 imgsz=640`
  4. Copy `runs/detect/train/weights/best.pt` to the Pi as `toys.pt` and run `python3 server.py --model toys.pt`.
  5. Make sure the class names you used (e.g. `lion`, `tiger`) are listed in `classmap.json`.

## 5. Eating and drinking

The camera cannot weigh food, so "eating" means *standing still inside the feeding area*. Set the
feeding and water areas per animal in `zones.json` as fractions of the frame (0..1). Open
`/snapshot.jpg` to see the frame and estimate the numbers.

## 6. Start automatically on boot (optional)

```bash
sudo tee /etc/systemd/system/visionex.service > /dev/null <<'UNIT'
[Unit]
Description=VisionEx Pi service
After=network.target
[Service]
User=pi
WorkingDirectory=/home/pi/visionex/pi
ExecStart=/home/pi/visionex/pi/.venv/bin/python3 server.py
Restart=always
[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl enable --now visionex
```

## Testing without a Pi

`python3 server.py --demo --source ../src/assets/animals/lion.jpg` runs the HTTP service with a fake
moving detection, so the dashboard integration can be tested on any computer.
