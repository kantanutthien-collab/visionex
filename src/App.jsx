import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutGrid, Video, ScanLine, PawPrint, Activity, Bell, Users, Info, Zap, X, FileText, Thermometer, Sparkles, ClipboardCheck, TrendingUp, Settings, Shield, Smile, HeartPulse } from 'lucide-react';
import { ANIMALS, ALERTS, CAMERAS, BEHAVIOR_SEED, SIM_EVENTS, DEX, ENRICHMENT, HOURLY, OBSERVATIONS } from './data/mock.js';
import { T, tx, GUEST, ADMIN } from './i18n.js';
import { hms, matchDex, SEV_STYLE, seeded } from './lib/analysis.js';
import { loadTasks, saveTasks, buildTasks } from './lib/tasks.js';
import { PAGE_COLOR } from './lib/colors.js';
import { useLive, piCamera, PI_CAM_ID, cropFromPi, animalFromDetection } from './lib/live.js';
import Overview from './pages/Overview.jsx';
import LiveMonitor from './pages/LiveMonitor.jsx';
import LiveDex from './pages/LiveDex.jsx';
import Profile from './pages/Profile.jsx';
import Health from './pages/Health.jsx';
import Alerts from './pages/Alerts.jsx';
import Visitors from './pages/Visitors.jsx';
import About from './pages/About.jsx';
import Guest from './pages/Guest.jsx';
import Reports from './pages/Reports.jsx';
import Habitat from './pages/Habitat.jsx';
import Enrichment from './pages/Enrichment.jsx';
import Tasks from './pages/Tasks.jsx';
import History from './pages/History.jsx';
import Manage from './pages/Manage.jsx';
import logo from './assets/logo.png';
import logoMark from './assets/logo-mark.png';
import logoWide from './assets/logo-wide.png';

const LS = { animals: 'visionex-animals', cameras: 'visionex-cameras', mode: 'visionex-mode', lang: 'visionex-lang', pi: 'visionex-pi' };
const EMPTY_OV = { edits: {}, added: [], removed: [] };
const loadJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const applyOv = (base, ov) => [...base.filter(x => !ov.removed.includes(x.id)).map(x => ov.edits[x.id] ? { ...x, ...ov.edits[x.id] } : { ...x }), ...ov.added.map(x => ({ ...x }))];
const seedLog = cam => (BEHAVIOR_SEED[cam] || []).map(([time, animalId, behavior]) => ({ time, animalId, behavior }));
const seedCurrent = () => { const m = {}; Object.values(BEHAVIOR_SEED).forEach(list => list.forEach(([time, id, behavior]) => { if (!m[id]) m[id] = { behavior, time }; })); return m; };
// Animals added by the user need entries in the per-animal lookup tables used by Dex, Enrichment and History.
function ensureDefaults(a) {
  if (!DEX[a.id]) { const r = seeded(a.id.length * 7919); DEX[a.id] = { code: a.code, pattern: a.species, size: { th: '—', en: '—' }, coat: { th: '—', en: '—' }, mark: { th: 'ยังไม่ได้บันทึก', en: 'Not recorded yet' }, signature: Array.from({ length: 8 }, () => +(0.2 + r() * 0.7).toFixed(2)), accuracy: 88, sightings: 0 }; }
  if (!ENRICHMENT[a.id]) ENRICHMENT[a.id] = [{ th: 'ซ่อนอาหารให้ค้นหา', en: 'Hidden food to forage' }, { th: 'ของเล่นหรือวัตถุใหม่ในคอก', en: 'Novel object in the enclosure' }, { th: 'สลับตำแหน่งที่พักผ่อน', en: 'Rotate resting spots' }];
  if (!HOURLY[a.id]) HOURLY[a.id] = [55, 68, 74, 70, 60, 52, 48, 54, 64, 72, 72, 62, 52];
  if (!OBSERVATIONS[a.id]) OBSERVATIONS[a.id] = [];
}

