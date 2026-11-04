import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { SEV_STYLE } from '../lib/analysis.js';
import { Card } from '../components/ui.jsx';

export default function Alerts({ t, tx, animals, alerts, markHandled, openProfile }) {
  const [tab, setTab] = useState('all');
  const unhandled = alerts.filter(a => !a.handled).length;
  const list = alerts.filter(a => tab === 'all' || (tab === 'open' ? !a.handled : a.handled));
  const tabs = [['all', t.all, alerts.length], ['open', t.open, unhandled], ['handled', t.handled, alerts.length - unhandled]];
  return (
    <>
      <div className="seg self-start">{tabs.map(([k, l, n]) => <button key={k} className={`!px-4 !py-2 !text-sm ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{l} <span className="opacity-60">{n}</span></button>)}</div>
      <div className="flex flex-col gap-3">
        {list.map(al => { const a = animals.find(x => x.id === al.animalId), sv = SEV_STYLE[al.severity]; return (
          <Card key={al.id} className="px-5 py-[18px] flex items-center gap-4 flex-wrap animate-fadeIn" style={{ opacity: al.handled ? .65 : 1 }}>
            <div className="w-[46px] h-[46px] rounded-xl grid place-items-center text-2xl flex-none" style={{ background: a.tint }}>{a.emoji}</div>
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-2.5 flex-wrap"><span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: sv.bg, color: sv.color }}>{t[al.severity]}</span><span className="font-bold text-base">{tx(a.name)}</span><span className="text-xs text-[#8A97A8] font-mono">{tx(al.day)} {al.time}</span></div>
              <div className="text-sm text-[#2B3A50] mt-1.5 leading-snug">{tx(al.reason)}</div>
            </div>
            {al.handled ? <button onClick={() => markHandled(al.id)} title={t.undoHandled} className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-sm text-leaf font-semibold border border-[#BDE8CF] bg-[#E8F8EF] hover:bg-[#FDEAEA] hover:text-[#C0392B] hover:border-[#F5C9A0] transition"><Check size={16} strokeWidth={2.5} />{t.handled} · {t.undoHandled}</button> : (
              <div className="flex gap-2">
                <button onClick={() => openProfile(a.id)} className="px-3.5 py-2 border border-line rounded-[10px] bg-white hover:bg-[#E8F1FC] text-ocean text-[13px] font-semibold transition">{t.viewProfile}</button>
                <button onClick={() => markHandled(al.id)} className="px-3.5 py-2 rounded-[10px] bg-leaf hover:bg-[#1F9A52] text-white text-[13px] font-semibold transition">{t.markHandled}</button>
              </div>)}
          </Card>); })}
        {list.length === 0 && <div className="p-10 text-center text-[#8A97A8] text-[15px]">{t.noAlerts}</div>}
      </div>
    </>
  );
}
