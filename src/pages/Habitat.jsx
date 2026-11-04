import React from 'react';
import { Droplets, ThermometerSun, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { HABITATS, SENSOR_LABELS } from '../data/mock.js';
import Photo from '../components/Photo.jsx';
import { photoOf } from '../data/photos.js';
import { sensorStatus, SENSOR_STYLE, sensorHistory } from '../lib/analysis.js';
import { Card, EmptyState } from '../components/ui.jsx';

export default function Habitat({ t, L, tx, animals, now, openProfile, selectCamera, go }) {
  const HABITATS_ACTIVE = HABITATS.filter(h => h.animals.some(id => animals.some(a => a.id === id)));
  const byId = id => animals.find(a => a.id === id);
  // tiny live drift so the readings tick like real sensors
  const live = (s, i) => +(s.value + Math.sin(now.getMinutes() / 2 + i) * (s.range[1] - s.range[0]) * 0.004).toFixed(s.key === 'ph' || s.key === 'chlorine' ? 2 : 1);
  const issues = HABITATS_ACTIVE.filter(h => h.sensors.some(s => sensorStatus(s) !== 'ok'));
  if (HABITATS_ACTIVE.length === 0) return <EmptyState emoji="🌡️" title={t.emptyTitle} sub={t.emptySub} action={t.emptyAdd} onAction={() => go('manage')} />;
  return (
    <>
      {issues.length ? <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#FDEAEA] border border-[#F2B8B5] text-[#C0392B] font-semibold text-[15px]"><AlertTriangle size={18} />{t.habIssues}: {issues.map(h => tx(h.name)).join(', ')}</div>
        : <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#E8F8EF] border border-[#BDE8CF] text-[#1F8A4C] font-semibold text-[15px]"><CheckCircle2 size={18} />{t.habAllOk}</div>}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-5">
        {HABITATS_ACTIVE.map(h => { const worst = h.sensors.map(sensorStatus).includes('out') ? 'out' : h.sensors.map(sensorStatus).includes('edge') ? 'edge' : 'ok'; const ws = SENSOR_STYLE[worst]; return (
          <Card key={h.id} className="!rounded-[18px] overflow-hidden border-t-4" style={{ borderColor: ws.color }}>
            <div className="px-5 py-4 flex items-center gap-3 border-b border-[#EEF2F7]">
              <div className="flex -space-x-2">{h.animals.map(id => byId(id)).filter(Boolean).map(a => <Photo key={a.id} a={a} className="w-10 h-10 rounded-full ring-2 ring-white cursor-pointer" onClick={() => openProfile(id)} />)}</div>
              <div className="flex-1 min-w-0"><div className="font-bold text-base">{tx(h.name)}</div><div className="text-xs text-muted">{h.animals.map(id => byId(id)).filter(Boolean).map(a => tx(a.name)).join(', ') || '—'} · CAM {h.camera}</div></div>
              {h.aquatic ? <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#E8F1FC] text-ocean text-[11px] font-semibold"><Droplets size={12} />{t.habAquatic}</span> : <ThermometerSun size={18} className="text-[#B9C4D3]" />}
            </div>
            <div className="p-3 flex flex-col gap-2">
              {h.sensors.map((s, i) => { const st = sensorStatus(s), ss = SENSOR_STYLE[st], hist = sensorHistory(s, h.id + s.key).map(v => ({ v })); return (
                <div key={s.key} className="grid grid-cols-[1fr_auto] gap-3 items-center px-3 py-2 rounded-xl" style={{ background: st === 'ok' ? '#FAFBFD' : ss.bg }}>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold">{SENSOR_LABELS[s.key][L]}</div>
                    <div className="text-[11px] text-muted">{t.habRange} {s.range[0]}–{s.range[1]} {s.unit}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-semibold leading-none" style={{ color: ss.color }}>{live(s, i)}<span className="text-[11px] ml-0.5">{s.unit}</span></div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: ss.bg, color: ss.color }}>{st === 'ok' ? t.habOk : st === 'edge' ? t.habEdge : t.habOut}</span>
                  </div>
                </div>); })}
              
            </div>
          </Card>); })}
      </div>
    </>
  );
}