export default function App() {
  const [lang, setLang] = useState(() => loadJSON(LS.lang, 'th'));
  const [mode, setMode] = useState(() => loadJSON(LS.mode, 'admin'));
  const [page, setPage] = useState('overview');
  const [animalOv, setAnimalOv] = useState(() => loadJSON(LS.animals, EMPTY_OV));
  const [cameraOv, setCameraOv] = useState(() => loadJSON(LS.cameras, EMPTY_OV));
  // The app starts EMPTY: the sample zoo (ANIMALS / CAMERAS from mock.js) is only loaded on request via loadDemo()
  // First visit (nothing saved yet): start with 3 example animals + their cameras so the app is not empty.
  // "Remove all" clears them and remembers that choice.
  const STARTER = ['giraffe', 'elephant', 'lion'];
  const firstVisit = !localStorage.getItem(LS.animals);
  const starterOv = () => ({ edits: {}, added: ANIMALS.filter(a => STARTER.includes(a.id)).map(a => ({ ...a })), removed: [] });
  const starterCamOv = () => ({ edits: {}, added: CAMERAS.filter(c => ANIMALS.filter(a => STARTER.includes(a.id)).some(a => a.camera === c.id)).map(c => ({ ...c })), removed: [] });
  if (firstVisit) { localStorage.setItem(LS.animals, JSON.stringify(starterOv())); localStorage.setItem(LS.cameras, JSON.stringify(starterCamOv())); }
  const [animals, setAnimals] = useState(() => { const list = applyOv([], loadJSON(LS.animals, EMPTY_OV)); list.forEach(ensureDefaults); return list; });
  const [cameras, setCameras] = useState(() => applyOv([], loadJSON(LS.cameras, EMPTY_OV)));
  const [selected, setSelected] = useState(() => applyOv([], loadJSON(LS.animals, EMPTY_OV))[0]?.id || null);
  const [alerts, setAlerts] = useState([]);
  const [camera, setCamera] = useState(() => applyOv([], loadJSON(LS.cameras, EMPTY_OV))[0]?.id || 1);
  const [log, setLog] = useState([]);
  const [current, setCurrent] = useState(seedCurrent);
  const [toast, setToast] = useState(null);
  const [scan, setScan] = useState(null);
  const [sightings, setSightings] = useState({});
  const [lastSeen, setLastSeen] = useState({});
  const [taskState, setTaskState] = useState(loadTasks);
  const [now, setNow] = useState(new Date());
  const [narrow, setNarrow] = useState(window.innerWidth < 1024);
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [piUrl, setPiUrlState] = useState(() => loadJSON(LS.pi, ''));
  const setPiUrl = u => { setPiUrlState(u); localStorage.setItem(LS.pi, JSON.stringify(u)); };
  const live = useLive(piUrl);
  const liveOn = live.status === 'online';
  const piCam = liveOn ? piCamera(live) : null;
  const allCameras = piCam ? [piCam, ...cameras] : cameras;
  const liveCamSelected = liveOn && camera === PI_CAM_ID;
  const simIdx = useRef(0), toastT = useRef(), scanT = useRef(), lastAuto = useRef({});
  const L = lang, t = useMemo(() => ({ ...T[lang], ...GUEST[lang], ...ADMIN[lang] }), [lang]);
  const txL = o => tx(o, L);

  useEffect(() => { localStorage.setItem(LS.lang, JSON.stringify(lang)); }, [lang]);
  useEffect(() => { localStorage.setItem(LS.mode, JSON.stringify(mode)); }, [mode]);
  useEffect(() => {
    const r = () => { setNarrow(window.innerWidth < 1024); setMobile(window.innerWidth < 768); }; window.addEventListener('resize', r);
    const c = setInterval(() => setNow(new Date()), 1000);
    return () => { window.removeEventListener('resize', r); clearInterval(c); };
  }, []);

  const wasLive = useRef(false);
  useEffect(() => { if (liveOn && !wasLive.current) { setCamera(PI_CAM_ID); setLog([]); } wasLive.current = liveOn; if (!liveOn && camera === PI_CAM_ID) setCamera(cameras[0]?.id || 1); }, [liveOn]);
  useEffect(() => {
    if (!liveOn || !live.state) return;
    const st = live.state;
    if (camera === PI_CAM_ID) setLog(st.events.filter(e => animals.some(a => a.id === e.animalId)).slice(0, 10));
    setCurrent(c => { const n = { ...c }; Object.entries(st.behaviors).forEach(([id, b]) => { n[id] = { behavior: b.behavior, time: st.time }; }); return n; });
    // instant state per animal from what the camera sees now: pacing → stressed, playing → playful, otherwise calm
    const stateOf = b => b === 'pacing' ? 'stressed' : b === 'playing' ? 'playful' : 'calm';
    setAnimals(as => { let changed = false; const n = as.map(a => { const b = st.behaviors[a.id]; if (!b) return a; const e = stateOf(b.behavior); if (a.emotion === e && a.minutesAgo === 0) return a; changed = true; return { ...a, emotion: e, minutesAgo: 0 }; }); return changed ? n : as; });
  }, [live.state]);
  // Auto-insert: the first time the Pi sees an animal that is not in the list yet, add it (photo = crop of the camera frame)
  const pendingAdd = useRef(new Set());
  useEffect(() => {
    if (!liveOn || !live.state) return;
    const st = live.state;
    const seen = new Set();
    st.detections.forEach(det => {
      const id = det.animalId; if (!id || seen.has(id) || pendingAdd.current.has(id) || animals.some(a => a.id === id)) return;
      seen.add(id); pendingAdd.current.add(id);
      (async () => {
        const a = animalFromDetection(det, animals.length + pendingAdd.current.size - 1);
        const crop = await cropFromPi(live.base, det, st.frame);
        if (crop) { a.photo = crop.dataUrl; a.aspect = crop.aspect; }
        saveAnimal(a);
        const alert = { id: 'new' + Date.now(), severity: 'info', animalId: a.id, reason: { th: `กล้องพบสัตว์ใหม่ "${a.name.th}" และเพิ่มให้อัตโนมัติ เปลี่ยนชื่อได้ที่หน้า เพิ่ม/แก้ไขสัตว์`, en: `Camera detected a new animal "${a.name.en}" and added it automatically. Rename it on Add / Edit Animals` }, time: hms().slice(0, 5), day: { th: 'วันนี้', en: 'Today' }, handled: false };
        setAlerts(al => [alert, ...al]); showToast(alert);
        if (!selected) setSelected(a.id);
        pendingAdd.current.delete(id);
      })();
    });
  }, [live.state, liveOn]);
  useEffect(() => {
    if (!liveOn || !live.animals) return;
    setAnimals(as => as.map(a => { const la = live.animals[a.id]; if (!la) return a; const anyData = la.activity.some(v => v > 0) || la.resting.some(v => v > 0); return anyData ? { ...a, eating: la.eating, activity: la.activity, resting: la.resting, pacing: la.pacing, emotion: la.emotion, minutesAgo: 0, liveData: true } : a; }));
  }, [live.animals, liveOn]);

  const showToast = alert => { setToast(alert); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(null), 6000); };

  // live behavior log ticker + abnormal-behavior detector (3 consecutive pacing observations → alert)
  useEffect(() => {
    const id = setInterval(() => {
      if (liveCamSelected) return;
      const cam = cameras.find(c => c.id === camera); if (!cam || !cam.boxes.length) return;
      const ids = [...new Set(cam.boxes.map(b => b.animalId))].filter(x => animals.some(a => a.id === x)); if (!ids.length) return;
      const aid = ids[Math.floor(Math.random() * ids.length)];
      const a = animals.find(x => x.id === aid);
      const pool = a.emotion === 'stressed' || a.emotion === 'agitated' ? ['pacing', 'pacing', 'pacing', 'walking', 'resting'] : ['eating', 'walking', 'resting', 'playing', 'drinking'];
      const behavior = pool[Math.floor(Math.random() * pool.length)], time = hms();
      setLog(l => {
        const next = [{ time, animalId: aid, behavior }, ...l].slice(0, 10);
        const mine = next.filter(e => e.animalId === aid).slice(0, 3);
        if (mine.length === 3 && mine.every(e => e.behavior === 'pacing') && Date.now() - (lastAuto.current[aid] || 0) > 120000) {
          lastAuto.current[aid] = Date.now();
          const alert = { id: 'auto' + Date.now(), severity: 'warning', animalId: aid, reason: { th: ADMIN.th.autoPacing, en: ADMIN.en.autoPacing }, time: time.slice(0, 5), day: { th: 'วันนี้', en: 'Today' }, handled: false, auto: true };
          setTimeout(() => { setAlerts(al => [alert, ...al]); showToast(alert); }, 0);
        }
        return next;
      });
      setCurrent(c => ({ ...c, [aid]: { behavior, time } }));
    }, 4000);
    return () => clearInterval(id);
  }, [camera, animals, cameras, liveCamSelected]);

  const go = p => { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); };
  const openProfile = id => { if (!id) return go('manage'); setSelected(id); go('profile'); };
  const selectCamera = id => { setCamera(id); setLog(id === PI_CAM_ID ? (live.state?.events || []).slice(0, 10) : seedLog(id)); };

  const simulate = () => {
    if (!animals.length) return;
    let ev = SIM_EVENTS[simIdx.current++ % SIM_EVENTS.length];
    if (!animals.some(a => a.id === ev.animalId)) ev = { ...ev, animalId: animals[simIdx.current % animals.length].id };
    const d = new Date();
    const alert = { id: 'sim' + Date.now(), severity: ev.severity, animalId: ev.animalId, reason: ev.reason, time: hms(d).slice(0, 5), day: { th: 'วันนี้', en: 'Today' }, handled: false };
    setAlerts(a => [alert, ...a]);
    if (ev.emotion) setAnimals(as => as.map(a => a.id === ev.animalId ? { ...a, emotion: ev.emotion, minutesAgo: 0 } : a));
    setLog(l => [{ time: hms(d), animalId: ev.animalId, behavior: ev.behavior }, ...l].slice(0, 10));
    setCurrent(c => ({ ...c, [ev.animalId]: { behavior: ev.behavior, time: hms(d) } }));
    showToast(alert);
  };
  const markHandled = id => setAlerts(a => a.map(x => x.id === id ? { ...x, handled: !x.handled } : x));

  const startScan = camId => {
    if (scan && scan.phase === 'scanning') return;
    if (!allCameras.length) return;
    const cam = camId || camera;
    if (camId && camId !== camera) selectCamera(camId);
    go('live');
    let pct = 0; setScan({ phase: 'scanning', pct, cam });
    clearInterval(scanT.current);
    scanT.current = setInterval(() => {
      pct = Math.min(100, pct + 4 + Math.round(Math.random() * 5));
      if (pct >= 100) {
        clearInterval(scanT.current);
        const camD = (cam === PI_CAM_ID && piCam) ? piCam : cameras.find(c => c.id === cam), time = hms();
        const results = matchDex((camD?.boxes || []).filter(b => DEX[b.animalId]));
        setSightings(s => { const n = { ...s }; results.forEach(r => n[r.animalId] = (n[r.animalId] || 0) + 1); return n; });
        setLastSeen(s => { const n = { ...s }; results.forEach(r => n[r.animalId] = { cam, time: time.slice(0, 5) }); return n; });
        setScan({ phase: 'done', cam, time, results, ms: 120 + Math.round(Math.random() * 60) });
      } else setScan({ phase: 'scanning', pct, cam });
    }, 90);
  };

  // ---- tasks ----
  const updateTasks = s => { setTaskState(s); saveTasks(s); };
  const toggleTask = id => updateTasks({ ...taskState, done: { ...taskState.done, [id]: !taskState.done[id] } });
  const addTask = task => updateTasks({ ...taskState, extra: [...taskState.extra, task] });
  const tasks = useMemo(() => buildTasks({ alerts, taskState, now, L, animals }), [alerts, taskState, now.getMinutes(), L, animals]);

  // ---- manage animals & cameras (persisted as overrides on top of the built-in data) ----
  const persistAnimals = ov => { setAnimalOv(ov); localStorage.setItem(LS.animals, JSON.stringify(ov)); };
  const persistCameras = ov => { setCameraOv(ov); localStorage.setItem(LS.cameras, JSON.stringify(ov)); };
  const saveAnimal = a => {
    ensureDefaults(a);
    const exists = animals.some(x => x.id === a.id);
    setAnimals(as => exists ? as.map(x => x.id === a.id ? { ...x, ...a } : x) : [...as, a]);
    // everything lives in "added" (the built-in list is empty; the demo zoo is loaded into "added" too)
    setAnimalOv(ov => { const inAdded = ov.added.some(x => x.id === a.id); const n = { ...ov, added: inAdded ? ov.added.map(x => x.id === a.id ? { ...x, ...a } : x) : [...ov.added, a] }; localStorage.setItem(LS.animals, JSON.stringify(n)); return n; });
  };
  const deleteAnimal = id => {
    setAnimals(as => as.filter(x => x.id !== id));
    setCameras(cs => cs.map(c => ({ ...c, boxes: c.boxes.filter(b => b.animalId !== id) })));
    setAlerts(al => al.filter(x => x.animalId !== id));
    setAnimalOv(ov => { const n = { ...ov, added: ov.added.filter(x => x.id !== id) }; localStorage.setItem(LS.animals, JSON.stringify(n)); return n; });
    if (selected === id) setSelected(animals.find(x => x.id !== id)?.id || null);
  };
  const saveCamera = c => {
    const exists = cameras.some(x => x.id === c.id);
    setCameras(cs => exists ? cs.map(x => x.id === c.id ? { ...x, ...c } : x) : [...cs, c]);
    setCameraOv(ov => { const inAdded = ov.added.some(x => x.id === c.id); const n = { ...ov, added: inAdded ? ov.added.map(x => x.id === c.id ? { ...x, ...c } : x) : [...ov.added, c] }; localStorage.setItem(LS.cameras, JSON.stringify(n)); return n; });
  };
  const deleteCamera = id => {
    const rest = cameras.filter(x => x.id !== id); setCameras(rest);
    if (camera === id && rest[0]) selectCamera(rest[0].id);
    setCameraOv(ov => { const n = { ...ov, added: ov.added.filter(x => x.id !== id) }; localStorage.setItem(LS.cameras, JSON.stringify(n)); return n; });
  };
  const resetData = () => { localStorage.removeItem(LS.animals); localStorage.removeItem(LS.cameras); window.location.reload(); };
  const loadDemo = () => {
    persistAnimals({ edits: {}, added: ANIMALS.map(a => ({ ...a })), removed: [] });
    persistCameras({ edits: {}, added: CAMERAS.map(c => ({ ...c })), removed: [] });
    const list = ANIMALS.map(a => ({ ...a })); list.forEach(ensureDefaults); setAnimals(list); setCameras(CAMERAS.map(c => ({ ...c })));
    setAlerts(ALERTS.map(a => ({ ...a }))); setSelected('lion'); selectCamera(1); go('overview');
  };
  // One sample animal (a different one each time) with its camera, so the app can be explored without the Pi
  const addExample = () => {
    const pick = ANIMALS.find(a => !animals.some(x => x.id === a.id)); if (!pick) return;
    const a = { ...pick }; ensureDefaults(a); saveAnimal(a);
    const cam = CAMERAS.find(c => c.id === pick.camera);
    if (cam && !cameras.some(c => c.id === cam.id)) { saveCamera({ ...cam }); if (!cameras.length) selectCamera(cam.id); }
    setSelected(a.id); go('overview');
  };
  const clearAll = () => { setAnimals([]); setCameras([]); setAlerts([]); setSelected(null); persistAnimals(EMPTY_OV); persistCameras(EMPTY_OV); };

  const unhandled = alerts.filter(a => !a.handled).length;
  // Three main tabs, each with its pages as sub-tabs (like a phone app)
  const CATS = [
    ['animals', PawPrint, t.catAnimals, t.catAnimalsSub, [['overview', LayoutGrid, t.navOverview, t.subOverview], ['live', Video, t.navLive, t.subLive], ['dex', ScanLine, t.navDex, t.subDex], ['history', TrendingUp, t.navHistory, t.subHistory]]],
    ['care', HeartPulse, t.catCare, t.catCareSub, [['alerts', Bell, t.navAlerts, t.subAlerts], ['health', Activity, t.navInsights, t.subInsights], ['habitat', Thermometer, t.navHabitat, t.subHabitat], ['enrich', Sparkles, t.navEnrich, t.subEnrich]]],
    ['work', ClipboardCheck, t.catWork, t.catWorkSub, [['tasks', ClipboardCheck, t.navTasks, t.subTasks], ['reports', FileText, t.navReports, t.subReports], ['manage', Settings, t.navManage, t.subManage], ['visitors', Users, t.navVisitors, t.subVisitors], ['about', Info, t.navAbout, t.subAbout]]],
  ];
  const GROUPS = CATS.map(c => [c[2], c[4]]);
  const catOf = pg => CATS.find(c => c[4].some(x => x[0] === pg))?.[0] || 'animals';
  const cat = catOf(page);
  const catBadge = { animals: 0, care: unhandled, work: tasks.pending };
  const pageBadge = { alerts: unhandled, tasks: tasks.pending };
  const NAV = GROUPS.flatMap(g => g[1]);
  const titles = { ...Object.fromEntries(NAV.map(([k, Icon, l, s]) => [k, [l, s, Icon]])), profile: [t.navProfile, t.subProfile, PawPrint] };
  const pageColor = PAGE_COLOR[page] || '#2E86DE', PageIcon = titles[page]?.[2];
  const dateStr = now.toLocaleDateString(L === 'th' ? 'th-TH' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const sec = now.getSeconds();
  const up = Math.max(0, Math.floor((now - new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 30)) / 1000));
  const tele = { cpu: (41 + Math.round(Math.sin(sec / 5) * 6)) + '°C', esp: 'OK · ' + (3.28 + (sec % 7) / 100).toFixed(2) + 'V', fps: 24 + (sec % 3), ms: 38 + (sec % 5), uptime: Math.floor(up / 3600) + 'h ' + String(Math.floor(up % 3600 / 60)).padStart(2, '0') + 'm' };

  const ctx = { t, L, tx: txL, animals, cameras: allCameras, alerts, piUrl, setPiUrl, live, liveOn, camera, selectCamera, log, openProfile, go, markHandled, selected, scan, startScan, sightings, lastSeen, now, clock: hms(now), tele, narrow, current, tasks, tasksPending: tasks.pending, toggleTask, addTask, saveAnimal, deleteAnimal, saveCamera, deleteCamera, resetData, loadDemo, clearAll, addExample };
  const pages = { overview: Overview, live: LiveMonitor, dex: LiveDex, profile: Profile, health: Health, alerts: Alerts, visitors: Visitors, about: About, reports: Reports, habitat: Habitat, enrich: Enrichment, tasks: Tasks, history: History, manage: Manage };
  const Page = pages[page] || Overview;

  const ModeSeg = () => (
    <div className="seg">
      <button className={`flex items-center gap-1.5 ${mode === 'admin' ? 'on' : ''}`} onClick={() => setMode('admin')}><Shield size={14} />{t.modeAdmin}</button>
      <button className={`flex items-center gap-1.5 ${mode === 'guest' ? 'on' : ''}`} onClick={() => setMode('guest')}><Smile size={14} />{t.modeGuest}</button>
    </div>);
  const LangSeg = () => <div className="seg"><button className={L === 'th' ? 'on' : ''} onClick={() => setLang('th')}>ไทย</button><button className={L === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button></div>;
  const Toast = () => { if (!toast) return null; const a = animals.find(x => x.id === toast.animalId); if (!a) return null; const sv = SEV_STYLE[toast.severity]; return (
    <div className="fixed right-6 bottom-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-[0_12px_40px_rgba(15,42,74,.22)] p-4 flex gap-3.5 items-start animate-toast border-t-4" style={{ borderColor: sv.color }}>
      <div className="w-11 h-11 rounded-xl grid place-items-center text-2xl flex-none" style={{ background: a.tint }}>{a.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: sv.bg, color: sv.color }}>{t[toast.severity]}</span><span className="font-bold">{txL(a.name)}</span></div>
        <div className="text-[13px] text-[#2B3A50] mt-1 leading-snug">{txL(toast.reason)}</div>
        <button onClick={() => go('alerts')} className="mt-2 text-ocean text-[13px] font-semibold">{t.openAlerts} →</button>
      </div>
      <button onClick={() => setToast(null)} className="text-[#8A97A8]"><X size={18} /></button>
    </div>); };

  // ---------------- GUEST MODE: no sidebar, one friendly page ----------------
  if (mode === 'guest') return (
    <div className="min-h-screen flex flex-col">
      <header className="topbar relative sticky top-0 z-10 px-4 sm:px-5 pt-3.5 pb-2.5 flex items-center gap-2 sm:gap-3 flex-wrap">
        <img src={logoWide} alt="VisionEx" className="h-10 w-auto block" />
        <div className="flex-1 min-w-[140px]"><div className="text-[18px] font-bold leading-tight">{t.guestTitle}</div><div className="text-xs text-muted">{t.guestSub}</div></div>
        <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] border border-line bg-white font-mono text-xs text-[#4A5A70]"><span className="font-semibold text-navy tabular-nums">{hms(now)}</span><span className="text-[#B9C4D3]">|</span><span>{dateStr}</span></div>
        <LangSeg /><ModeSeg />
      </header>
      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 sm:p-7"><Guest {...ctx} /></main>
    </div>
  );

  // ---------------- ADMIN MODE: 3 main tabs + sub-tabs ----------------
  const CatTab = ({ c, big }) => { const [k, Icon, label, sub] = c; const on = cat === k; return (
    <button onClick={() => go(c[4][0][0])} className={`relative flex ${big ? 'flex-col gap-0.5 py-2' : 'items-center gap-2 px-4 py-2'} rounded-xl text-sm font-bold transition ${on ? (big ? 'bg-white text-navy shadow' : 'bg-navy text-white shadow') : (big ? 'text-white/75' : 'text-[#4A5A70] hover:bg-white')}`}>
      <Icon size={big ? 22 : 18} /><span className={big ? 'text-[12px]' : ''}>{label}</span>
      {catBadge[k] > 0 && <span className={`${big ? 'absolute top-0.5 right-1/4' : ''} min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#E74C3C] text-white text-[11px] font-bold grid place-items-center`}>{catBadge[k]}</span>}
    </button>); };
  const curCat = CATS.find(c => c[0] === cat);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="topbar relative sticky top-0 z-10 px-4 md:px-6 pt-3.5 pb-2.5 flex items-center gap-3 flex-wrap print:hidden">
        <img src={mobile ? logoMark : logoWide} alt="VisionEx" className="h-10 w-auto block" />
        {!mobile && <nav className="flex gap-1 bg-[#E3EAF3] rounded-2xl p-1 border border-[#D3DEEB]">{CATS.map(c => <CatTab key={c[0]} c={c} />)}</nav>}
        <div className="flex-1" />
        {liveOn && <span className="px-2 py-1 rounded-md text-[10px] font-bold tracking-[.1em] bg-[#FF5252] text-white">{t.piLiveData}</span>}
        <button onClick={simulate} title={t.simulate} className={mobile ? 'flex items-center gap-1.5 h-10 px-3 rounded-[10px] bg-white border-2 border-[#CFE0F5] text-ocean text-sm font-bold' : 'flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-ocean hover:bg-[#1B6FC4] text-white text-sm font-semibold transition'}><Zap size={16} />{mobile ? t.demo : t.simulate}</button>
        {!mobile && <><LangSeg /><ModeSeg /></>}
      </header>
      <div className="relative sticky top-[61px] md:top-[65px] z-[9] backdrop-blur-md border-b px-4 md:px-6 py-2 flex gap-2 overflow-x-auto [scrollbar-width:none] print:hidden" style={{ background: `linear-gradient(90deg, ${pageColor}26, ${pageColor}0D 60%, rgba(255,255,255,.75))`, borderColor: pageColor + '33' }}><i className="motif" style={{ opacity: .07 }} />
        {curCat[4].map(([k, Icon, label]) => { const on = page === k || (page === 'profile' && k === 'overview'); const col = PAGE_COLOR[k]; return (
          <button key={k} onClick={() => go(k)} className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-bold whitespace-nowrap border-2 transition" style={on ? { background: col, borderColor: col, color: '#fff' } : { borderColor: col + '55', color: col, background: '#fff' }}>
            <Icon size={15} />{label}{pageBadge[k] > 0 && <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] grid place-items-center ${on ? 'bg-white/25 text-white' : 'bg-[#E74C3C] text-white'}`}>{pageBadge[k]}</span>}
          </button>); })}
        {mobile && <div className="flex gap-1.5 ml-auto pl-2 flex-none"><LangSeg /><ModeSeg /></div>}
      </div>
      {(() => { const urg = alerts.filter(a => !a.handled && a.severity === 'urgent'); if (!urg.length || page === 'alerts') return null; const a = animals.find(x => x.id === urg[0].animalId); if (!a) return null; return (
        <button onClick={() => go('alerts')} className="w-full text-left bg-[#E74C3C] text-white px-4 md:px-6 py-2.5 flex items-center gap-3 shadow-[0_4px_12px_rgba(231,76,60,.35)] print:hidden">
          <span className="px-2 py-0.5 rounded-md bg-white text-[#C0392B] font-mono text-[11px] font-bold tracking-[.08em] animate-pulse2">{t.urgentNow}</span>
          <span className="flex-1 min-w-0 text-sm font-semibold truncate">{a.emoji} {txL(a.name)}: {txL(urg[0].reason)}{urg.length > 1 ? ` · ${t.urgentMore} ${urg.length - 1}` : ''}</span>
          <span className="text-sm font-bold whitespace-nowrap">{t.prOpenAlerts} →</span>
        </button>); })()}
      <main className={`flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 flex flex-col gap-5 md:gap-6 min-w-0 print:p-0 ${mobile ? 'pb-24' : ''}`}>
        <div className="flex items-center gap-3 -mb-1"><span className="w-10 h-10 rounded-xl grid place-items-center text-white shadow-md flex-none" style={{ background: `linear-gradient(135deg, ${pageColor}, ${pageColor}B3)` }}>{PageIcon && <PageIcon size={20} />}</span><div className="min-w-0"><div className="text-[20px] md:text-[22px] font-bold leading-tight" style={{ color: pageColor }}>{titles[page]?.[0]}</div>{titles[page]?.[1] && <div className="text-[12px] text-muted leading-tight truncate">{titles[page][1]}</div>}</div></div>
        <Page {...ctx} />
      </main>
      {mobile && <nav className="fixed bottom-0 inset-x-0 z-20 bg-gradient-to-r from-navy to-[#173A63] grid grid-cols-3 gap-1 px-2 py-1.5 shadow-[0_-6px_20px_rgba(15,42,74,.25)] print:hidden"><i className="motif-light" style={{ opacity: .1 }} />{CATS.map(c => <CatTab key={c[0]} c={c} big />)}</nav>}
      <Toast />
    </div>
  );
}
