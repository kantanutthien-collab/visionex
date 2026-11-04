import React from 'react';
import { camSrc, camAspect } from '../data/photos.js';

const FEED = 16 / 9;
// The photo is letter-boxed inside the 16:9 feed; this returns the photo's rectangle in feed percent.
export function fitRect(aspect) {
  if (aspect >= FEED) { const h = FEED / aspect * 100; return { left: 0, top: (100 - h) / 2, width: 100, height: h }; }
  const w = aspect / FEED * 100; return { left: (100 - w) / 2, top: 0, width: w, height: 100 };
}

// cam: entry from CAMERAS. label(animal, box) -> { color, node }. children render on top (overlays, scan HUD).
export default function CamFeed({ cam, animals, label, children, className = '' }) {
  const r = fitRect(camAspect(cam)), src = camSrc(cam);
  return (
    <div className={`relative aspect-video overflow-hidden bg-[#0B1A2E] ${className}`}>
      {cam.stream ? <>
        <div className="absolute inset-0 bg-[#0B1A2E]" />
        <img src={cam.stream} alt={cam.name.en} className="absolute inset-0 w-full h-full object-contain" />
      </> : <>
        <img src={src} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50" />
        <img src={src} alt={cam.name.en} className="absolute inset-0 w-full h-full object-contain" />
      </>}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,.07)_0_1px,transparent_1px_3px)]" />
      {cam.boxes.map(b => {
        const a = animals.find(x => x.id === b.animalId); if (!a) return null; const { color, node } = label(a, b);
        const st = { left: `${r.left + b.x * r.width / 100}%`, top: `${r.top + b.y * r.height / 100}%`, width: `${b.w * r.width / 100}%`, height: `${b.h * r.height / 100}%` };
        return (
          <div key={b.tag} className="absolute rounded-[4px] border-2 transition-all duration-300" style={{ ...st, borderColor: color, boxShadow: `0 0 0 1px rgba(255,255,255,.35), 0 0 16px ${color}99` }}>
            {['-left-0.5 -top-0.5 border-l-[3px] border-t-[3px]', '-right-0.5 -top-0.5 border-r-[3px] border-t-[3px]', '-left-0.5 -bottom-0.5 border-l-[3px] border-b-[3px]', '-right-0.5 -bottom-0.5 border-r-[3px] border-b-[3px]'].map(c => <i key={c} className={`absolute w-3 h-3 ${c}`} style={{ borderColor: color }} />)}
            <div className="absolute left-0 whitespace-nowrap" style={{ top: r.top + b.y * r.height / 100 < 9 ? 6 : -30 }}>{node}</div>
          </div>);
      })}
      {children}
    </div>
  );
}

// Thumbnail strip for choosing a camera. status(cam) -> color of the dot (e.g. emotion of the animal on it).
export function CamPicker({ cams, value, onChange, tx, status }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2.5">
      {cams.map(c => (
        <button key={c.id} onClick={() => onChange(c.id)} className={`relative rounded-xl overflow-hidden text-left transition border-2 ${value === c.id ? 'border-ocean shadow-lift' : 'border-transparent hover:border-[#B9D6EE]'} ${status && ['#E67E22', '#E74C3C'].includes(status(c)) ? 'ring-2 ring-[#E74C3C] ring-offset-1' : ''}`}>
          <img src={camSrc(c)} alt="" className="w-full h-[72px] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
          <div className="absolute left-2 bottom-1.5 right-2 text-white"><div className="font-mono text-[9px] tracking-[.12em] opacity-80">{c.live ? <span className="text-[#FF8A80] font-bold">● LIVE · PI</span> : `CAM ${c.id}`}</div><div className="text-[12px] font-semibold leading-tight truncate">{tx(c.name)}</div></div>
          {status && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white/80" style={{ background: status(c) }} />}
        </button>))}
    </div>
  );
}
