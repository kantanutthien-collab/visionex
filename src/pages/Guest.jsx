import React, { useState } from 'react';
import { MapPin, VolumeX, Camera, Sparkles, Home, ArrowLeft, Volume2, Ban, HeartPulse } from 'lucide-react';
import { SOUNDS } from '../data/mock.js';
import Photo from '../components/Photo.jsx';
import { photoOf } from '../data/photos.js';
import { statusOf, hColor, pctOf, avg6 } from '../lib/analysis.js';
import { Card, HealthBar, EmptyState } from '../components/ui.jsx';
import CamFeed from '../components/CamFeed.jsx';

// Visitor-friendly wording. Clinical states (stressed / agitated) become a polite "needs quiet" so guests know how to behave.
const MOOD = {
  calm:     { th: 'ผ่อนคลาย',     en: 'Relaxed',         emoji: '😊', color: '#27AE60', bg: '#E8F8EF' },
  playful:  { th: 'กำลังสนุก',     en: 'Feeling playful', emoji: '😄', color: '#2E86DE', bg: '#E8F1FC' },
  stressed: { th: 'ขอพักเงียบ ๆ', en: 'Needs some quiet', emoji: '🤫', color: '#B35C0F', bg: '#FDF1E6' },
  agitated: { th: 'ขอพักเงียบ ๆ', en: 'Needs some quiet', emoji: '🤫', color: '#B35C0F', bg: '#FDF1E6' },
};
export const DOING = {
  eating:   { th: 'กำลังกินอาหาร', en: 'Having a meal',    emoji: '🍃' },
  walking:  { th: 'กำลังเดินเล่น', en: 'Out for a stroll', emoji: '🚶' },
  resting:  { th: 'กำลังพักผ่อน',  en: 'Taking a nap',     emoji: '💤' },
  pacing:   { th: 'เดินไปเดินมา',  en: 'Walking around',   emoji: '🔄' },
  playing:  { th: 'กำลังเล่น',     en: 'Playing',          emoji: '🎉' },
  drinking: { th: 'กำลังดื่มน้ำ',  en: 'Having a drink',   emoji: '💧' },
};
const FACTS = {
  giraffe:  { th: 'ลิ้นของยีราฟยาวถึง 45 ซม. และมีสีม่วงเข้มเพื่อกันแดด', en: 'A giraffe\'s tongue is about 45 cm long and dark purple to protect it from sunburn.' },
  elephant: { th: 'ช้างเอเชียกินพืชได้มากถึง 150 กก. ต่อวัน', en: 'An Asian elephant can eat up to 150 kg of plants a day.' },
  lion:     { th: 'สิงโตนอนพักได้ถึง 20 ชั่วโมงต่อวัน', en: 'Lions rest for up to 20 hours a day.' },
  monkey:   { th: 'ลิงแสมมีหางยาวกว่าลำตัว และว่ายน้ำเก่งมาก', en: 'Long-tailed macaques have tails longer than their bodies and are strong swimmers.' },
  penguin:  { th: 'เพนกวินฮัมโบลต์มาจากชายฝั่งเปรูและชิลี จุดสีชมพูบนหน้าช่วยระบายความร้อน', en: 'Humboldt penguins come from the coasts of Peru and Chile. The pink patches on their faces help them cool down.' },
  tiger:    { th: 'ลายของเสือแต่ละตัวไม่ซ้ำกัน เหมือนลายนิ้วมือของคน', en: 'Every tiger\'s stripes are unique, like a human fingerprint.' },
  zebra:    { th: 'ม้าลายแต่ละตัวมีลายไม่เหมือนกันเลย ลูกม้าลายจำแม่ได้จากลาย', en: 'No two zebras have the same stripes. Foals recognise their mother by her pattern.' },
  otter:    { th: 'นากเล็กเล็บสั้นเป็นนากที่ตัวเล็กที่สุดในโลก และใช้มือคลำหาอาหารใต้น้ำ', en: 'The small-clawed otter is the world\'s smallest otter and feels for food underwater with its paws.' },
};
const GENERIC_SOUNDS = [ { emoji: '🎵', name: { th: 'เสียงเรียก', en: 'Contact call' }, meaning: { th: 'ใช้ติดต่อกับพวกเดียวกัน', en: 'Used to keep in touch with its group' } }, { emoji: '⚠️', name: { th: 'เสียงเตือน', en: 'Alarm call' }, meaning: { th: 'เตือนภัย', en: 'Warns of danger' }, avoid: true } ];

