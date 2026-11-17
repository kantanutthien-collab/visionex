import React from 'react';
import { X, AlertTriangle, Video, Activity, Bell, FileText, ClipboardCheck, TrendingUp, Thermometer, Sparkles, ArrowRight, Siren, Clock, CheckCircle2 } from 'lucide-react';
import { EMOTIONS, HABITATS, SENSOR_LABELS } from '../data/mock.js';
import Photo from '../components/Photo.jsx';
import { photoOf } from '../data/photos.js';
import { hColor, CODES, sensorStatus, earlyWarnings, boxStatus, BOX_STYLE } from '../lib/analysis.js';
import CamFeed from '../components/CamFeed.jsx';
import { Card, HealthBar, EmptyState, EmotionPill } from '../components/ui.jsx';
import ScanCard from '../components/ScanCard.jsx';

export default function Overview({ t, L, tx, animals, cameras, alerts, openProfile, go, selectCamera, mode, tasksPending, tasks, piUrl, setPiUrl, live, startScan, addExample }) {
  const ORDER = { danger: 0, watch: 1, ok: 2 };
  const wall = animals.map(a => ({ a, cam: cameras.find(c => c.id === a.camera), st: boxStatus(a, alerts) })).sort((x, y) => ORDER[x.st] - ORDER[y.st]);
  const HABITATS_ACTIVE = HABITATS.filter(h => h.animals.some(id => animals.some(a => a.id === id)));
  const [showAll, setShowAll] = React.useState(false);
  const [open, setOpen] = React.useState(null); // id of the camera box that is enlarged (click in / click out)
  React.useEffect(() => { const k = e => e.key === 'Escape' && setOpen(null); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const big = open ? wall.find(w => w.a.id === open) : null;
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
      {animals.length > 0 && <div className="flex items-center gap-3 flex-wrap -mb-2">
        <div className="flex-1 min-w-[160px]"><div className="text-[17px] font-bold">{t.wallTitle} <span className="font-mono text-muted text-sm">{animals.length}</span></div><div className="text-[12px] text-muted">{t.wallSub}</div></div>
        <div className="flex gap-3 w-full md:w-auto">{['ok', 'watch', 'danger'].map(k => <span key={k} className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: BOX_STYLE[k].color }}><span className="w-4 h-4 rounded-[5px] border-[3px]" style={{ borderColor: BOX_STYLE[k].color, background: BOX_STYLE[k].bg }} />{t[k === 'ok' ? 'boxOk' : k === 'watch' ? 'boxWatch' : 'boxDanger']}</span>)}</div>
      </div>}
      {animals.length === 0 && <EmptyState title={t.emptyTitle} sub={mode === 'admin' ? t.emptySub : t.emptyAskAdmin} action={mode === 'admin' ? t.emptyAdd : undefined} onAction={() => go('manage')} action2={mode === 'admin' ? t.addExample : undefined} onAction2={addExample} />}
      {big && (() => { const { a, cam, st } = big, bs = BOX_STYLE[st], word = t[st === 'ok' ? 'boxOk' : st === 'watch' ? 'boxWatch' : 'boxDanger']; return (
        <Card className="!rounded-[20px] overflow-hidden border-[5px] animate-fadeIn" style={{ borderColor: bs.color }}>
          <div className="flex items-center gap-3 px-4 py-2.5 text-white" style={{ background: bs.color }}>
            <span className="text-[22px]">{a.emoji}</span>
            <div className="flex-1 min-w-0"><div className="font-bold text-[17px] leading-tight truncate">{tx(a.name)} <span className="font-normal text-[13px] opacity-90">· {tx(a.species)} · {tx(a.enclosure)}</span></div></div>
            <span className="text-[13px] font-bold px-2.5 py-1 rounded-full bg-white/25 whitespace-nowrap">{word}</span>
            <button onClick={() => setOpen(null)} title={t.wallClose} className="w-9 h-9 rounded-full bg-white/25 hover:bg-white/40 grid place-items-center"><X size={18} /></button>
          </div>
          <div onClick={() => setOpen(null)} className="cursor-zoom-out">
            {cam ? <CamFeed cam={cam} animals={[a]} label={() => ({ color: bs.color, node: null })} /> : <div className="aspect-video relative"><Photo a={a} className="w-full h-full" /></div>}
          </div>
          <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
            <EmotionPill emotion={a.emotion} L={L} size="text-sm px-3 py-1.5" />
            <span className="text-[13px] text-muted">{t.healthScore} <b className="font-mono text-[15px]" style={{ color: hColor(a.health) }}>{a.health}</b></span>
            <span className="text-[12px] text-muted font-mono">CAM {cam ? cam.id : '—'}</span>
            <div className="flex-1" />
            <button onClick={() => setOpen(null)} className="px-3.5 py-2 rounded-[10px] bg-[#EEF2F7] text-ink text-sm font-semibold">← {t.wallClose}</button>
            <button onClick={() => openProfile(a.id)} className="px-3.5 py-2 rounded-[10px] bg-[#E8F1FC] text-ocean text-sm font-semibold">{t.viewProfile}</button>
            <button onClick={() => { if (cam) selectCamera(cam.id); go('live'); }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-ocean text-white text-sm font-semibold"><Video size={15} />{t.navLive}</button>
          </div>
        </Card>); })()}
      <div className={`grid gap-3 md:gap-4 ${big ? 'grid-cols-3 md:grid-cols-6' : 'grid-cols-2 md:grid-cols-3'}`}>
        {wall.map(({ a, cam, st }) => { const bs = BOX_STYLE[st], word = t[st === 'ok' ? 'boxOk' : st === 'watch' ? 'boxWatch' : 'boxDanger']; return (
          <button key={a.id} onClick={() => setOpen(open === a.id ? null : a.id)} className={`relative rounded-2xl overflow-hidden text-left border-[4px] bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift ${st === 'danger' ? 'ring-4 ring-[#E74C3C]/25' : ''} ${open === a.id ? 'ring-4 ring-ocean/40' : ''}`} style={{ borderColor: bs.color, opacity: open && open !== a.id ? 0.7 : 1 }}>
            {cam ? <CamFeed cam={cam} animals={[a]} label={() => ({ color: bs.color, node: null })} /> : <div className="aspect-video relative"><Photo a={a} className="w-full h-full" /></div>}
            {!big && <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/55 text-white text-[10px] font-mono tracking-wide"><span className="w-1.5 h-1.5 rounded-full bg-[#FF5252] animate-pulse2" />CAM {cam ? cam.id : '—'}</div>}
            <div className={`flex items-center gap-2 text-white ${big ? 'px-2 py-1' : 'px-2.5 md:px-3 py-2'}`} style={{ background: bs.color }}>
              <span className={big ? 'text-[13px]' : 'text-[16px] md:text-[18px]'}>{a.emoji}</span>
              <span className={`font-bold truncate flex-1 ${big ? 'text-[11px]' : 'text-[13px] md:text-[15px]'}`}>{tx(a.name)}</span>
              {!big && <span className="text-[11px] md:text-[12px] font-bold px-2 py-0.5 rounded-full bg-white/25 whitespace-nowrap">{word}</span>}
            </div>
          </button>); })}
      </div>
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
      <ScanCard t={t} piUrl={piUrl} setPiUrl={setPiUrl} live={live} startScan={startScan} go={go} />
    </>
  );
}
