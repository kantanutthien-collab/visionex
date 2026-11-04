import React from 'react';
import { EMOTIONS } from '../data/mock.js';

export const Card = ({ className = '', children, ...p }) => <div className={`card ${className}`} {...p}>{children}</div>;

export const Corners = ({ color = 'border-ocean', size = 'w-3 h-3', inset = 'left-2.5 top-2.5', op = 'opacity-50' }) => (
  <>
    <i className={`absolute ${size} ${op} ${color} border-l-2 border-t-2 left-2.5 top-2.5`} />
    <i className={`absolute ${size} ${op} ${color} border-r-2 border-t-2 right-2.5 top-2.5`} />
    <i className={`absolute ${size} ${op} ${color} border-l-2 border-b-2 left-2.5 bottom-2.5`} />
    <i className={`absolute ${size} ${op} ${color} border-r-2 border-b-2 right-2.5 bottom-2.5`} />
  </>
);

export const Pill = ({ bg, color, children, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`} style={{ background: bg, color }}>{children}</span>
);

export const EmotionPill = ({ emotion, L, size = 'text-xs' }) => {
  const e = EMOTIONS[emotion];
  return <Pill bg={e.bg} color={e.color} className={size}>{e.emoji} {e[L]}</Pill>;
};

export const Seg = ({ options, value, onChange }) => (
  <div className="seg">
    {options.map(o => <button key={o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>{o.label}</button>)}
  </div>
);

export const HealthBar = ({ value, color, h = 'h-2' }) => (
  <div className={`${h} rounded bg-[#EEF2F7] overflow-hidden`}><div className="h-full rounded transition-all duration-500" style={{ width: value + '%', background: color }} /></div>
);

export const SectionTitle = ({ children, right }) => (
  <div className="flex items-center justify-between gap-2 flex-wrap"><div className="text-[17px] font-bold">{children}</div>{right}</div>
);

export const EmptyState = ({ emoji = '🐾', title, sub, action, onAction, action2, onAction2 }) => (
  <Card className="!rounded-[18px] p-8 text-center flex flex-col items-center gap-2">
    <div className="text-5xl">{emoji}</div>
    <div className="text-[18px] font-bold mt-1">{title}</div>
    {sub && <div className="text-sm text-muted max-w-[420px]">{sub}</div>}
    <div className="flex gap-2 mt-3 flex-wrap justify-center">
      {action && <button onClick={onAction} className="px-5 py-2.5 rounded-[10px] bg-ocean text-white text-sm font-semibold">{action}</button>}
      {action2 && <button onClick={onAction2} className="px-5 py-2.5 rounded-[10px] bg-[#E8F1FC] text-ocean text-sm font-semibold">{action2}</button>}
    </div>
  </Card>
);
