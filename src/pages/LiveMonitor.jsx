import React from 'react';
import { ScanLine } from 'lucide-react';
import { EMOTIONS, BEHAVIORS, DEX } from '../data/mock.js';
import { Card, EmptyState } from '../components/ui.jsx';
import CamFeed, { CamPicker } from '../components/CamFeed.jsx';
import Photo from '../components/Photo.jsx';
import ScanCard from '../components/ScanCard.jsx';

const BEH_STYLE = { pacing: { bg: '#FDF1E6', color: '#B35C0F' }, eating: { bg: '#E8F8EF', color: '#1F8A4C' }, playing: { bg: '#E8F1FC', color: '#2E86DE' }, resting: { bg: '#EEF2F7', color: '#4A5A70' }, walking: { bg: '#EEF2F7', color: '#4A5A70' }, drinking: { bg: '#E8F1FC', color: '#2E86DE' } };

export default function LiveMonitor({ t, L, tx, animals, cameras, camera, selectCamera, log, scan, startScan, openProfile, clock, tele, narrow, current, piUrl, setPiUrl, live, go }) {
  const cam = cameras.find(c => c.id === camera) || cameras[0];
  if (!cam) return <ScanCard t={t} piUrl={piUrl} setPiUrl={setPiUrl} live={live} startScan={startScan} go={go} />;
  const byId = id => animals.find(a => a.id === id);
  const scanning = scan?.phase === 'scanning';
  const pct = scanning ? scan.pct : 0;
  const stage = pct < 35 ? t.stageDetect : pct < 70 ? t.stageExtract : t.stageMatch;
  const done = scan?.phase === 'done' && scan.cam === camera;
  const camStatus = c => { const a = c.boxes[0] && byId(c.boxes[0].animalId); return a ? EMOTIONS[a.emotion].color : '#B9C4D3'; };
  const label = (a, b) => { const e = EMOTIONS[a.emotion]; const beh = b.behavior ? ` · ${BEHAVIORS[b.behavior]?.[L] || b.behavior}` : ''; return { color: e.color, node: <span className="px-2 py-0.5 rounded-[4px] text-xs font-semibold text-white shadow" style={{ background: e.color }}>{cam.live ? tx(a.name) : b.tag}{beh} · {e.emoji} {e[L]} {b.conf}%</span> }; };
  return (
    <>
      <CamPicker cams={cameras} value={camera} onChange={selectCamera} tx={tx} status={camStatus} />
      <div className={`grid gap-6 items-start ${narrow ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_340px]'}`}>
        <Card className="!rounded-[18px] overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-3 flex-wrap border-b border-[#EEF2F7]">
            <div className="flex-1 min-w-[180px]"><div className="text-[17px] font-bold">{tx(cam.name)}</div><div className="text-xs text-muted mt-0.5">{cam.boxes.map(b => byId(b.animalId)).filter(Boolean).map(a => tx(a.name)).filter((v, i, arr) => arr.indexOf(v) === i).join(', ')}</div></div>
            <button onClick={() => startScan()} disabled={scanning} className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-white text-[13px] font-semibold shadow-[0_4px_12px_rgba(39,174,96,.25)] transition hover:brightness-110 ${scanning ? 'bg-[#8A97A8]' : 'bg-leaf'}`}><ScanLine size={16} />{scanning ? t.scanning : t.scan}</button>
          </div>
          <CamFeed cam={cam} animals={animals} label={label}>
            {scanning && <>
              <div className="absolute inset-0 bg-navy/35 z-[2]" />
              <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-leaf to-transparent shadow-[0_0_16px_#27AE60] z-[3] transition-[top] duration-100" style={{ top: pct + '%' }} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] px-5 py-3.5 rounded-[10px] bg-navy/90 text-white font-mono text-xs tracking-[.08em] min-w-[260px]">
                <div className="flex justify-between"><span>{stage}</span><span>{pct}%</span></div>
                <div className="h-1 rounded bg-white/15 mt-2.5 overflow-hidden"><div className="h-full bg-leaf transition-all duration-100" style={{ width: pct + '%' }} /></div>
              </div>
            </>}
            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 text-navy text-xs font-bold shadow"><span className="w-2 h-2 rounded-full bg-[#E74C3C] animate-pulse2" />{t.live}{cam.live ? null : ' · ' + t.simFeed}</div>
          </CamFeed>
          {done && (
            <div className="px-5 py-[18px] border-t border-[#EEF2F7] animate-fadeIn">
              <div className="flex justify-between items-baseline flex-wrap gap-2"><div className="text-[15px] font-bold">{t.scanResult}</div><span className="font-mono text-[11px] text-[#8A97A8]">{scan.time}</span></div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-3.5 mt-3.5">
                {scan.results.map(r => { const a = byId(r.animalId), x = DEX[a.id]; return (
                  <div key={r.tag} onClick={() => openProfile(a.id)} className="relative border border-line rounded-[14px] p-3.5 cursor-pointer transition hover:shadow-[0_6px_18px_rgba(15,42,74,.1)]">
                    <div className="flex items-center gap-3">
                      <span className="w-[46px] h-[46px] rounded-xl grid place-items-center text-[26px]" style={{ background: a.tint }}>{a.emoji}</span>
                      <div className="flex-1 min-w-0"><div className="font-bold text-base">{tx(a.name)} <span className="font-mono text-[11px] text-ocean ml-1">{x.code}</span></div><div className="text-xs text-muted">{r.tag} · {tx(a.species)}</div></div>
                      <div className="text-right"><div className="font-mono text-xl font-semibold text-leaf">{r.match}%</div><div className="font-mono text-[10px] text-[#8A97A8] tracking-[.08em]">MATCH</div></div>
                    </div>
                    <div className="text-xs text-[#4A5A70] mt-2.5 leading-snug">{L === 'th' ? `จำได้จาก${tx(x.mark)}` : `Recognised by ${tx(x.mark).toLowerCase()}`}</div>
                  </div>); })}
              </div>
            </div>
          )}
        </Card>
        <div className="flex flex-col gap-5">
        {cam.live && (
          <Card className="!rounded-[18px] px-5 py-[18px]">
            <div className="text-[17px] font-bold">{t.inCam} <span className="font-mono text-muted text-sm">{cam.boxes.length}</span></div>
            <div className="flex flex-col gap-2.5 mt-3">
              {cam.boxes.map(b => { const a = byId(b.animalId); if (!a) return null; const e = EMOTIONS[a.emotion], beh = b.behavior || current?.[a.id]?.behavior || 'resting'; return (
                <div key={b.tag} onClick={() => openProfile(a.id)} className="flex items-center gap-3 p-2.5 rounded-xl border-l-[5px] cursor-pointer hover:bg-ground" style={{ borderColor: e.color, background: e.bg }}>
                  <Photo a={a} className="w-12 h-12 rounded-lg flex-none" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[15px] leading-tight">{a.emoji} {tx(a.name)}</div>
                    <div className="text-xs text-[#4A5A70] mt-0.5">{t.inCamDoing}: <b>{BEHAVIORS[beh]?.[L] || beh}</b> · {t.inCamConf} {b.conf}%</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[12px] font-bold text-white" style={{ background: e.color }}>{e.emoji} {e[L]}</span>
                </div>); })}
              {cam.boxes.length === 0 && <div className="text-sm text-muted py-2">{t.inCamNone}</div>}
            </div>
          </Card>
        )}
        <Card className="!rounded-[18px] px-5 py-[18px]">
          <div className="flex items-center justify-between"><div className="text-[17px] font-bold">{t.behaviorLog}</div><span className="flex items-center gap-1.5 text-xs text-leaf font-semibold"><span className="w-2 h-2 rounded-full bg-leaf animate-pulse2" />{t.realtime}</span></div>
          <div className="flex flex-col gap-1.5 mt-3.5">
            {log.map((e, i) => { const a = byId(e.animalId), s = BEH_STYLE[e.behavior]; return (
              <div key={e.time + i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl animate-fadeIn ${i === 0 ? 'bg-ground' : ''}`}>
                <span className="text-[22px]">{a.emoji}</span>
                <div className="flex-1 min-w-0"><div className="text-sm font-semibold">{tx(a.name)}</div><div className="text-[11px] text-muted font-mono">{e.time}</div></div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>{BEHAVIORS[e.behavior][L]}</span>
              </div>); })}
          </div>
        </Card>
        </div>
      </div>
    </>
  );
}
