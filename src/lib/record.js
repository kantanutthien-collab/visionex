// Daily record: every day the numbers for each animal are written down (localStorage) so days can be compared later.
export const REC_KEY = 'visionex-record';
export const FIELDS = ['eating', 'drinking', 'resting', 'playing', 'activity', 'pacing'];
export const dayKey = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
export const loadRecord = () => { try { return JSON.parse(localStorage.getItem(REC_KEY) || '{}'); } catch { return {}; } };

// Write today's numbers for every animal (the first time, also the previous 6 days from the 7-day arrays).
// Older days are never overwritten: once written down, a day stays as it was.
export function writeRecord(animals, now, prev) {
  const rec = { ...prev }; let changed = false;
  animals.forEach(a => {
    const mine = { ...(rec[a.id] || {}) };
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i); const k = dayKey(d);
      if (i > 0 && mine[k]) continue;
      const row = Object.fromEntries(FIELDS.map(f => [f, (a[f] || [])[6 - i] ?? 0]));
      row.health = a.health; row.emotion = a.emotion;
      if (JSON.stringify(mine[k]) !== JSON.stringify(row)) { mine[k] = row; changed = true; }
    }
    rec[a.id] = mine;
  });
  if (changed) { try { localStorage.setItem(REC_KEY, JSON.stringify(rec)); } catch { /* storage full or blocked */ } }
  return changed ? rec : prev;
}
export const recordRows = (rec, id, n = 28) => Object.entries(rec[id] || {}).sort((x, y) => (x[0] < y[0] ? -1 : 1)).slice(-n).map(([date, v]) => ({ date, ...v }));
export function recordCSV(rec, a) {
  const head = ['date', ...FIELDS, 'health', 'emotion'];
  return [head.join(','), ...recordRows(rec, a.id, 3650).map(r => head.map(h => r[h] ?? '').join(','))].join('\n');
}
export function downloadCSV(name, text) {
  const url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }));
  const el = document.createElement('a'); el.href = url; el.download = name; document.body.appendChild(el); el.click(); el.remove(); URL.revokeObjectURL(url);
}
