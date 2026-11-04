import { DEX } from '../data/mock.js';

export const hColor = h => h >= 80 ? '#27AE60' : h >= 65 ? '#E67E22' : '#E74C3C';
export const statusOf = h => h >= 80 ? 'healthy' : h >= 65 ? 'watch' : 'attention';
export const STATUS_STYLE = { healthy: { bg: '#E8F8EF', color: '#1F8A4C' }, watch: { bg: '#FDF1E6', color: '#B35C0F' }, attention: { bg: '#FDEAEA', color: '#C0392B' } };
export const SEV_STYLE = { info: { bg: '#E8F1FC', color: '#2E86DE' }, warning: { bg: '#FDF1E6', color: '#E67E22' }, urgent: { bg: '#FDEAEA', color: '#E74C3C' } };
export const CODES = { giraffe: 'GR-01', elephant: 'EL-01', lion: 'LN-01', monkey: 'MK-04', penguin: 'PG-05', tiger: 'TG-02', zebra: 'ZB-03', otter: 'OT-01' };

export const avg6 = arr => arr.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
export const pctOf = arr => { const a = avg6(arr); return a === 0 ? 0 : Math.round((arr[6] - a) / a * 100); };
export const fmt = n => Number.isInteger(n) ? String(n) : n.toFixed(1);
export const hms = (d = new Date()) => [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');

export function trend(arr, goodUp) {
  const p = pctOf(arr); const flat = Math.abs(p) < 4; const good = flat ? null : (p > 0) === goodUp;
  return { pct: p, arrow: flat ? '→' : p > 0 ? '↑' : '↓', text: (p > 0 ? '+' : '') + p + '%', color: flat ? '#6B7A90' : good ? '#27AE60' : '#E74C3C' };
}
export function stressTrend(a) {
  const av = avg6(a.pacing), td = a.pacing[6];
  if (av === 0 && td === 0) return { pct: 0, arrow: '→', text: '0%', color: '#6B7A90' };
  if (av === 0) return { pct: 200, arrow: '↑', text: '+' + td, color: '#E74C3C' };
  return trend(a.pacing, false);
}

export function earlyWarnings(animals, L) {
  const out = [];
  animals.forEach(a => {
    const e = a.eating;
    if (e[6] < e[5] && e[5] < e[4] && e[4] < e[3] && (e[3] - e[6]) / e[3] > 0.1) { const p = Math.round((e[3] - e[6]) / e[3] * 100); out.push({ a, sev: 'urgent', text: L === 'th' ? `กินอาหารน้อยลง ${p}% ติดต่อกัน 3 วัน` : `Eating ${p}% less for 3 days in a row` }); }
    const pa = avg6(a.pacing); if (pa > 0 && a.pacing[6] >= pa * 2) { const x = (a.pacing[6] / pa).toFixed(1); out.push({ a, sev: 'urgent', text: L === 'th' ? `เดินวนเพิ่มขึ้น ${x} เท่าวันนี้` : `Pacing increased ${x}x today` }); }
    const ac = pctOf(a.activity); if (ac <= -15) out.push({ a, sev: 'warning', text: L === 'th' ? `ระดับกิจกรรมลดลง ${-ac}% จากค่าเฉลี่ย 7 วัน` : `Activity down ${-ac}% vs 7-day average` });
    const rs = pctOf(a.resting); if (Math.abs(rs) >= 20) out.push({ a, sev: 'warning', text: L === 'th' ? `เวลาพัก${rs < 0 ? 'ลดลง' : 'เพิ่มขึ้น'} ${Math.abs(rs)}% จากค่าเฉลี่ย` : `Resting time ${rs < 0 ? 'down' : 'up'} ${Math.abs(rs)}% vs average` });
  });
  return out;
}

export function scoreReasons(p, L) {
  const reasons = [];
  const push = (pct, th, en, weight, badUp) => {
    const bad = badUp ? pct > 0 : pct < 0; const impact = Math.abs(pct) < 4 ? 0 : Math.round(Math.abs(pct) * weight);
    if (impact === 0) reasons.push({ impact: '+0', color: '#27AE60', bg: '#F4F7FB', text: L === 'th' ? th + 'อยู่ในเกณฑ์ปกติ' : en + ' within normal range' });
    else reasons.push({ impact: (bad ? '−' : '+') + impact, color: bad ? '#E74C3C' : '#27AE60', bg: bad ? '#FDEAEA' : '#E8F8EF', text: L === 'th' ? `${th}${pct > 0 ? 'สูงกว่า' : 'ต่ำกว่า'}ค่าเฉลี่ย 7 วัน ${Math.abs(pct)}%` : `${en} ${pct > 0 ? 'above' : 'below'} 7-day average by ${Math.abs(pct)}%` });
  };
  push(pctOf(p.eating), 'การกิน', 'Eating', 0.6, false); push(pctOf(p.activity), 'ระดับกิจกรรม', 'Activity', 0.4, false); push(pctOf(p.resting), 'เวลาพัก', 'Resting', 0.3, false);
  const pa = avg6(p.pacing); push(pa === 0 ? 0 : Math.round((p.pacing[6] - pa) / pa * 100), 'การเดินวน', 'Pacing', 0.2, true);
  return reasons;
}

export function scoreSummary(name, st, L) {
  if (L === 'th') return st === 'healthy' ? `${name}มีพฤติกรรมใกล้เคียงค่าปกติของตัวเองในทุกด้าน คะแนนเริ่มจาก 100 และหักตามส่วนต่างจากค่าเฉลี่ย 7 วัน` : st === 'watch' ? `${name}มีบางตัวชี้วัดเบี่ยงเบนจากค่าปกติ ควรเฝ้าระวังต่อเนื่อง คะแนนเริ่มจาก 100 และหักตามส่วนต่างจากค่าเฉลี่ย 7 วัน` : `${name}มีหลายตัวชี้วัดเบี่ยงเบนจากค่าปกติพร้อมกัน โดยเฉพาะการกินและการเดินวน ควรให้สัตวแพทย์ตรวจ คะแนนเริ่มจาก 100 และหักตามส่วนต่างจากค่าเฉลี่ย 7 วัน`;
  return st === 'healthy' ? `${name} is close to its own normal on every measure. The score starts at 100 and deducts for deviation from the 7-day average.` : st === 'watch' ? `${name} is drifting from normal on some measures and should be watched. The score starts at 100 and deducts for deviation from the 7-day average.` : `${name} is deviating on several measures at once, especially eating and pacing. A vet check is recommended. The score starts at 100 and deducts for deviation from the 7-day average.`;
}

// Dex matching: perturb the true signature slightly, then rank all Dex entries by Euclidean distance.
export function matchDex(boxes) {
  const dist = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
  return boxes.map(b => {
    const sig = DEX[b.animalId].signature.map(v => Math.min(1, Math.max(0, v + (Math.random() - 0.5) * 0.08)));
    const cands = Object.keys(DEX).map(id => ({ id, score: Math.max(0, 1 - dist(sig, DEX[id].signature) / 1.2) })).sort((x, y) => y.score - x.score).slice(0, 3);
    return { tag: b.tag, animalId: b.animalId, match: Math.round(cands[0].score * 100), cands: cands.map(c => ({ id: c.id, score: Math.round(c.score * 100) })) };
  });
}

// ---------- Habitat ----------
export const sensorStatus = s => {
  const [lo, hi] = s.range, span = hi - lo;
  if (s.value < lo || s.value > hi) return 'out';
  return (s.value - lo) / span < 0.1 || (hi - s.value) / span < 0.1 ? 'edge' : 'ok';
};
export const SENSOR_STYLE = { ok: { bg: '#E8F8EF', color: '#1F8A4C' }, edge: { bg: '#FDF1E6', color: '#B35C0F' }, out: { bg: '#FDEAEA', color: '#C0392B' } };

// ---------- Deterministic history generation (no backend; same numbers every reload) ----------
export const seeded = seed => { let x = seed >>> 0; return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; }; };
const strSeed = s => [...s].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
// 28-day series ending today: 21 synthetic days around the animal's normal, then the real 7-day array
export function history28(arr, key) {
  const r = seeded(strSeed(key)), av = avg6(arr), sd = Math.max(av * 0.07, 0.15), out = [];
  for (let i = 0; i < 21; i++) out.push(+Math.max(0, av + (r() - 0.5) * 2 * sd).toFixed(1));
  return out.concat(arr);
}
export const weekly4 = series => [0, 1, 2, 3].map(w => { const s = series.slice(w * 7, w * 7 + 7); return +(s.reduce((a, b) => a + b, 0) / s.length).toFixed(1); });
export function sensorHistory(s, key, n = 24) {
  const r = seeded(strSeed(key)), span = s.range[1] - s.range[0], out = [];
  let v = s.value - (r() - 0.5) * span * 0.2;
  for (let i = 0; i < n - 1; i++) { v += (r() - 0.5) * span * 0.06 + (s.value - v) * 0.12; out.push(+v.toFixed(1)); }
  return out.concat([s.value]);
}
// hours spent moving today ≈ waking hours × activity index
export const activeHours = a => +((24 - a.resting[6]) * a.activity[6] / 100).toFixed(1);
export const dayLabel = (now, daysAgo, L) => { const d = new Date(now); d.setDate(d.getDate() - daysAgo); return d.toLocaleDateString(L === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' }); };

// Enrichment review triggers: repetitive pacing or prolonged inactivity
export function enrichmentNeeds(animals, L) {
  return animals.map(a => {
    const reasons = [];
    const pa = avg6(a.pacing); if (pa > 0 && a.pacing[6] >= pa * 1.5) reasons.push(L === 'th' ? `เดินไปเดินมา ${a.pacing[6]} ครั้งวันนี้ (ปกติแค่ ${fmt(pa)} ครั้ง)` : `Walked back and forth ${a.pacing[6]} times today (usually only ${fmt(pa)})`);
    const ac = pctOf(a.activity); if (ac <= -12) reasons.push(L === 'th' ? `ขยับตัวน้อยลง ${-ac}% จากปกติ` : `Moving around ${-ac}% less than usual`);
    const rs = pctOf(a.resting); if (rs >= 15) reasons.push(L === 'th' ? `นอนพักนานขึ้น ${rs}% กว่าปกติ` : `Sleeping or resting ${rs}% longer than usual`);
    if (a.emotion === 'stressed' || a.emotion === 'agitated') reasons.push(L === 'th' ? 'ตอนนี้ดู' + (a.emotion === 'stressed' ? 'เครียด' : 'กระวนกระวาย') + ' อยู่' : 'Looks ' + a.emotion + ' right now');
    return { a, reasons };
  }).filter(x => x.reasons.length > 0);
}
