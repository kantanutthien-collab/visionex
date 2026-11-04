import React from 'react';
import { VISITORS } from '../data/mock.js';
import { Card } from '../components/ui.jsx';

const ROLE_STYLE = { keeper: { bg: '#E8F8EF', color: '#1F8A4C' }, vet: { bg: '#E8F1FC', color: '#2E86DE' }, cleaner: { bg: '#EEF2F7', color: '#4A5A70' }, guide: { bg: '#FDF1E6', color: '#B35C0F' }, student: { bg: '#FDF1E6', color: '#B35C0F' }, tech: { bg: '#EEF2F7', color: '#4A5A70' } };

export default function Visitors({ t, tx }) {
  return (
    <Card className="!rounded-[18px] p-5">
      <div className="flex justify-between items-baseline flex-wrap gap-2"><div className="text-[17px] font-bold">{t.visitorsTitle}</div><div className="text-[13px] text-muted">{t.visitorsSub}</div></div>
      <div className="overflow-x-auto mt-3.5"><div className="min-w-[720px]">
        <div className="grid grid-cols-[.7fr_.7fr_1.6fr_1.1fr_1.2fr_2fr] gap-3 px-3.5 py-2.5 text-xs font-semibold text-[#8A97A8] uppercase tracking-wide"><span>{t.timeIn}</span><span>{t.timeOut}</span><span>{t.name}</span><span>{t.role}</span><span>{t.area}</span><span>{t.purpose}</span></div>
        {VISITORS.map((v, i) => { const rs = ROLE_STYLE[v.role]; return (
          <div key={i} className="grid grid-cols-[.7fr_.7fr_1.6fr_1.1fr_1.2fr_2fr] gap-3 items-center px-3.5 py-[13px] border-t border-[#EEF2F7] text-sm rounded-[10px] hover:bg-ground">
            <span className="font-mono font-semibold text-[13px]">{v.tin}</span>
            <span className={`font-mono font-semibold text-[13px] ${v.tout ? '' : 'text-leaf'}`}>{v.tout || t.inside}</span>
            <span>{tx(v.name)}</span>
            <span><span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: rs.bg, color: rs.color }}>{t[v.role]}</span></span>
            <span className="text-[#4A5A70]">{tx(v.area)}</span>
            <span className="text-[#4A5A70]">{tx(v.purpose)}</span>
          </div>); })}
      </div></div>
    </Card>
  );
}
