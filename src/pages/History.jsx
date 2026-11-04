import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';
import { HOURLY, OBSERVATIONS } from '../data/mock.js';
import CamFeed, { fitRect } from '../components/CamFeed.jsx';
import { camAspect } from '../data/photos.js';
import { seeded } from '../lib/analysis.js';
import Photo from '../components/Photo.jsx';
import { photoOf } from '../data/photos.js';
import { history28, weekly4, avg6, fmt, dayLabel } from '../lib/analysis.js';
import { Card, EmptyState } from '../components/ui.jsx';

// Heatmap of where the animal was seen today: hot around its usual spot, plus a pacing track along the fence for stressed animals.
function heatCells(a, cam, cols = 12, rows = 7) {
  const r = fitRect(camAspect(cam)), box = cam.boxes.find(b => b.animalId === a.id);
  const cx = box ? r.left + (box.x + box.w / 2) * r.width / 100 : 50, cy = box ? r.top + (box.y + box.h * 0.75) * r.height / 100 : 60;
  const rnd = seeded(a.id.length * 131 + a.health), stressed = a.emotion === 'stressed' || a.emotion === 'agitated';
  const out = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = (i + 0.5) / cols * 100, y = (j + 0.5) / rows * 100;
    let v = Math.exp(-(((x - cx) / 22) ** 2 + ((y - cy) / 18) ** 2)) + rnd() * 0.12;
    if (stressed && Math.abs(y - cy) < 9) v += 0.55 * Math.exp(-(((Math.abs(x - 50) - 25) / 18) ** 2));
    out.push(Math.min(1, v));
  }
  return out;
}

