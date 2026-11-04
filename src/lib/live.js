import { useEffect, useState } from 'react';

// Polls the Raspberry Pi service (pi/server.py). status: off | connecting | online | error
export function useLive(url) {
  const [status, setStatus] = useState('off');
  const [state, setState] = useState(null);
  const [animals, setAnimals] = useState(null);
  useEffect(() => {
    if (!url) { setStatus('off'); setState(null); setAnimals(null); return; }
    const base = url.replace(/\/$/, ''); let alive = true; setStatus('connecting');
    const tick = async () => {
      try { const r = await fetch(base + '/api/state', { cache: 'no-store' }); const j = await r.json(); if (alive && j.ok) { setState(j); setStatus('online'); } }
      catch { if (alive) { setStatus('error'); setState(null); } }
    };
    const tickAnimals = async () => { try { const r = await fetch(base + '/api/animals', { cache: 'no-store' }); if (alive) setAnimals(await r.json()); } catch {} };
    tick(); tickAnimals();
    const a = setInterval(tick, 1500), b = setInterval(tickAnimals, 30000);
    return () => { alive = false; clearInterval(a); clearInterval(b); };
  }, [url]);
  return { status, state, animals, base: url ? url.replace(/\/$/, '') : '' };
}

export const PI_CAM_ID = 0;
// Build a virtual camera entry for the Pi feed; boxes come in pixels and are converted to photo-percent
export function piCamera(live) {
  const s = live.state; if (!s || !s.frame?.w) return null;
  const { w, h } = s.frame;
  return {
    id: PI_CAM_ID, name: { th: 'กล้อง Raspberry Pi', en: 'Raspberry Pi camera' }, stream: live.base + '/stream', snapshot: live.base + '/snapshot.jpg', aspect: w / h, live: true,
    boxes: s.detections.map((d, i) => ({ animalId: d.animalId, tag: `${d.cls || d.animalId} #${d.track >= 0 ? d.track : i + 1}`, conf: Math.round(d.conf * 100), x: d.x / w * 100, y: d.y / h * 100, w: d.w / w * 100, h: d.h / h * 100, behavior: d.behavior })),
  };
}

const EMOJI = { giraffe: '🦒', zebra: '🦓', elephant: '🐘', lion: '🦁', tiger: '🐯', monkey: '🐒', macaque: '🐒', penguin: '🐧', otter: '🦦', bear: '🐻', bird: '🐦', cat: '🐱', dog: '🐶', horse: '🐴', cow: '🐄', sheep: '🐑' };
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

// Crop the detection out of the latest Pi frame to use as the animal's photo (small JPEG data URL)
export async function cropFromPi(base, det, frame) {
  try {
    const blob = await fetch(base + '/snapshot.jpg?t=' + Date.now(), { cache: 'no-store' }).then(r => r.blob());
    const bmp = await createImageBitmap(blob);
    const sx = bmp.width / (frame.w || bmp.width), sy = bmp.height / (frame.h || bmp.height);
    const pad = 0.15;
    const x = Math.max(0, (det.x - det.w * pad) * sx), y = Math.max(0, (det.y - det.h * pad) * sy);
    const w = Math.min(bmp.width - x, det.w * (1 + 2 * pad) * sx), h = Math.min(bmp.height - y, det.h * (1 + 2 * pad) * sy);
    const scale = Math.min(1, 700 / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.round(w * scale); c.height = Math.round(h * scale);
    c.getContext('2d').drawImage(bmp, x, y, w, h, 0, 0, c.width, c.height);
    return { dataUrl: c.toDataURL('image/jpeg', 0.8), aspect: w / h };
  } catch { return null; }
}

// Build a new animal record for something the camera saw for the first time
export function animalFromDetection(det, count) {
  const id = det.animalId, label = cap(det.cls && det.cls !== 'demo' ? det.cls : id);
  return { id, emoji: EMOJI[id] || EMOJI[det.cls] || '🐾', tint: '#E8F1FC', name: { th: label, en: label }, species: { th: label, en: label }, age: 0,
    enclosure: { th: 'กล้อง Raspberry Pi', en: 'Raspberry Pi camera' }, emotion: 'calm', health: 90, minutesAgo: 0, camera: PI_CAM_ID, code: 'PI-' + String(count + 1).padStart(2, '0'), photo: '',
    eating: [0, 0, 0, 0, 0, 0, 0], activity: [0, 0, 0, 0, 0, 0, 0], resting: [0, 0, 0, 0, 0, 0, 0], pacing: [0, 0, 0, 0, 0, 0, 0], timeline: Array(12).fill('calm'), fromPi: true };
}
