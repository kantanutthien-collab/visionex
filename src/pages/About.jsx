import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card } from '../components/ui.jsx';
import Photo from '../components/Photo.jsx';
import { photoOf, CREDITS } from '../data/photos.js';
import { ANIMALS } from '../data/mock.js';
import logo from '../assets/logo.png';

export default function About({ t, tx }) {
  const steps = [
    { n: '01', emoji: '📷', title: t.stepCamera, sub: t.stepCameraSub, bg: '#E8F1FC', border: '#CFE0F5' },
    { n: '02', emoji: '🧠', title: 'Raspberry Pi 5', sub: t.stepPiSub, bg: '#E8F8EF', border: '#C6EBD5' },
    { n: '03', emoji: '📡', title: t.stepEsp, sub: t.stepEspSub, bg: '#FDF1E6', border: '#F5DEC4' },
    { n: '04', emoji: '📊', title: t.stepDash, sub: t.stepDashSub, bg: '#EEF2F7', border: '#DDE4EE' },
  ];
  const who = [['🧑‍🌾', t.bKeeper, t.bKeeperSub], ['🩺', t.bVet, t.bVetSub], ['🌿', t.bSanct, t.bSanctSub], ['🏫', t.bSchool, t.bSchoolSub]];
  return (
    <>
      <div className="flex justify-center"><img src={logo} alt="VisionEx" className="h-40 w-auto" /></div>
      <Card className="!rounded-[18px] p-7">
        <div className="text-xl font-bold">{t.howItWorks}</div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2.5 mt-[22px] items-stretch">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2.5 min-w-0">
              <div className="flex-1 px-4 py-5 rounded-2xl min-h-[150px] flex flex-col gap-2 border" style={{ background: s.bg, borderColor: s.border }}>
                <div className="flex justify-between items-center"><div className="w-[42px] h-[42px] rounded-xl bg-white grid place-items-center text-[22px] shadow-sm">{s.emoji}</div><span className="font-mono text-[11px] tracking-[.12em] text-[#8A97A8]">{s.n}</span></div>
                <div className="text-base font-bold mt-1">{s.title}</div>
                <div className="text-[13px] text-[#4A5A70] leading-snug">{s.sub}</div>
              </div>
              {i < steps.length - 1 && <ArrowRight size={22} className="text-[#8FA6C2] flex-none" />}
            </div>))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6 mt-7">
          <div><div className="text-base font-bold">{t.whatDetects}</div><p className="mt-2 text-[15px] text-[#2B3A50] leading-relaxed">{t.aboutP1}</p></div>
          <div><div className="text-base font-bold">{t.notMindReading}</div><p className="mt-2 text-[15px] text-[#2B3A50] leading-relaxed">{t.aboutP2}</p></div>
        </div>
        <div className="text-base font-bold mt-7">{t.whoBenefits}</div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5 mt-3">
          {who.map(([e, title, sub]) => <div key={title} className="p-4 rounded-[14px] bg-ground"><div className="text-2xl">{e}</div><div className="text-[15px] font-bold mt-2">{title}</div><div className="text-[13px] text-[#4A5A70] mt-1 leading-snug">{sub}</div></div>)}
        </div>
      </Card>
      <Card className="!rounded-[18px] p-7">
        <div className="text-base font-bold">{t.photoCredits}</div><div className="text-[13px] text-muted mt-1">{t.photoCreditsSub}</div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 mt-4">
          {ANIMALS.filter(a => CREDITS[a.id]).map(a => { const c = CREDITS[a.id]; return (
            <a key={a.id} href={c.page} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl bg-ground hover:bg-[#E8F1FC] transition">
              <Photo a={a} className="w-14 h-14 rounded-lg flex-none" />
              <div className="min-w-0 text-xs"><div className="font-semibold text-sm truncate">{tx(a.species)}</div><div className="text-muted truncate">{c.artist}</div><div className="font-mono text-[10px] text-ocean">{c.license} · Wikimedia Commons</div></div>
            </a>); })}
        </div>
      </Card>
      <div className="text-center py-2.5 text-sm text-muted">{t.credit}</div>
    </>
  );
}
