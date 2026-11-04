import React, { useState } from 'react';
import { ScanLine, Wifi, WifiOff, Camera } from 'lucide-react';
import { Card } from './ui.jsx';
import { PI_CAM_ID } from '../lib/live.js';

// One card that is always the way to "scan": connect the Pi camera if needed, otherwise press Scan.
export default function ScanCard({ t, piUrl, setPiUrl, live, startScan, go, compact = false }) {
  const [draft, setDraft] = useState(piUrl || '');
  const st = live?.status || 'off', on = st === 'online';
  const color = on ? '#27AE60' : st === 'error' ? '#E74C3C' : st === 'connecting' ? '#E67E22' : '#2E86DE';
  const text = on ? t.piOnline : st === 'error' ? t.piError : st === 'connecting' ? t.piConnecting : t.scanConnectHint;
  return (
    <Card className="!rounded-[18px] p-4 md:p-5 border-2" style={{ borderColor: color }}>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-11 h-11 rounded-xl grid place-items-center text-white flex-none" style={{ background: color }}><Camera size={22} /></div>
        <div className="flex-1 min-w-[180px]"><div className="text-[17px] font-bold">{t.scanTitle}</div><div className="text-[13px]" style={{ color }}>{text}</div></div>
        {on && <button onClick={() => startScan(PI_CAM_ID)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] bg-leaf text-white text-[16px] font-bold shadow-[0_4px_14px_rgba(39,174,96,.35)]"><ScanLine size={20} />{t.scanNow}</button>}
      </div>
      {!on && (
        <div className="flex gap-2 mt-3 flex-wrap">
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && setPiUrl(draft.trim())} placeholder="http://raspberrypi.local:8000" className="flex-1 min-w-[200px] px-3 py-2.5 border border-line rounded-[10px] text-sm bg-[#FAFBFD] focus:outline-ocean" />
          <button onClick={() => setPiUrl(draft.trim())} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-ocean text-white text-sm font-semibold"><Wifi size={16} />{t.piConnect}</button>
          {piUrl && <button onClick={() => { setPiUrl(''); setDraft(''); }} className="flex items-center gap-1.5 px-3 py-2.5 rounded-[10px] bg-[#EEF2F7] text-ink text-sm font-semibold"><WifiOff size={16} />{t.piDisconnect}</button>}
        </div>
      )}
    </Card>
  );
}
