import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { EMOTIONS } from '../data/mock.js';
import { hColor, statusOf, avg6, pctOf, fmt, trend, scoreSummary, earlyWarnings, SEV_STYLE } from '../lib/analysis.js';
import { Card, EmotionPill, EmptyState } from '../components/ui.jsx';
import Photo from '../components/Photo.jsx';
import { photoOf } from '../data/photos.js';

export default function Profile({ t, L, tx, animals, selected, go, now, narrow }) {
  const p = animals.find(a => a.id === selected) || animals[0] || { id: '', name: '', species: '', enclosure: '', age: 0, emotion: 'calm', health: 0, camera: 0, eating: [0,0,0,0,0,0,0], activity: [0,0,0,0,0,0,0], resting: [0,0,0,0,0,0,0], pacing: [0,0,0,0,0,0,0], timeline: Array(12).fill('calm'), emoji: '🐾' };
  const none = animals.length === 0;
  const [notes, setNotes] = useState(() => { try { return JSON.parse(localStorage.getItem('visionex-notes') || '{}'); } catch { return {}; } });
  const [draft, setDraft] = useState(notes[p.id] || '');
  const [saved, setSaved] = useState(false);
  useEffect(() => { setDraft(notes[p.id] || ''); setSaved(false); }, [p.id]);
  const save = () => { const n = { ...notes, [p.id]: draft }; setNotes(n); localStorage.setItem('visionex-notes', JSON.stringify(n)); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const name = tx(p.name), st = statusOf(p.health), hc = hColor(p.health);
  const dayLabels = L === 'th' ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() - 6 + i); return dayLabels[d.getDay()]; });
  const charts = [[t.eating, p.eating, t.kg, false], [t.activity, p.activity, t.idx, false], [t.resting, p.resting, t.hrs, false], [t.pacing, p.pacing, t.times, true]];
  const compare = [[t.eating, p.eating, t.kg, true], [t.activity, p.activity, t.idx, true], [t.resting, p.resting, t.hrs, true], [t.pacing, p.pacing, t.times, false]];
  const indicators = earlyWarnings([p], L);

  if (none) return <EmptyState title={t.emptyTitle} sub={t.emptySub} action={t.emptyAdd} onAction={() => go('manage')} />;
  return (
    <>
      <button onClick={() => go('overview')} className="self-start flex items-center gap-1.5 px-3 py-2 rounded-lg text-ocean text-sm font-semibold hover:bg-[#E8F1FC]"><ArrowLeft size={16} />{t.back}</button>
      <div className={`grid gap-6 items-start ${narrow ? 'grid-cols-1' : 'grid-cols-[minmax(0,1.5fr)_minmax(min(300px,100%),1fr)]'}`}>
        <div className="flex flex-col gap-6 min-w-0">
          <Card className="!rounded-[18px] p-[22px] flex gap-5 items-center flex-wrap">
            <div className="w-[150px] h-[110px] rounded-[20px] overflow-hidden flex-none relative"><Photo a={p} className="w-full h-full" /><span className="absolute left-2 bottom-1.5 text-2xl drop-shadow">{p.emoji}</span></div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3 flex-wrap"><div className="text-[28px] font-bold">{name}</div><EmotionPill emotion={p.emotion} L={L} size="text-sm px-3 py-1.5" /></div>
              <div className="text-[15px] text-muted mt-1.5">{tx(p.species)} · {t.age} {p.age} {t.years} · {tx(p.enclosure)}</div>
            </div>
          </Card>
          <Card className="!rounded-[18px] p-[22px] border-l-4" style={{ borderColor: EMOTIONS[p.emotion].color }}>
            <div className="flex items-center gap-3 flex-wrap"><div className="text-[17px] font-bold flex-1">{t.stateWhy}: <span style={{ color: EMOTIONS[p.emotion].color }}>{EMOTIONS[p.emotion].emoji} {EMOTIONS[p.emotion][L]}</span></div></div>
            <div className="text-[13px] text-muted mt-1">{t.stateWhySub}</div>
            <div className="flex flex-col gap-2 mt-3">
              {indicators.map((w, i) => <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium" style={{ background: SEV_STYLE[w.sev].bg, color: SEV_STYLE[w.sev].color }}><span>⚠️</span>{w.text}</div>)}
              {indicators.length === 0 && <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#E8F8EF] text-[#1F8A4C] text-[14px] font-medium"><span>✅</span>{t.allNormal}</div>}
            </div>
          </Card>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-5">
            {charts.map(([title, arr, unit, badUp]) => {
              const av = avg6(arr), pc = pctOf(arr);
              const tc = Math.abs(pc) < 4 ? '#2E86DE' : (pc > 0) === !badUp ? '#27AE60' : '#E74C3C';
              const data = arr.map((v, i) => ({ day: days[i], v }));
              return (
                <Card key={title} className="!rounded-[18px] p-5">
                  <div className="flex justify-between items-baseline"><div className="text-[15px] font-bold">{title}</div><div className="text-[13px] text-muted whitespace-nowrap">{t.today} <strong style={{ color: Math.abs(pc) < 4 ? '#1B2B3F' : tc }}>{fmt(arr[6])}</strong> {unit}</div></div>
                  <div className="h-[150px] mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} margin={{ top: 16, right: 4, left: -28, bottom: 0 }}>
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8A97A8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#B9C4D3' }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(46,134,222,.06)' }} contentStyle={{ borderRadius: 10, border: '1px solid #DDE4EE', fontSize: 12 }} formatter={v => [`${fmt(v)} ${unit}`, title]} />
                        <ReferenceLine y={av} stroke="#B9C4D3" strokeDasharray="4 4" label={{ value: `${t.avg7} ${fmt(av)}`, position: 'insideTopRight', fontSize: 10, fill: '#8A97A8' }} />
                        <Bar dataKey="v" radius={[5, 5, 0, 0]}>{data.map((_, i) => <Cell key={i} fill={i === 6 ? tc : '#D6E4F5'} />)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>);
            })}
          </div>
        </div>
        <div className="flex flex-col gap-6 min-w-0">
          <Card className="!rounded-[18px] p-[22px]">
            <div className="text-[17px] font-bold">{t.healthScore}</div>
            <div className="grid place-items-center mt-2">
              <svg viewBox="0 0 200 115" className="w-[220px]">
                <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#EEF2F7" strokeWidth="16" strokeLinecap="round" />
                <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke={hc} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${p.health / 100 * 251.3} 251.3`} style={{ transition: 'stroke-dasharray .6s' }} />
                <text x="100" y="92" fontSize="44" fontWeight="600" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fill={hc}>{p.health}</text>
                <text x="100" y="110" fontSize="12" textAnchor="middle" fill="#8A97A8">/ 100 · {t[st]}</text>
              </svg>
            </div>
          </Card>
          <Card className="!rounded-[18px] p-[22px]">
            <div className="text-[17px] font-bold">{t.notes}</div>
            <textarea value={draft} onChange={e => { setDraft(e.target.value); setSaved(false); }} placeholder={t.notesPh} rows={5} className="w-full mt-3 px-3.5 py-3 border border-line rounded-xl text-sm leading-relaxed resize-y bg-[#FAFBFD] focus:outline-ocean" />
            <div className="flex items-center gap-3 mt-3">
              <button onClick={save} className="px-[18px] py-2.5 rounded-[10px] bg-leaf hover:bg-[#1F9A52] text-white text-sm font-semibold transition">{t.save}</button>
              {saved && <span className="text-[13px] text-leaf font-semibold animate-fadeIn">✓ {t.saved}</span>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