export default function History({ t, L, tx, animals, cameras, selected, now, openProfile, narrow }) {
  const [id, setId] = useState(selected);
  const [range, setRange] = useState('7');
  const [metric, setMetric] = useState('activity');
  const a = animals.find(x => x.id === id) || animals[0];
  if (!a) return <EmptyState title={t.emptyTitle} sub={t.emptySub} action={t.emptyAdd} onAction={() => openProfile(null)} />;
  const units = { eating: t.kg, activity: t.idx, resting: t.hrs, pacing: t.times };
  const names = { eating: t.eating, activity: t.activity, resting: t.resting, pacing: t.pacing };
  const full = history28(a[metric], a.id + metric);
  const series = range === '7' ? full.slice(21).map((v, i) => ({ x: dayLabel(now, 6 - i, L), v })) : range === '4w' ? weekly4(full).map((v, i) => ({ x: `${t.hisWeek} ${i + 1}`, v })) : full.map((v, i) => ({ x: dayLabel(now, 27 - i, L), v }));
  const av = avg6(a[metric]);
  // today's hourly pattern: typical curve scaled by today's activity, with pacing bumps in stressed/agitated hours
  const scale = a.activity[6] / avg6(a.activity);
  const hours = HOURLY[a.id].map((typ, i) => { const emo = a.timeline[Math.min(i, 11)]; const today = Math.round(Math.min(100, typ * scale + (emo === 'stressed' ? 12 : emo === 'agitated' ? 20 : 0))); return { h: String(6 + i).padStart(2, '0') + ':00', typical: typ, today, diff: today - typ }; });
  const biggest = hours.reduce((m, x) => Math.abs(x.diff) > Math.abs(m.diff) ? x : m, hours[0]);
  const shifted = Math.abs(biggest.diff) >= 15;
  const obs = (OBSERVATIONS[a.id] || []).slice().sort((x, y) => x.daysAgo - y.daysAgo);
  const cam = cameras.find(c => c.id === a.camera) || cameras[0];
  const heat = cam ? heatCells(a, cam) : [];
  const tip = { contentStyle: { borderRadius: 10, border: '1px solid #DDE4EE', fontSize: 12 } };
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
        {animals.map(x => <button key={x.id} onClick={() => setId(x.id)} className={`relative rounded-xl overflow-hidden text-left border-2 transition ${id === x.id ? 'border-ocean shadow-lift' : 'border-transparent hover:border-[#B9D6EE]'}`}><Photo a={x} className="w-full h-[64px]" /><div className="absolute inset-0 bg-gradient-to-t from-navy/85 to-transparent" /><div className="absolute left-2 bottom-1.5 text-white text-[12px] font-semibold">{x.emoji} {tx(x.name)}</div></button>)}
      </div>
      <div className={`grid gap-6 items-start ${narrow ? 'grid-cols-1' : 'grid-cols-[minmax(0,1.4fr)_minmax(min(300px,100%),1fr)]'}`}>
        <div className="flex flex-col gap-6 min-w-0">
          <Card className="!rounded-[18px] p-5">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]"><div className="text-[17px] font-bold">{tx(a.name)}</div></div>
              <div className="seg">{[['7', t.hisDaily], ['4w', t.hisWeekly], ['28', t.hisMonthly]].map(([k, l]) => <button key={k} className={range === k ? 'on' : ''} onClick={() => setRange(k)}>{l}</button>)}</div>
            </div>
            <div className="seg mt-3 self-start inline-flex">{['eating', 'activity', 'resting', 'pacing'].map(m => <button key={m} className={metric === m ? 'on' : ''} onClick={() => setMetric(m)}>{names[m]}</button>)}</div>
            <div className="h-[240px] mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#8A97A8' }} axisLine={false} tickLine={false} interval={range === '28' ? 3 : 0} />
                  <YAxis tick={{ fontSize: 10, fill: '#B9C4D3' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tip} formatter={v => [`${fmt(v)} ${units[metric]}`, names[metric]]} />
                  <ReferenceLine y={av} stroke="#B9C4D3" strokeDasharray="4 4" label={{ value: `${t.avg7} ${fmt(av)}`, position: 'insideTopRight', fontSize: 10, fill: '#8A97A8' }} />
                  <Area type="monotone" dataKey="v" stroke="#2E86DE" fill="#2E86DE" fillOpacity={0.12} strokeWidth={2} dot={range !== '28'} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          {cam && <Card className="!rounded-[18px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EEF2F7]"><div className="text-[17px] font-bold">{t.heatTitle} · {tx(a.name)}</div><div className="text-[13px] text-muted mt-0.5">{t.heatSub} · CAM {cam.id}</div></div>
            <CamFeed cam={cam} animals={[]} label={() => ({})}>
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'repeat(7, 1fr)' }}>
                {heat.map((v, i) => <div key={i} style={{ background: `rgba(231, 76, 60, ${(v * 0.75).toFixed(2)})` }} />)}
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 text-[11px] font-semibold text-navy shadow"><span>{t.heatLow}</span><span className="w-20 h-2 rounded" style={{ background: 'linear-gradient(90deg, rgba(231,76,60,0), rgba(231,76,60,.75))' }} /><span>{t.heatHigh}</span></div>
            </CamFeed>
          </Card>}
        </div>
        <Card className="!rounded-[18px] overflow-hidden">
          <div className="h-[150px] relative"><Photo a={a} className="w-full h-full" /><div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white"><div className="text-lg font-bold">{a.emoji} {tx(a.name)}</div><div className="text-xs opacity-90">{tx(a.species)} · {tx(a.enclosure)}</div></div></div>
          <div className="p-5">
            <div className="text-[15px] font-bold">{t.hisObs}</div>
            <div className="flex flex-col gap-2.5 mt-3">
              {obs.map((o, i) => <div key={i} className="px-3.5 py-3 rounded-xl bg-ground"><div className="flex justify-between text-[11px] text-muted font-mono"><span>{dayLabel(now, o.daysAgo, L)}</span><span>{o.by === 'vet' ? '🩺 ' + t.vet : '🧑‍🌾 ' + t.keeper}</span></div><div className="text-[13px] text-[#2B3A50] mt-1 leading-snug">{tx(o.text)}</div></div>)}
            </div>
            <button onClick={() => openProfile(a.id)} className="mt-4 w-full py-2 border border-line rounded-[10px] bg-white hover:bg-[#E8F1FC] text-ocean text-[13px] font-semibold transition">{t.viewProfile}</button>
          </div>
        </Card>
      </div>
    </>
  );
}
