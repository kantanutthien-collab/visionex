import React from 'react';
import { AlertTriangle, Video, Activity, Bell, FileText, ClipboardCheck, TrendingUp, Thermometer, Sparkles, ArrowRight, Siren, Clock, CheckCircle2 } from 'lucide-react';
import { EMOTIONS, HABITATS, SENSOR_LABELS } from '../data/mock.js';
import Photo from '../components/Photo.jsx';
import { photoOf } from '../data/photos.js';
import { hColor, CODES, sensorStatus, earlyWarnings } from '../lib/analysis.js';
import { Card, HealthBar, EmptyState } from '../components/ui.jsx';
import ScanCard from '../components/ScanCard.jsx';

export default function Overview({ t, L, tx, animals, alerts, openProfile, go, tasksPending, tasks, piUrl, setPiUrl, live, startScan, addExample }) {
  const HABITATS_ACTIVE = HABITATS.filter(h => h.animals.some(id => animals.some(a => a.id === id)));
  const [showAll, setShowAll] = React.useState(false);
  const attention = animals.filter(a => a.emotion === 'stressed' || a.emotion === 'agitated');
  const count = e => animals.filter(a => a.emotion === e).length;
  const openAlerts = alerts.filter(a => !a.handled).length;
  const sensorsOut = HABITATS_ACTIVE.flatMap(h => h.sensors).filter(s => sensorStatus(s) === 'out').length;
  const warnings = earlyWarnings(animals, L).length;
  // "Needs you now": everything a keeper must act on, most urgent first
  const byId = id => animals.find(a => a.id === id);
  const items = [];
  alerts.filter(al => !al.handled && al.severity !== 'info').forEach(al => { const a = byId(al.animalId); if (a) items.push({ sev: al.severity === 'urgent' ? 0 : 1, emoji: a.emoji, title: `${tx(a.name)} · ${t[al.severity]}`, sub: `${tx(al.reason)} · ${al.time}`, label: t.viewProfile, run: () => openProfile(a.id) }); });
  animals.filter(a => (a.emotion === 'stressed' || a.emotion === 'agitated') && !alerts.some(al => !al.handled && al.animalId === a.id)).forEach(a => items.push({ sev: 1, emoji: a.emoji, title: `${tx(a.name)} · ${t.prAnimal}`, sub: `${EMOTIONS[a.emotion][L]} · ${tx(a.enclosure)}`, label: t.viewProfile, run: () => openProfile(a.id) }));
  HABITATS_ACTIVE.forEach(h => h.sensors.filter(x => sensorStatus(x) === 'out').forEach(x => items.push({ sev: 1, emoji: '🌡️', title: `${tx(h.name)} · ${t.prSensor}`, sub: `${SENSOR_LABELS[x.key][L]} ${x.value}${x.unit} (${t.habRange} ${x.range[0]}–${x.range[1]})`, label: t.prCheck, run: () => go('habitat') })));
  (tasks?.routine || []).filter(x => x.overdue && !x.done).forEach(x => { const a = x.animalId ? byId(x.animalId) : null; items.push({ sev: 2, emoji: a ? a.emoji : '📋', title: `${tx(x.title)} · ${t.prOverdue}`, sub: `${x.time}${a ? ' · ' + tx(a.name) : ''}`, label: t.prDoTask, run: () => go('tasks') }); });
  items.sort((x, y) => x.sev - y.sev);
  const SEV = [{ bg: '#FDEAEA', border: '#F2B8B5', color: '#C0392B', Icon: Siren }, { bg: '#FDF1E6', border: '#F5C9A0', color: '#B35C0F', Icon: AlertTriangle }, { bg: '#EEF2F7', border: '#DDE4EE', color: '#4A5A70', Icon: Clock }];
  const shown = showAll ? items : items.slice(0, 4);
  const tiles = [{ label: t.total, value: animals.length, color: '#0F2A4A', bg: '#EEF2F7', emoji: '🐾' }, ...['calm', 'playful', 'stressed', 'agitated'].map(e => ({ label: EMOTIONS[e][L], value: count(e), color: EMOTIONS[e].color, bg: EMOTIONS[e].bg, emoji: EMOTIONS[e].emoji }))];
  // "Find it fast" shortcuts: one per main function, with a live number so keepers see where attention is needed
  const shortcuts = [
    { k: 'live', Icon: Video, title: t.navLive, sub: t.subLive, n: null, color: '#2E86DE' },
    { k: 'alerts', Icon: Bell, title: t.navAlerts, sub: t.subAlerts, n: openAlerts, color: openAlerts ? '#E74C3C' : '#27AE60' },
    { k: 'health', Icon: Activity, title: t.navInsights, sub: t.subInsights, n: warnings, color: warnings ? '#E67E22' : '#27AE60' },
    { k: 'tasks', Icon: ClipboardCheck, title: t.navTasks, sub: t.subTasks, n: tasksPending, color: tasksPending ? '#E67E22' : '#27AE60' },
    { k: 'habitat', Icon: Thermometer, title: t.navHabitat, sub: t.subHabitat, n: sensorsOut, color: sensorsOut ? '#E74C3C' : '#27AE60' },
    { k: 'reports', Icon: FileText, title: t.navReports, sub: t.subReports, n: null, color: '#0F2A4A' },
    { k: 'history', Icon: TrendingUp, title: t.navHistory, sub: t.subHistory, n: null, color: '#0F2A4A' },
    { k: 'enrich', Icon: Sparkles, title: t.navEnrich, sub: t.subEnrich, n: null, color: '#27AE60' },
  ];
  return (
    <>
      <ScanCard t={t} piUrl={piUrl} setPiUrl={setPiUrl} live={live} startScan={startScan} go={go} />
      <Card className="!rounded-[18px] overflow-hidden border-2" style={{ borderColor: items.length ? SEV[items[0].sev].border : '#BDE8CF' }}>
        <div className="px-4 md:px-5 py-3.5 flex items-center gap-3 border-b border-[#EEF2F7]">
          <div className="w-10 h-10 rounded-xl grid place-items-center text-white flex-none" style={{ background: items.length ? SEV[items[0].sev].color : '#27AE60' }}>{items.length ? <Siren size={20} /> : <CheckCircle2 size={20} />}</div>
          <div className="flex-1 min-w-0"><div className="text-[18px] font-bold leading-tight">{t.prTitle} {items.length > 0 && <span className="font-mono text-base ml-1" style={{ color: SEV[items[0].sev].color }}>({items.length})</span>}</div><div className="text-[13px] text-muted">{t.prSub}</div></div>
        </div>
        <div className="p-3 md:p-4 flex flex-col gap-2.5">
          {shown.map((it, i) => { const sv = SEV[it.sev]; return (
            <div key={i} className="flex items-center gap-3 px-3.5 py-3 rounded-xl border-l-[6px] flex-wrap" style={{ background: sv.bg, borderColor: sv.color }}>
              <span className="text-[26px] flex-none">{it.emoji}</span>
              <div className="flex-1 min-w-[160px]"><div className="text-[15px] md:text-[16px] font-bold leading-tight" style={{ color: sv.color }}>{it.title}</div><div className="text-[13px] text-[#2B3A50] mt-0.5 leading-snug">{it.sub}</div></div>
              <button onClick={it.run} className="w-full sm:w-auto px-4 py-2.5 rounded-[10px] text-white text-sm font-bold shadow" style={{ background: sv.color }}>{it.label} →</button>
            </div>); })}
          {items.length === 0 && <div className="px-4 py-3 rounded-xl bg-[#E8F8EF] text-[#1F8A4C] font-semibold text-[15px]">{t.prNone}</div>}
          {items.length > 4 && <button onClick={() => setShowAll(!showAll)} className="self-start text-ocean text-sm font-semibold px-2 py-1">{showAll ? '▲' : `${t.prMore} ${items.length - 4} ${t.prItems} ▼`}</button>}
        </div>
      </Card>
      {animals.length === 0 && <EmptyState title={t.emptyTitle} sub={t.emptySub} action={t.emptyAdd} onAction={() => go('manage')} action2={t.addExample} onAction2={addExample} />}
      {animals.length > 0 && <div className="text-[17px] font-bold -mb-2">{t.guestAnimals}</div>}
      <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] gap-3 md:gap-5">
        {[...animals].sort((x, y) => (x.emotion === 'stressed' || x.emotion === 'agitated' ? 0 : 1) - (y.emotion === 'stressed' || y.emotion === 'agitated' ? 0 : 1) || x.health - y.health).map(a => { const e = EMOTIONS[a.emotion], hc = hColor(a.health), hot = a.emotion === 'stressed' || a.emotion === 'agitated'; return (
          <Card key={a.id} onClick={() => openProfile(a.id)} className={`overflow-hidden cursor-pointer transition hover:-translate-y-1 hover:shadow-lift animate-fadeIn !rounded-[18px] ${hot ? 'ring-[3px] ring-[#E74C3C] shadow-[0_8px_24px_rgba(231,76,60,.25)]' : ''}`}>
            <div className="h-[110px] md:h-[160px] relative">
              <Photo a={a} className="w-full h-full" />
              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 to-transparent" />
              <span className="hidden md:block absolute left-3 bottom-2.5 font-mono text-[10px] tracking-[.1em] text-white/90">ID {a.code || CODES[a.id]} · CAM {a.camera}</span>
              <span className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[11px] md:text-[13px] font-bold shadow-sm" style={{ background: hot ? e.color : '#fff', color: hot ? '#fff' : e.color }}>{e.emoji} {e[L]}</span>
              {hot && <span className="absolute left-0 right-0 bottom-0 py-1 text-center text-[11px] font-bold text-white" style={{ background: e.color }}>⚠ {t.needsAttention}</span>}
            </div>
            <div className="px-3 pt-2.5 pb-3 md:px-[18px] md:pt-4 md:pb-[18px]">
              <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-0 md:gap-2"><div className="text-[16px] md:text-[19px] font-bold leading-tight truncate">{a.emoji} {tx(a.name)}</div><div className="text-[12px] md:text-[13px] text-muted truncate">{tx(a.species)}</div></div>
              <div className="mt-2 md:mt-3.5 flex justify-between text-[12px] md:text-[13px] text-muted"><span>{t.healthScore}</span><span className="font-mono font-semibold text-[15px]" style={{ color: hc }}>{a.health}</span></div>
              <div className="mt-1.5"><HealthBar value={a.health} color={hc} /></div>
              <div className="hidden md:block mt-3 text-xs text-[#8A97A8]">{t.updated} {a.minutesAgo === 0 ? t.justNow : `${a.minutesAgo} ${t.minAgo}`}</div>
            </div>
          </Card>); })}
      </div>
    </>
  );
}