export default function Guest({ t, L, tx, animals, cameras, camera, selectCamera, current, clock }) {
  const [view, setView] = useState(null);      // null = choose an animal, otherwise animal id
  const [playing, setPlaying] = useState(null);
  const quiet = animals.filter(a => a.emotion === 'stressed' || a.emotion === 'agitated');
  const open = a => { setView(a.id); selectCamera(a.camera); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const home = () => { setView(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const a = view && animals.find(x => x.id === view);

  const QuietNotice = () => quiet.length > 0 ? (
    <div className="flex items-center gap-4 px-5 py-4 rounded-[14px] bg-[#FDF1E6] border border-[#F5C9A0] flex-wrap">
      <div className="w-11 h-11 rounded-xl bg-[#E67E22] grid place-items-center flex-none"><VolumeX size={22} color="#fff" /></div>
      <div className="flex-1 min-w-[200px]">
        <div className="text-[17px] font-bold text-[#9A4E0C]">{t.guestQuietTitle} 🤫</div>
        <div className="text-sm text-[#9A4E0C]/85 mt-0.5">{quiet.map(x => L === 'th' ? `${tx(x.name)} (${tx(x.species)}) ${t.guestQuietSub} ${tx(x.enclosure)}` : `${tx(x.name)} the ${tx(x.species).toLowerCase()} ${t.guestQuietSub} ${tx(x.enclosure)}.`).join(' · ')}</div>
      </div>
    </div>) : (
    <div className="flex items-center gap-3 px-5 py-3.5 rounded-[14px] bg-[#E8F8EF] border border-[#BDE8CF] text-[#1F8A4C] font-semibold text-sm">😊 {t.guestAllHappy}</div>);

  // ---------------- landing: choose an animal ----------------
  if (!a) return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="rounded-[22px] bg-gradient-to-br from-navy to-[#1B4F86] text-white px-7 py-7 relative isolate overflow-hidden">
        <i className="motif-light" /><div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-ocean/30 blur-2xl" />
        <div className="relative">
          <div className="font-mono text-[11px] tracking-[.14em] text-[#9CC4E4] uppercase flex items-center gap-2"><Sparkles size={14} /> {t.guestNow} · {clock}</div>
          <div className="text-[28px] font-bold leading-tight mt-1">{t.guestChoose}</div>
          <div className="text-sm text-[#C9D6E5] mt-1.5">{t.guestChooseSub}</div>
        </div>
      </div>
      <QuietNotice />
      {animals.length === 0 && <EmptyState title={t.emptyTitle} sub={t.emptySub} />}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {animals.map(x => { const m = MOOD[x.emotion], d = DOING[current[x.id]?.behavior || 'resting']; return (
          <button key={x.id} onClick={() => open(x)} className="card overflow-hidden text-left transition hover:-translate-y-1 hover:shadow-lift !rounded-[18px] group">
            <div className="h-[170px] relative">
              <Photo a={x} className="w-full h-full" />
              <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[12px] font-semibold shadow-sm" style={{ color: m.color }}>{m.emoji} {m[L]}</span>
            </div>
            <div className="px-4 py-3.5">
              <div className="text-[18px] font-bold leading-tight">{x.emoji} {tx(x.name)}</div>
              <div className="text-[13px] text-muted">{tx(x.species)}</div>
              <div className="mt-2.5 flex items-center gap-2 text-[13px] font-semibold px-2.5 py-1.5 rounded-lg bg-ground">{d.emoji} {d[L]}</div>
            </div>
          </button>); })}
      </div>
      <div className="text-center text-xs text-muted pb-2">{t.guestFooter}</div>
    </div>
  );

  // ---------------- animal page: camera, health, sounds ----------------
  const m = MOOD[a.emotion], cur = current[a.id], d = DOING[cur?.behavior || 'resting'];
  const cam = cameras.find(c => c.id === a.camera) || cameras.find(c => c.id === camera) || cameras[0];
  const st = statusOf(a.health), hc = hColor(a.health);
  const statusWord = st === 'healthy' ? t.guestDoingWell : st === 'watch' ? t.guestWatched : t.guestExtraCare;
  const eat = pctOf(a.eating), act = pctOf(a.activity), rest = pctOf(a.resting), pa = avg6(a.pacing), paceUp = pa > 0 ? a.pacing[6] >= pa * 1.5 : a.pacing[6] > 1;
  const checks = [[eat > -8, t.guestEatOk, t.guestEatLess, '🍃'], [act > -12, t.guestActOk, t.guestActLess, '🏃'], [Math.abs(rest) < 20, t.guestRestOk, t.guestRestOff, '💤'], [!paceUp, t.guestPaceOk, t.guestPaceMore, '🔄']];
  const sounds = SOUNDS[a.id] || GENERIC_SOUNDS;
  const play = i => { setPlaying(i); setTimeout(() => setPlaying(p => p === i ? null : p), 1800); };
  const label = (x, b) => { const dd = DOING[current[x.id]?.behavior || 'resting']; return { color: '#ffffff', node: <span className="px-2.5 py-1 rounded-full bg-white/95 text-[12px] font-semibold text-navy shadow-md">{tx(x.name)} · {dd.emoji} {dd[L]}</span> }; };
  const Section = ({ icon: Icon, title, sub, children }) => (
    <Card className="!rounded-[18px] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#EEF2F7]"><div className="flex items-center gap-2 text-[17px] font-bold"><Icon size={18} className="text-ocean" />{title}</div>{sub && <div className="text-[13px] text-muted mt-0.5">{sub}</div>}</div>
      {children}
    </Card>);

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={home} className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-navy text-white text-sm font-semibold shadow"><Home size={16} />{t.guestHome}</button>
        <button onClick={home} className="flex items-center gap-1.5 px-3 py-2.5 rounded-[10px] text-ocean text-sm font-semibold hover:bg-[#E8F1FC]"><ArrowLeft size={16} />{t.guestOtherAnimals}</button>
      </div>
      <Card className="!rounded-[22px] overflow-hidden">
        <div className="grid md:grid-cols-[minmax(0,440px)_1fr]">
          <Photo a={a} alt={tx(a.species)} className="aspect-[4/3] md:aspect-auto md:min-h-[300px]" />
          <div className="p-5 md:p-6 flex flex-col gap-4">
            <div>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div><div className="font-mono text-[11px] tracking-[.12em] uppercase text-muted">{t.guestMeet}</div><div className="text-[30px] font-bold leading-tight">{a.emoji} {tx(a.name)}</div><div className="text-sm text-muted">{tx(a.species)} · {t.guestAgeYears} {a.age} {t.years}</div></div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[14px] font-semibold" style={{ background: m.bg, color: m.color }}>{m.emoji} {m[L]}</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-ground"><span className="text-[24px]">{d.emoji}</span><div><div className="text-[11px] text-muted">{t.guestNow}</div><div className="text-sm font-semibold">{d[L]}</div></div></div>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-ground"><MapPin size={20} className="text-ocean" /><div><div className="text-[11px] text-muted">{t.guestWhere}</div><div className="text-sm font-semibold">{tx(a.enclosure)}</div></div></div>
            </div>
            {FACTS[a.id] && <div className="px-3.5 py-3 rounded-xl bg-[#E8F1FC]"><div className="font-mono text-[10px] tracking-[.1em] text-ocean uppercase">{t.guestFact}</div><div className="text-[13px] text-[#2B3A50] leading-snug mt-0.5">{tx(FACTS[a.id])}</div></div>}
          </div>
        </div>
      </Card>

      <Section icon={Camera} title={`${t.guestMonitor} · ${cam ? tx(cam.name) : ''}`}>
        {cam && <CamFeed cam={cam} animals={animals} label={label}>
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 text-navy text-xs font-semibold shadow"><span className="w-2 h-2 rounded-full bg-[#E74C3C] animate-pulse2" />{t.live}</div>
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-navy/75 text-white text-[11px] font-mono tabular-nums">{clock} · {t.simFeed}</div>
        </CamFeed>}
      </Section>

      <Section icon={HeartPulse} title={t.guestHealth} sub={t.guestHealthSub}>
        <div className="p-5 grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="px-4 py-4 rounded-2xl text-center" style={{ background: hc + '14' }}>
            <div className="font-mono text-[44px] font-semibold leading-none" style={{ color: hc }}>{a.health}</div>
            <div className="text-[11px] text-muted mt-1">{t.guestScore} / 100</div>
            <div className="mt-3"><HealthBar value={a.health} color={hc} /></div>
            <div className="mt-3 text-[15px] font-bold" style={{ color: hc }}>{statusWord}</div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 content-start">
            {checks.map(([ok, okText, badText, emoji], i) => <div key={i} className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-[14px] font-semibold ${ok ? 'bg-[#E8F8EF] text-[#1F8A4C]' : 'bg-[#FDF1E6] text-[#9A4E0C]'}`}><span className="text-xl">{emoji}</span>{ok ? okText : badText}<span className="ml-auto">{ok ? '✅' : '👀'}</span></div>)}
          </div>
        </div>
      </Section>

      <Section icon={Volume2} title={t.guestSounds} sub={t.guestSoundsSub}>
        <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sounds.map((s, i) => (
            <div key={i} className={`rounded-2xl border p-4 flex flex-col gap-2 ${s.avoid ? 'border-[#F5C9A0] bg-[#FFFBF7]' : 'border-[#BDE8CF] bg-[#F7FDF9]'}`}>
              <div className="flex items-center gap-3"><span className="w-11 h-11 rounded-xl bg-white grid place-items-center text-2xl shadow-sm">{s.emoji}</span><div className="flex-1 min-w-0"><div className="text-[16px] font-bold">{tx(s.name)}</div><div className="text-[12px] text-muted">{tx(s.meaning)}</div></div></div>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className={`flex items-center gap-1 text-[11px] font-bold ${s.avoid ? 'text-[#B35C0F]' : 'text-[#1F8A4C]'}`}>{s.avoid ? <Ban size={12} /> : <Volume2 size={12} />}{s.avoid ? t.guestAvoid : t.guestSafe}</span>
                <button onClick={() => play(i)} disabled={s.avoid} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[13px] font-semibold transition ${s.avoid ? 'bg-[#EEF2F7] text-[#B9C4D3] cursor-not-allowed' : playing === i ? 'bg-leaf text-white' : 'bg-navy text-white hover:bg-[#163B66]'}`}><Volume2 size={14} />{playing === i ? t.guestSoundSoon : t.guestPlay}</button>
              </div>
              {s.avoid && <div className="text-[11px] text-[#9A4E0C]">{t.guestAvoidWhy}</div>}
            </div>))}
        </div>
      </Section>
      <div className="flex justify-center"><button onClick={home} className="flex items-center gap-2 px-5 py-3 rounded-[12px] bg-ocean text-white text-sm font-semibold shadow"><Home size={16} />{t.guestHome}</button></div>
      <div className="text-center text-xs text-muted pb-2">{t.guestFooter}</div>
    </div>
  );
}
