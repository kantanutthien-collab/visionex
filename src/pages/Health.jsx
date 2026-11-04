import React, { useState } from 'react';
import { hColor, statusOf, STATUS_STYLE, SEV_STYLE, trend, stressTrend, earlyWarnings } from '../lib/analysis.js';
import { Card, HealthBar } from '../components/ui.jsx';

export default function Health({ t, L, tx, animals, openProfile, narrow }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('health');
  const [search, setSearch] = useState('');
  let rows = animals.map(a => ({ ...a, nm: tx(a.name), sp: tx(a.species), status: statusOf(a.health), appetite: trend(a.eating, true), activity: trend(a.activity, true), stress: stressTrend(a) }));
  if (filter !== 'all') rows = rows.filter(r => r.status === filter);
  if (search.trim()) { const q = search.trim().toLowerCase(); rows = rows.filter(r => r.nm.toLowerCase().includes(q) || r.sp.toLowerCase().includes(q) || r.name.en.toLowerCase().includes(q)); }
  rows.sort((a, b) => sort === 'health' ? a.health - b.health : sort === 'name' ? a.nm.localeCompare(b.nm, L) : sort === 'appetite' ? a.appetite.pct - b.appetite.pct : b.stress.pct - a.stress.pct);
  const warnings = earlyWarnings(animals, L);
  const Tr = ({ v }) => <span className="font-semibold" style={{ color: v.color }}>{v.arrow} {v.text}</span>;
  return (
    <div className={`grid gap-6 items-start ${narrow ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_340px]'}`}>
      <Card className="!rounded-[18px] p-5 min-w-0">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="seg">{['all', 'healthy', 'watch', 'attention'].map(f => <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{t[f]}</button>)}</div>
        </div>
        <div className="overflow-x-auto mt-4"><div className="min-w-[640px]">
          <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr_1.3fr] gap-3 px-3.5 py-2.5 text-xs font-semibold text-[#8A97A8] uppercase tracking-wide"><span>{t.animal}</span><span>{t.healthScore}</span><span>{t.appetite}</span><span>{t.activity}</span><span>{t.stress}</span><span>{t.status}</span></div>
          {rows.map(r => { const hc = hColor(r.health), ss = STATUS_STYLE[r.status]; return (
            <div key={r.id} onClick={() => openProfile(r.id)} className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr_1.3fr] gap-3 items-center px-3.5 py-3 border-t border-[#EEF2F7] cursor-pointer rounded-[10px] hover:bg-ground text-sm transition">
              <div className="flex items-center gap-2.5"><span className="w-[38px] h-[38px] rounded-[10px] grid place-items-center text-[22px]" style={{ background: r.tint }}>{r.emoji}</span><div><div className="font-semibold">{r.nm}</div><div className="text-xs text-muted">{r.sp}</div></div></div>
              <div className="flex items-center gap-2"><span className="font-mono font-semibold text-[15px]" style={{ color: hc }}>{r.health}</span><span className="flex-1 max-w-[60px]"><HealthBar value={r.health} color={hc} h="h-1.5" /></span></div>
              <Tr v={r.appetite} /><Tr v={r.activity} /><Tr v={r.stress} />
              <span><span className="inline-block px-3 py-1 rounded-full text-[13px] font-semibold" style={{ background: ss.bg, color: ss.color }}>{t[r.status]}</span></span>
            </div>); })}
          {rows.length === 0 && <div className="p-8 text-center text-[#8A97A8] text-sm">{t.noResults}</div>}
        </div></div>
      </Card>
      <Card className="!rounded-[18px] p-5">
        <div className="text-[17px] font-bold">{t.earlyWarn}</div><div className="text-[13px] text-muted mt-1">{t.earlyWarnSub}</div>
        <div className="flex flex-col gap-2.5 mt-4">
          {warnings.map((w, i) => (
            <div key={i} onClick={() => openProfile(w.a.id)} className="flex gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition hover:translate-x-[3px]" style={{ background: SEV_STYLE[w.sev].bg }}>
              <span className="text-2xl">{w.a.emoji}</span>
              <div><div className="text-sm font-semibold">{tx(w.a.name)} · {tx(w.a.species)}</div><div className="text-[13px] text-[#2B3A50] mt-0.5 leading-snug">{w.text}</div></div>
            </div>))}
          {warnings.length === 0 && <div className="p-5 text-center text-leaf text-sm font-semibold">{t.allNormal}</div>}
        </div>
      </Card>
    </div>
  );
}
