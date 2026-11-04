import React, { useState } from 'react';
import { ScanLine } from 'lucide-react';
import { DEX, DEX_FEATURES, EMOTIONS } from '../data/mock.js';
import Photo from '../components/Photo.jsx';
import { photoOf, focusOf } from '../data/photos.js';
import { Card, EmptyState } from '../components/ui.jsx';

// Live Dex = the AI's photo album. Written so a trainee can read a card top-to-bottom without knowing the tech.
export default function LiveDex({ t, L, tx, animals, sightings, lastSeen, openProfile, startScan }) {
  const [tech, setTech] = useState({});
  const totalScans = Object.values(sightings).reduce((a, b) => a + b, 0);
  const avgAcc = Math.round(animals.reduce((s, a) => s + (DEX[a.id]?.accuracy || 0), 0) / Math.max(1, animals.length));
  const tiles = [{ label: t.dexAnimals, value: animals.length, color: '#0F2A4A' }, { label: t.dexScans, value: totalScans, color: '#27AE60' }, { label: t.dexAcc, value: avgAcc + '%', color: '#2E86DE' }];
  const confColor = v => v >= 95 ? '#27AE60' : v >= 88 ? '#E67E22' : '#E74C3C';
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-5">
        {animals.map(a => { const x = DEX[a.id]; if (!x) return null; const e = EMOTIONS[a.emotion], ls = lastSeen[a.id], seen = x.sightings + (sightings[a.id] || 0), cc = confColor(x.accuracy); return (
          <Card key={a.id} className="!rounded-[18px] overflow-hidden animate-fadeIn">
            <div className="h-[150px] relative">
              <Photo a={a} className="w-full h-full cursor-pointer" onClick={() => openProfile(a.id)} />
              <span className="absolute left-3 top-3 px-2 py-0.5 rounded-md bg-navy/80 text-white font-mono text-[11px] tracking-[.08em]">{x.code}</span>
              <span className="absolute right-3 top-3 px-2.5 py-1 rounded-full bg-white text-[12px] font-semibold shadow-sm" style={{ color: e.color }}>{e.emoji} {e[L]}</span>
            </div>
            <div className="p-4 flex flex-col gap-3.5">
              <div><div className="text-[19px] font-bold">{a.emoji} {tx(a.name)}</div><div className="text-[13px] text-muted">{tx(a.species)} · {tx(a.enclosure)}</div></div>
              <div>
                <div className="text-xs text-muted mb-1.5">{t.dexHow} {tx(a.name)}</div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px] px-3 py-2.5 rounded-xl bg-ground">
                  <span>🔳 {t.fPattern}</span><span className="font-medium">{tx(x.pattern)}</span>
                  <span>📏 {t.fSize}</span><span className="font-medium">{tx(x.size)}</span>
                  <span>🎨 {t.fCoat}</span><span className="font-medium">{tx(x.coat)}</span>
                  <span>✨ {t.fMark}</span><span className="font-medium">{tx(x.mark)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-muted">{t.dexConfidence}</span><span className="font-mono font-bold" style={{ color: cc }}>{x.accuracy}%</span></div>
                <div className="h-2.5 rounded bg-[#EEF2F7] overflow-hidden"><div className="h-full rounded" style={{ width: x.accuracy + '%', background: cc }} /></div>
                              </div>
              <button onClick={() => startScan(a.camera)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-navy hover:bg-[#163B66] text-white text-sm font-semibold transition"><ScanLine size={16} />{t.scanOnCam} {a.camera}</button>
            </div>
          </Card>); })}
      </div>
    </>
  );
}
