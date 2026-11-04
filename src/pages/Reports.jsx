import React from 'react';
import { Printer, FileText } from 'lucide-react';
import { BEHAVIORS, BEHAVIOR_SEED, HABITATS, SENSOR_LABELS } from '../data/mock.js';
import Photo from '../components/Photo.jsx';
import { photoOf, focusOf } from '../data/photos.js';
import { statusOf, STATUS_STYLE, SEV_STYLE, sensorStatus, SENSOR_STYLE, activeHours, trend, stressTrend, hColor } from '../lib/analysis.js';
import { Card, EmptyState } from '../components/ui.jsx';

export default function Reports({ t, L, tx, animals, alerts, log, now, openProfile }) {
  const HABITATS_ACTIVE = HABITATS.filter(h => h.animals.some(id => animals.some(a => a.id === id)));
  const notes = (() => { try { return JSON.parse(localStorage.getItem('visionex-notes') || '{}'); } catch { return {}; } })();
  const dateStr = now.toLocaleDateString(L === 'th' ? 'th-TH' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayAlerts = alerts.filter(a => a.day.en === 'Today');
  const sensorsOut = HABITATS_ACTIVE.flatMap(h => h.sensors).filter(s => sensorStatus(s) === 'out').length;
  const okCount = animals.filter(a => statusOf(a.health) === 'healthy').length;
  // behaviours observed today = seeded camera log for this animal + live entries added this session
  const behaviorsFor = a => { const c = {}; [...(BEHAVIOR_SEED[a.camera] || []).map(x => ({ animalId: x[1], behavior: x[2] })), ...log].filter(e => e.animalId === a.id).forEach(e => c[e.behavior] = (c[e.behavior] || 0) + 1); return Object.entries(c).sort((x, y) => y[1] - x[1]); };
  return (
    <>
      <Card className="!rounded-[18px] p-5 flex items-center gap-4 flex-wrap print:shadow-none">
        <div className="w-11 h-11 rounded-xl bg-[#E8F1FC] text-ocean grid place-items-center flex-none"><FileText size={22} /></div>
        <div className="flex-1 min-w-[220px]"><div className="text-[17px] font-bold">{dateStr}</div><div className="text-[13px] text-muted mt-0.5">{t.repGenerated} {now.toTimeString().slice(0, 5)}</div></div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-navy text-white text-sm font-semibold print:hidden"><Printer size={16} />{t.repPrint}</button>
      </Card>
      {animals.length === 0 && <EmptyState title={t.emptyTitle} sub={t.emptySub} action={t.emptyAdd} onAction={() => openProfile(null)} />}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(360px,100%),1fr))] gap-5">
        {animals.map(a => {
          const st = statusOf(a.health), ss = STATUS_STYLE[st], mv = activeHours(a), rs = a.resting[6], hab = HABITATS_ACTIVE.find(h => h.animals.includes(a.id));
          const chips = [[t.eating, trend(a.eating, true)], [t.activity, trend(a.activity, true)], [t.resting, trend(a.resting, true)], [t.pacing, stressTrend(a)]];
          const myAlerts = todayAlerts.filter(x => x.animalId === a.id);
          return (
            <Card key={a.id} className="!rounded-[18px] overflow-hidden break-inside-avoid">
              <div className="flex items-center gap-3 p-4 border-b border-[#EEF2F7]">
                <Photo a={a} className="w-14 h-14 rounded-xl cursor-pointer" onClick={() => openProfile(a.id)} />
                <div className="flex-1 min-w-0"><div className="font-bold text-base">{a.emoji} {tx(a.name)}</div><div className="text-xs text-muted">{tx(a.species)} · {tx(a.enclosure)}</div></div>
                <div className="text-right"><div className="font-mono text-xl font-semibold" style={{ color: hColor(a.health) }}>{a.health}</div><span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: ss.bg, color: ss.color }}>{t[st]}</span></div>
              </div>
              <div className="p-4 flex flex-col gap-3.5 text-[13px]">
                <div>
                  <div className="flex justify-between text-xs text-muted mb-1"><span>{t.repMoving} <b className="text-ink font-mono">{mv} {t.hrs}</b></span><span>{t.repResting} <b className="text-ink font-mono">{rs} {t.hrs}</b></span></div>
                  <div className="h-2.5 rounded-full overflow-hidden flex bg-[#EEF2F7]"><div className="bg-ocean" style={{ width: mv / 24 * 100 + '%' }} /><div className="bg-[#B9C4D3]" style={{ width: rs / 24 * 100 + '%' }} /></div>
                </div>
                <div><div className="text-xs text-muted mb-1.5">{t.repChange}</div><div className="grid grid-cols-2 gap-1.5">{chips.map(([l, v]) => <div key={l} className="flex justify-between px-2.5 py-1.5 rounded-lg bg-ground text-xs"><span>{l}</span><span className="font-semibold font-mono" style={{ color: v.color }}>{v.arrow} {v.text}</span></div>)}</div></div>
                {hab && <div><div className="text-xs text-muted mb-1.5">{t.repEnv} · {tx(hab.name)}</div><div className="flex flex-wrap gap-1.5">{hab.sensors.map(s => { const x = SENSOR_STYLE[sensorStatus(s)]; return <span key={s.key} className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: x.bg, color: x.color }}>{SENSOR_LABELS[s.key][L]} {s.value}{s.unit}</span>; })}</div></div>}
                <div><div className="text-xs text-muted mb-1.5">{t.repAlerts}</div>{myAlerts.length ? myAlerts.map(x => <div key={x.id} className="flex gap-2 items-start text-xs py-1"><span className="px-1.5 py-0.5 rounded-full font-bold flex-none" style={{ background: SEV_STYLE[x.severity].bg, color: SEV_STYLE[x.severity].color }}>{t[x.severity]}</span><span className="text-[#2B3A50]">{x.time} · {tx(x.reason)}</span></div>) : <div className="text-xs text-leaf font-semibold">{t.repNoAlerts}</div>}</div>
                <div className="pt-3 border-t border-[#EEF2F7]"><div className="text-xs text-muted mb-1">{t.repNote}</div><div className={`text-[13px] leading-snug ${notes[a.id] ? 'text-[#2B3A50]' : 'text-[#B9C4D3] italic'}`}>{notes[a.id] || t.repNoNote}</div></div>
              </div>
            </Card>);
        })}
      </div>
    </>
  );
}
