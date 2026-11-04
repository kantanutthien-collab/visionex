"""Behaviour classification + daily statistics for VisionEx.

Takes YOLO detections (with tracker ids) frame by frame and decides, per animal:
resting / walking / pacing / eating / drinking.  Everything is in frame fractions (0..1)
so it works for any camera resolution.
"""
import json, os, time
from collections import deque, defaultdict
from datetime import date, timedelta

MOVE_SPEED = 0.04        # frame-widths per second above which the animal counts as moving
PACING_REVERSALS = 3     # direction changes within PACING_WINDOW seconds → pacing
PACING_WINDOW = 30
STALE_AFTER = 5          # seconds without detection before a track is forgotten


def _in_zone(cx, cy, zone):
    if not zone:
        return False
    return zone['x'] <= cx <= zone['x'] + zone['w'] and zone['y'] <= cy <= zone['y'] + zone['h']


class BehaviorTracker:
    def __init__(self, zones=None):
        self.zones = zones or {}          # {animalId: {"feed": {x,y,w,h}, "water": {...}}}  (fractions)
        self.tracks = {}

    def update(self, dets, t, w, h):
        behaviors, events = {}, []
        for d in dets:
            key = (d['animalId'], d.get('track', -1))
            cx, cy = (d['x'] + d['w'] / 2) / w, (d['y'] + d['h'] / 2) / h
            tr = self.tracks.setdefault(key, {'hist': deque(maxlen=120), 'behavior': None, 'since': t, 'rev': deque(), 'dir': 0, 'last': t})
            tr['hist'].append((t, cx, cy)); tr['last'] = t
            # speed over the last ~1 s
            old = next((p for p in tr['hist'] if t - p[0] <= 1.2), tr['hist'][0])
            dt = max(1e-3, t - old[0])
            speed = ((cx - old[1]) ** 2 + (cy - old[2]) ** 2) ** 0.5 / dt
            moving = speed > MOVE_SPEED
            # pacing = repeated left/right direction reversals while moving
            dx = cx - old[1]
            if moving and abs(dx) > 0.01:
                direction = 1 if dx > 0 else -1
                if tr['dir'] and direction != tr['dir']:
                    tr['rev'].append(t)
                tr['dir'] = direction
            while tr['rev'] and t - tr['rev'][0] > PACING_WINDOW:
                tr['rev'].popleft()
            z = self.zones.get(d['animalId'], {})
            if not moving and _in_zone(cx, cy, z.get('feed')):
                beh = 'eating'
            elif not moving and _in_zone(cx, cy, z.get('water')):
                beh = 'drinking'
            elif moving and len(tr['rev']) >= PACING_REVERSALS:
                beh = 'pacing'
            elif moving:
                beh = 'walking'
            else:
                beh = 'resting'
            if beh != tr['behavior'] and t - tr['since'] >= 2:
                tr['behavior'], tr['since'] = beh, t
                events.append({'time': time.strftime('%H:%M:%S', time.localtime(t)), 'animalId': d['animalId'], 'behavior': beh})
            elif tr['behavior'] is None:
                tr['behavior'] = beh
            d['behavior'] = tr['behavior']
            behaviors[d['animalId']] = {'behavior': tr['behavior'], 'since': tr['since'], 'speed': round(speed, 3)}
        for key in [k for k, tr in self.tracks.items() if t - tr['last'] > STALE_AFTER]:
            del self.tracks[key]
        return behaviors, events


class DailyStats:
    """Accumulates seconds per behaviour per animal per day and writes data/YYYY-MM-DD.json."""

    def __init__(self, folder):
        self.folder = folder; os.makedirs(folder, exist_ok=True)
        self.last = time.time(); self.day = date.today().isoformat()
        self.data = self._load(self.day); self.prev = {}; self.last_save = 0

    def _path(self, day):
        return os.path.join(self.folder, day + '.json')

    def _load(self, day):
        try:
            with open(self._path(day)) as f:
                return json.load(f)
        except Exception:
            return {}

    def add(self, behaviors, t):
        today = date.today().isoformat()
        if today != self.day:
            self.save(); self.day, self.data = today, {}
        dt = min(5.0, t - self.last); self.last = t
        for aid, b in behaviors.items():
            rec = self.data.setdefault(aid, {'seconds': defaultdict(float), 'pacingEpisodes': 0, 'observed': 0.0})
            rec['seconds'] = defaultdict(float, rec['seconds'])
            rec['seconds'][b['behavior']] += dt; rec['observed'] += dt
            if b['behavior'] == 'pacing' and self.prev.get(aid) != 'pacing':
                rec['pacingEpisodes'] += 1
            self.prev[aid] = b['behavior']
        if t - self.last_save > 30:
            self.save()

    def save(self):
        self.last_save = time.time()
        with open(self._path(self.day), 'w') as f:
            json.dump({k: {**v, 'seconds': dict(v['seconds'])} for k, v in self.data.items()}, f)

    def summary(self):
        """7-day arrays (oldest → today) in the dashboard's units + today's derived state."""
        days = [(date.today() - timedelta(days=i)).isoformat() for i in range(6, -1, -1)]
        per_day = [self.data if d == self.day else self._load(d) for d in days]
        ids = {aid for day in per_day for aid in day}
        out = {}
        for aid in ids:
            eating, activity, resting, pacing = [], [], [], []
            for day in per_day:
                r = day.get(aid); s = (r or {}).get('seconds', {}); obs = (r or {}).get('observed', 0) or 1
                moving = s.get('walking', 0) + s.get('pacing', 0) + s.get('playing', 0)
                eating.append(round(s.get('eating', 0) / 60, 1))                       # minutes at the feeder
                activity.append(round(100 * moving / obs) if r else 0)                 # % of observed time moving
                resting.append(round(s.get('resting', 0) / 3600, 1))                   # hours resting
                pacing.append(int((r or {}).get('pacingEpisodes', 0)))
            avg_p = sum(pacing[:6]) / 6
            emotion = 'stressed' if pacing[6] >= 3 and pacing[6] >= 2 * max(avg_p, 0.5) else 'playful' if activity[6] >= 60 else 'calm'
            out[aid] = {'eating': eating, 'activity': activity, 'resting': resting, 'pacing': pacing, 'emotion': emotion, 'days': days}
        return out
