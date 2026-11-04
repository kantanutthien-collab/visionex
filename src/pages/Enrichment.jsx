import React, { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { ENRICHMENT, ENRICHMENT_LOG } from '../data/mock.js';
import Photo from '../components/Photo.jsx';
import { photoOf } from '../data/photos.js';
import { enrichmentNeeds, avg6 } from '../lib/analysis.js';
import { Card, EmptyState } from '../components/ui.jsx';

const RESP = { positive: { bg: '#E8F8EF', color: '#1F8A4C' }, neutral: { bg: '#EEF2F7', color: '#4A5A70' }, negative: { bg: '#FDEAEA', color: '#C0392B' } };
const load = () => { try { return JSON.parse(localStorage.getItem('visionex-enrich') || '[]'); } catch { return []; } };

export default function Enrichment({ t, L, tx, animals, openProfile }) {
  const [extra, setExtra] = useState(load);
  const [form, setForm] = useState({ animalId: animals[0]?.id || '', idx: 0, response: 'positive', after: { activity: 55, pacing: 3 } });
  const [saved, setSaved] = useState(false);
  const [showLib, setShowLib] = useState(false);
  const byId = id => animals.find(a => a.id === id);
  const needs = enrichmentNeeds(animals, L);
  const formAnimal = animals.find(a => a.id === form.animalId) || animals[0];
  const lib = formAnimal ? (ENRICHMENT[formAnimal.id] || []) : [];
  const logs = [...extra, ...ENRICHMENT_LOG].filter(e => byId(e.animalId));
  const pick = (animalId, idx) => { const a = byId(animalId); setForm({ animalId, idx, response: 'positive', after: { activity: a.activity[6], pacing: a.pacing[6] } }); document.getElementById('enrich-form')?.scrollIntoView({ behavior: 'smooth' }); };
  const save = () => {
    const a = byId(form.animalId) || animals[0]; if (!a || !ENRICHMENT[a.id]?.[form.idx]) return;
    const entry = { id: 'u' + Date.now(), animalId: a.id, activity: ENRICHMENT[a.id][form.idx], day: { th: 'วันนี้', en: 'Today' }, time: new Date().toTimeString().slice(0, 5), before: { activity: Math.round(avg6(a.activity)), pacing: Math.round(avg6(a.pacing)) }, after: { activity: +form.after.activity, pacing: +form.after.pacing }, response: form.response };
    const n = [entry, ...extra]; setExtra(n); localStorage.setItem('visionex-enrich', JSON.stringify(n)); setSaved(true); setTimeout(() => setSaved(false), 2500);
  };
  const Bar = ({ label, b, af, max, badUp }) => { const good = badUp ? af <= b : af >= b; return (
    <div className="text-xs"><div className="flex justify-between text-muted mb-1"><span>{label}</span><span className="font-mono"><span>{b}</span> → <b style={{ color: af === b ? '#6B7A90' : good ? '#27AE60' : '#E74C3C' }}>{af}</b></span></div>
      <div className="flex flex-col gap-0.5"><div className="h-1.5 rounded bg-[#EEF2F7]"><div className="h-full rounded bg-[#B9C4D3]" style={{ width: Math.min(100, b / max * 100) + '%' }} /></div><div className="h-1.5 rounded bg-[#EEF2F7]"><div className="h-full rounded" style={{ width: Math.min(100, af / max * 100) + '%', background: af === b ? '#6B7A90' : good ? '#27AE60' : '#E74C3C' }} /></div></div></div>); };
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-5">
        {needs.map(({ a, reasons }) => (
          <Card key={a.id} className="!rounded-[18px] overflow-hidden border-t-4 border-[#E67E22]">
            <div className="flex items-center gap-3 p-4"><Photo a={a} className="w-14 h-14 rounded-xl cursor-pointer" onClick={() => openProfile(a.id)} /><div><div className="font-bold text-base">{a.emoji} {tx(a.name)}</div><div className="text-xs text-muted">{tx(a.species)} · {tx(a.enclosure)}</div></div></div>
            <div className="px-4 pb-4 flex flex-col gap-3">
              <div><div className="text-xs text-muted mb-1">{t.enrWhy}</div><ul className="flex flex-col gap-1">{reasons.map((r, i) => <li key={i} className="text-[13px] px-2.5 py-1.5 rounded-lg bg-[#FDF1E6] text-[#9A4E0C]">{r}</li>)}</ul></div>
              <div><div className="text-xs text-muted mb-1">{t.enrSuggest}</div><div className="flex flex-col gap-1.5">{ENRICHMENT[a.id].map((e, i) => <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-ground text-[13px]"><span className="flex-1">{tx(e)}</span><button onClick={() => pick(a.id, i)} className="px-2.5 py-1 rounded-md bg-leaf text-white text-xs font-semibold">{t.enrDoThis}</button></div>)}</div></div>
            </div>
          </Card>))}
        {needs.length === 0 && animals.length > 0 && <Card className="p-6 text-center text-leaf font-semibold">{t.enrNone}</Card>}
        {animals.length === 0 && <EmptyState title={t.emptyTitle} sub={t.emptySub} action={t.emptyAdd} onAction={() => openProfile(null)} />}
      </div>
      <div className="grid gap-5 items-start lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="!rounded-[18px] p-5">
          <div className="text-[17px] font-bold">{t.enrLog}</div><div className="text-[13px] text-muted mt-0.5">{t.enrLogSub}</div>
          <div className="flex flex-col gap-3 mt-4">
            {logs.map(e => { const a = byId(e.animalId), rs = RESP[e.response]; return (
              <div key={e.id} className="grid gap-3 items-center p-3 rounded-xl border border-[#EEF2F7] md:grid-cols-[auto_1fr_1fr_1fr]">
                <div className="flex items-center gap-2.5 min-w-[180px]"><Photo a={a} className="w-10 h-10 rounded-lg" /><div><div className="text-sm font-semibold">{tx(a.name)}</div><div className="text-[11px] text-muted">{tx(e.day)} {e.time}</div></div></div>
                <div className="text-[13px]"><div className="font-semibold">{tx(e.activity)}</div><span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: rs.bg, color: rs.color }}>{e.response === 'positive' ? t.enrPositive : e.response === 'neutral' ? t.enrNeutral : t.enrNegative}</span></div>
                <Bar label={t.enrActivityIdx} b={e.before.activity} af={e.after.activity} max={100} badUp={false} />
                <Bar label={t.enrPacingN} b={e.before.pacing} af={e.after.pacing} max={15} badUp />
              </div>); })}
          </div>
        </Card>
        <Card id="enrich-form" className="!rounded-[18px] p-5">
          <div className="text-[15px] font-bold">{t.enrAddTitle}</div>
          <label className="block text-xs text-muted mt-3 mb-1">{t.enrAnimal}</label>
          <select value={form.animalId} onChange={e => setForm({ ...form, animalId: e.target.value, idx: 0 })} className="w-full px-3 py-2.5 border border-line rounded-[10px] text-sm bg-[#FAFBFD]">{animals.map(a => <option key={a.id} value={a.id}>{a.emoji} {tx(a.name)} · {tx(a.species)}</option>)}{animals.length === 0 && <option value="">—</option>}</select>
          <label className="block text-xs text-muted mt-3 mb-1">{t.enrActivity}</label>
          <select value={form.idx} onChange={e => setForm({ ...form, idx: +e.target.value })} className="w-full px-3 py-2.5 border border-line rounded-[10px] text-sm bg-[#FAFBFD]">{lib.map((e, i) => <option key={i} value={i}>{tx(e)}</option>)}</select>
          <label className="block text-xs text-muted mt-3 mb-1">{t.enrAfter}</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted">{t.enrActivityIdx}<input type="number" min="0" max="100" value={form.after.activity} onChange={e => setForm({ ...form, after: { ...form.after, activity: e.target.value } })} className="w-full mt-1 px-3 py-2 border border-line rounded-[10px] text-sm bg-[#FAFBFD]" /></label>
            <label className="text-xs text-muted">{t.enrPacingN}<input type="number" min="0" max="30" value={form.after.pacing} onChange={e => setForm({ ...form, after: { ...form.after, pacing: e.target.value } })} className="w-full mt-1 px-3 py-2 border border-line rounded-[10px] text-sm bg-[#FAFBFD]" /></label>
          </div>
          <label className="block text-xs text-muted mt-3 mb-1">{t.enrResponse}</label>
          <div className="seg">{['positive', 'neutral', 'negative'].map(r => <button key={r} className={`flex-1 ${form.response === r ? 'on' : ''}`} onClick={() => setForm({ ...form, response: r })}>{r === 'positive' ? t.enrPositive : r === 'neutral' ? t.enrNeutral : t.enrNegative}</button>)}</div>
          <button onClick={save} className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-leaf text-white text-sm font-semibold">{saved ? <><CheckCircle2 size={16} />{t.enrSaved}</> : t.enrSave}</button>
        </Card>
      </div>
    </>
  );
}
