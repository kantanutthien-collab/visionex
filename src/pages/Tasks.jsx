import React, { useState } from 'react';
import { Check, Plus, Bell, Thermometer, Clock, RotateCcw } from 'lucide-react';
import Photo from '../components/Photo.jsx';
import { photoOf } from '../data/photos.js';
import { SEV_STYLE, hms } from '../lib/analysis.js';
import { Card } from '../components/ui.jsx';

export default function Tasks({ t, L, tx, animals, tasks, toggleTask, addTask, markHandled, go, openProfile }) {
  const [draft, setDraft] = useState('');
  const byId = id => animals.find(a => a.id === id);
  const sections = [
    ['overdue', t.taskOverdue, tasks.all.filter(x => !x.done && x.overdue && x.kind === 'routine'), '#E74C3C'],
    ['alerts', t.taskAlerts, tasks.alertTasks, '#E67E22'],
    ['sensor', t.taskSensor, tasks.sensorTasks.filter(x => !x.done), '#E67E22'],
    ['due', t.taskDue, tasks.all.filter(x => !x.done && !x.overdue && x.kind === 'routine'), '#2E86DE'],
    ['done', t.taskDone, tasks.all.filter(x => x.done), '#27AE60'],
  ];
  const pct = tasks.all.length ? Math.round(tasks.done / tasks.all.length * 100) : 0;
  const submit = () => { if (!draft.trim()) return; addTask({ id: 'x' + Date.now(), time: hms().slice(0, 5), animalId: null, title: { th: draft.trim(), en: draft.trim() } }); setDraft(''); };
  const Row = ({ x }) => { const a = x.animalId ? byId(x.animalId) : null; return (
    <div className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border border-[#EEF2F7] bg-white ${x.done ? 'opacity-60' : ''}`}>
      {x.kind === 'alert'
        ? <button onClick={() => markHandled(x.alertId)} title={t.markHandled} className="w-7 h-7 rounded-lg border-2 border-[#E67E22] grid place-items-center text-[#E67E22] hover:bg-[#FDF1E6]"><Bell size={14} /></button>
        : <button onClick={() => toggleTask(x.id)} className={`w-7 h-7 rounded-lg border-2 grid place-items-center transition ${x.done ? 'bg-leaf border-leaf text-white' : 'border-[#B9C4D3] hover:border-leaf'}`}>{x.done ? <Check size={16} strokeWidth={3} /> : x.kind === 'sensor' ? <Thermometer size={14} className="text-[#E67E22]" /> : null}</button>}
      {a ? <Photo a={a} className="w-9 h-9 rounded-lg cursor-pointer flex-none" onClick={() => openProfile(a.id)} /> : <div className="w-9 h-9 rounded-lg bg-ground grid place-items-center text-lg flex-none">🐾</div>}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${x.done ? 'line-through' : ''}`}>{tx(x.title)}</div>
        <div className="text-[11px] text-muted mt-0.5 flex items-center gap-2 flex-wrap">
          {x.time && <span className="font-mono flex items-center gap-1"><Clock size={11} />{x.time}</span>}
          <span>{a ? tx(a.name) : t.taskEvery}</span>
          {x.kind === 'alert' && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: SEV_STYLE[x.severity].bg, color: SEV_STYLE[x.severity].color }}>{t[x.severity]}</span>}
          {x.kind === 'routine' && x.overdue && !x.done && <span className="px-1.5 py-0.5 rounded-full bg-[#FDEAEA] text-[#C0392B] text-[10px] font-bold">{t.taskOverdue}</span>}
        </div>
      </div>
      {x.kind === 'alert' && <button onClick={() => go('alerts')} className="px-3 py-1.5 rounded-lg bg-[#E8F1FC] text-ocean text-xs font-semibold">{t.taskReview}</button>}
      {x.kind === 'sensor' && <button onClick={() => go('habitat')} className="px-3 py-1.5 rounded-lg bg-[#E8F1FC] text-ocean text-xs font-semibold">{t.taskReview}</button>}
      {x.done && x.kind !== 'alert' && <button onClick={() => toggleTask(x.id)} className="text-muted hover:text-ink" title={t.taskUndo}><RotateCcw size={14} /></button>}
    </div>); };
  return (
    <>
      <Card className="!rounded-[18px] p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1" />
          <div className="min-w-[220px]"><div className="flex justify-between text-xs text-muted mb-1"><span>{t.taskProgress}</span><span className="font-mono font-semibold text-ink">{tasks.done}/{tasks.all.length} · {pct}%</span></div><div className="h-2.5 rounded bg-[#EEF2F7] overflow-hidden"><div className="h-full bg-leaf transition-all" style={{ width: pct + '%' }} /></div></div>
        </div>
        <div className="flex gap-2 mt-4">
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder={t.taskAddPh} className="flex-1 px-3.5 py-2.5 border border-line rounded-[10px] text-sm bg-[#FAFBFD] focus:outline-ocean" />
          <button onClick={submit} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-ocean text-white text-sm font-semibold"><Plus size={16} />{t.taskAdd}</button>
        </div>
      </Card>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-5 items-start">
        {sections.map(([k, title, list, color]) => (
          <Card key={k} className="!rounded-[18px] p-4">
            <div className="flex items-center gap-2 mb-3"><span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} /><div className="font-bold text-[15px] flex-1">{title}</div><span className="font-mono text-sm text-muted">{list.length}</span></div>
            <div className="flex flex-col gap-2">{list.map(x => <Row key={x.id} x={x} />)}{list.length === 0 && <div className="text-center text-sm text-[#8A97A8] py-4">{k === 'due' && tasks.all.length === 0 ? t.noTasks : t.taskAllDone}</div>}</div>
          </Card>))}
      </div>
    </>
  );
}
