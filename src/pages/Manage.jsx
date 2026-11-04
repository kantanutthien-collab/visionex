import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, RotateCcw, Camera, PawPrint, Cpu, Wifi, WifiOff } from 'lucide-react';
import Photo from '../components/Photo.jsx';
import { photoOf, focusOf, camSrc, fileToDataUrl, PHOTOS } from '../data/photos.js';
import { Card } from '../components/ui.jsx';

const Field = ({ label, children }) => <label className="block text-xs text-muted"><span className="block mb-1">{label}</span>{children}</label>;
const inp = 'w-full px-3 py-2 border border-line rounded-[10px] text-sm bg-[#FAFBFD] focus:outline-ocean text-ink';
const slug = s => (s || 'animal').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'animal';
const newAnimal = (cameras) => ({ id: '', emoji: '🐾', tint: '#E8F1FC', name: { th: '', en: '' }, species: { th: '', en: '' }, age: 1, enclosure: { th: '', en: '' }, emotion: 'calm', health: 90, minutesAgo: 1, camera: cameras[0]?.id || 0, code: '', photo: '',
  eating: [5, 5, 5, 5, 5, 5, 5], activity: [65, 65, 65, 65, 65, 65, 65], resting: [8, 8, 8, 8, 8, 8, 8], pacing: [1, 1, 1, 1, 1, 1, 1], timeline: Array(12).fill('calm') });
const autoBoxes = (ids, animals) => ids.map((id, i) => { const a = animals.find(x => x.id === id); const w = Math.min(40, 80 / ids.length - 4); return { animalId: id, tag: `${a?.name.en || id} #${i + 1}`, conf: 90, x: 10 + i * (80 / ids.length), y: 20, w, h: 60 }; });
// Add one box for a new animal in the emptiest third of the frame, keeping existing boxes untouched
const addBox = (boxes, a) => { const slots = [6, 37, 68]; const used = boxes.map(b => b.x + b.w / 2); const x = slots.find(sx => !used.some(u => Math.abs(u - (sx + 13)) < 20)) ?? 37; return [...boxes, { animalId: a.id, tag: `${a.name.en || a.id} #${boxes.length + 1}`, conf: 90, x, y: 28, w: 26, h: 50 }]; };

export default function Manage({ t, L, tx, animals, cameras, saveAnimal, deleteAnimal, saveCamera, deleteCamera, resetData, openProfile, piUrl, setPiUrl, live, loadDemo, clearAll, addExample }) {
  const [urlDraft, setUrlDraft] = useState(piUrl || '');
  const [more, setMore] = useState(false);
  const [edit, setEdit] = useState(null);   // { kind:'animal'|'camera', data, isNew }
  const [err, setErr] = useState('');
  const close = () => { setEdit(null); setErr(''); };
  const upload = async (file, onDone) => { if (!file) return; const { dataUrl, aspect } = await fileToDataUrl(file); onDone(dataUrl, aspect); };
  const set = patch => setEdit(e => ({ ...e, data: { ...e.data, ...patch } }));
  const setL = (key, lang, v) => setEdit(e => ({ ...e, data: { ...e.data, [key]: { ...e.data[key], [lang]: v } } }));
  const both = o => ({ th: o.th || o.en, en: o.en || o.th });

  const submit = () => {
    const d = edit.data;
    if (edit.kind === 'animal') {
      if (!d.name.th && !d.name.en) return setErr(t.mgRequired);
      const id = d.id || (() => { let b = slug(d.name.en || d.name.th), s = b, n = 2; while (animals.some(a => a.id === s)) s = b + '-' + n++; return s; })();
      const a = { ...d, id, name: both(d.name), species: both(d.species), enclosure: both(d.enclosure), age: +d.age || 0, camera: +d.camera, code: d.code || ('NEW-' + String(animals.length + 1).padStart(2, '0')) };
      saveAnimal(a);
      // make sure the chosen camera shows this animal
      const cam = cameras.find(c => c.id === a.camera);
      if (cam && !cam.boxes.some(b => b.animalId === a.id)) saveCamera({ ...cam, boxes: addBox(cam.boxes, a) });
    } else {
      if (!d.name.th && !d.name.en) return setErr(t.mgRequired);
      const id = d.id || Math.max(0, ...cameras.map(c => c.id)) + 1;
      const ids = d.animalIds || [];
      const keep = (d.boxes || []).filter(b => ids.includes(b.animalId));
      const missing = ids.filter(i => !keep.some(b => b.animalId === i));
      saveCamera({ id, name: both(d.name), photo: d.photo || (ids[0] && PHOTOS[ids[0]] ? ids[0] : d.photo), aspect: d.aspect, boxes: missing.length ? autoBoxes(ids, animals) : keep });
    }
    close();
  };
  const del = () => { if (!window.confirm(t.mgConfirmDelete)) return; edit.kind === 'animal' ? deleteAnimal(edit.data.id) : deleteCamera(edit.data.id); close(); };

  const d = edit?.data;
  const form = edit && (
    <Card className="!rounded-[18px] p-5 border-2 border-ocean animate-fadeIn">
      <div className="flex items-center gap-2 mb-4"><div className="text-[17px] font-bold flex-1">{edit.kind === 'animal' ? (edit.isNew ? t.mgAddAnimal : `${t.mgEdit}: ${tx(d.name) || t.mgNewAnimal}`) : (edit.isNew ? t.mgAddCamera : `${t.mgEdit}: ${tx(d.name) || t.mgNewCamera}`)}</div>{!edit.isNew && <button onClick={del} className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[#FDEAEA] text-[#C0392B] text-[13px] font-semibold"><Trash2 size={14} />{t.mgDelete}</button>}</div>
      {edit.kind === 'animal' ? (
        <div className="grid gap-3 md:grid-cols-[220px_1fr]">
          <div>
            <div className="rounded-xl overflow-hidden bg-ground h-[160px]"><img src={d.photo || photoOf(d)} alt="" className="w-full h-full object-cover" /></div>
            <label className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-[10px] bg-ocean/10 text-ocean text-[13px] font-semibold cursor-pointer"><Upload size={14} />{t.mgUpload}<input type="file" accept="image/*" className="hidden" onChange={e => upload(e.target.files[0], url => set({ photo: url }))} /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t.mgNameTh}><input className={inp} value={d.name.th} onChange={e => setL('name', 'th', e.target.value)} /></Field>
            <Field label={t.mgNameEn}><input className={inp} value={d.name.en} onChange={e => setL('name', 'en', e.target.value)} /></Field>
            <Field label={t.mgSpeciesTh}><input className={inp} value={d.species.th} onChange={e => setL('species', 'th', e.target.value)} /></Field>
            <Field label={t.mgSpeciesEn}><input className={inp} value={d.species.en} onChange={e => setL('species', 'en', e.target.value)} /></Field>
            <Field label={t.mgEnclosureTh}><input className={inp} value={d.enclosure.th} onChange={e => setL('enclosure', 'th', e.target.value)} /></Field>
            <Field label={t.mgEnclosureEn}><input className={inp} value={d.enclosure.en} onChange={e => setL('enclosure', 'en', e.target.value)} /></Field>
            <Field label={t.mgAge}><input type="number" min="0" className={inp} value={d.age} onChange={e => set({ age: e.target.value })} /></Field>
            <Field label={t.mgEmoji}><input className={inp} value={d.emoji} onChange={e => set({ emoji: e.target.value })} /></Field>
            <Field label={t.mgCamera}><select className={inp} value={d.camera} onChange={e => set({ camera: +e.target.value })}><option value={0}>—</option>{cameras.map(c => <option key={c.id} value={c.id}>CAM {c.id} · {tx(c.name)}</option>)}</select></Field>
            <Field label="ID / Code"><input className={inp} value={d.code} placeholder="NEW-01" onChange={e => set({ code: e.target.value })} /></Field>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-[260px_1fr]">
          <div>
            <div className="rounded-xl overflow-hidden bg-ground aspect-video"><img src={d.photo ? (PHOTOS[d.photo] || d.photo) : camSrc({})} alt="" className="w-full h-full object-cover" /></div>
            <label className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-[10px] bg-ocean/10 text-ocean text-[13px] font-semibold cursor-pointer"><Upload size={14} />{t.mgUpload}<input type="file" accept="image/*" className="hidden" onChange={e => upload(e.target.files[0], (url, aspect) => set({ photo: url, aspect }))} /></label>
            <div className="text-[11px] text-muted mt-2">{t.mgPickFromAnimal}</div>
            <div className="flex flex-wrap gap-1.5 mt-1">{animals.filter(a => PHOTOS[a.id] || a.photo).map(a => <button key={a.id} onClick={() => set({ photo: PHOTOS[a.id] ? a.id : a.photo, aspect: PHOTOS[a.id] ? undefined : 4 / 3 })} className="w-9 h-9 rounded-lg overflow-hidden border-2 border-transparent hover:border-ocean"><Photo a={a} className="w-full h-full" /></button>)}</div>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.mgNameTh}><input className={inp} value={d.name.th} onChange={e => setL('name', 'th', e.target.value)} /></Field>
              <Field label={t.mgNameEn}><input className={inp} value={d.name.en} onChange={e => setL('name', 'en', e.target.value)} /></Field>
            </div>
            <div className="text-xs text-muted">{t.mgOnCam}</div>
            <div className="flex flex-wrap gap-2">{animals.map(a => { const on = (d.animalIds || []).includes(a.id); return <button key={a.id} onClick={() => set({ animalIds: on ? d.animalIds.filter(x => x !== a.id) : [...(d.animalIds || []), a.id] })} className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border-2 text-[13px] font-semibold transition ${on ? 'border-ocean bg-[#E8F1FC] text-navy' : 'border-line text-muted'}`}><Photo a={a} className="w-7 h-7 rounded-full" />{a.emoji} {tx(a.name)}</button>; })}</div>
          </div>
        </div>
      )}
      {err && <div className="mt-3 text-[13px] text-[#C0392B] font-semibold">{err}</div>}
      <div className="flex gap-2 mt-4 justify-end"><button onClick={close} className="px-4 py-2.5 rounded-[10px] border border-line text-sm font-semibold text-muted">{t.mgCancel}</button><button onClick={submit} className="px-5 py-2.5 rounded-[10px] bg-leaf text-white text-sm font-semibold">{t.mgSave}</button></div>
    </Card>);

  const st = live?.status || 'off';
  const stColor = st === 'online' ? '#27AE60' : st === 'error' ? '#E74C3C' : st === 'connecting' ? '#E67E22' : '#6B7A90';
  const stText = st === 'online' ? t.piOnline : st === 'error' ? t.piError : st === 'connecting' ? t.piConnecting : t.piOffline;
  return (
    <>
      <Card className="!rounded-[18px] p-4 flex items-center gap-3 flex-wrap border-l-[6px]" style={{ borderColor: stColor }}>
        <Cpu size={22} style={{ color: stColor }} />
        <div className="font-bold text-[15px]">{t.mgCameraTitle}</div>
        <input value={urlDraft} onChange={e => setUrlDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && setPiUrl(urlDraft.trim())} placeholder="http://raspberrypi.local:8000" className={`flex-1 min-w-[200px] ${inp}`} />
        {st === 'off' || urlDraft.trim() !== (piUrl || '') ? <button onClick={() => setPiUrl(urlDraft.trim())} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-ocean text-white text-sm font-semibold"><Wifi size={16} />{t.piConnect}</button>
          : <button onClick={() => { setPiUrl(''); setUrlDraft(''); }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#EEF2F7] text-ink text-sm font-semibold"><WifiOff size={16} />{t.piDisconnect}</button>}
        <div className="w-full text-[13px] font-semibold flex items-center gap-2" style={{ color: stColor }}><span className="w-2.5 h-2.5 rounded-full" style={{ background: stColor }} />{stText}{st === 'online' && live.state && <span className="font-mono text-[11px] text-muted font-normal">· {live.state.fps} FPS</span>}</div>
      </Card>
      {form}
      <Card className="!rounded-[18px] p-5">
        <div className="flex items-center gap-3 flex-wrap mb-4"><div className="text-[17px] font-bold flex-1">{t.mgAnimals} <span className="font-mono text-muted text-sm">{animals.length}</span></div><button onClick={addExample} title={t.addExampleSub} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#E8F1FC] text-ocean text-sm font-semibold"><PawPrint size={16} />{t.addExample}</button><button onClick={() => setEdit({ kind: 'animal', isNew: true, data: newAnimal(cameras) })} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-ocean text-white text-sm font-semibold"><Plus size={16} />{t.mgAddAnimal}</button></div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-3">
          {animals.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#EEF2F7] hover:bg-ground transition">
              <Photo a={a} className="w-14 h-14 rounded-xl cursor-pointer" onClick={() => openProfile(a.id)} />
              <div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{a.emoji} {tx(a.name)}</div><div className="text-xs text-muted truncate">{tx(a.species)} · {tx(a.enclosure)}</div><div className="font-mono text-[10px] text-ocean">CAM {a.camera} · {a.code || a.id.toUpperCase()}</div></div>
              <button onClick={() => setEdit({ kind: 'animal', isNew: false, data: { ...a, code: a.code || '', photo: a.photo || '' } })} className="flex items-center gap-1 px-3 py-2 rounded-[10px] bg-[#E8F1FC] text-ocean text-[13px] font-semibold"><Pencil size={14} />{t.mgEdit}</button>
            </div>))}
        </div>
      </Card>
      <button onClick={() => setMore(!more)} className="self-start text-[13px] text-muted hover:text-ink px-1">{more ? t.mgLess + ' ▲' : t.mgMore + ' ▼'}</button>
      {more && <>
      <Card className="!rounded-[18px] p-5">
        <div className="flex items-center gap-3 flex-wrap mb-4"><Camera size={20} className="text-ocean" /><div className="text-[17px] font-bold flex-1">{t.mgCameras} <span className="font-mono text-muted text-sm">{cameras.length}</span></div><button onClick={() => setEdit({ kind: 'camera', isNew: true, data: { name: { th: '', en: '' }, photo: '', animalIds: [], boxes: [] } })} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-ocean text-white text-sm font-semibold"><Plus size={16} />{t.mgAddCamera}</button></div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-3">
          {cameras.map(c => (
            <div key={c.id} className="rounded-xl overflow-hidden border border-[#EEF2F7]">
              <div className="h-[110px] relative"><img src={camSrc(c)} alt="" className="w-full h-full object-cover" /><span className="absolute left-2 top-2 px-2 py-0.5 rounded-md bg-navy/80 text-white font-mono text-[10px]">CAM {c.id}</span></div>
              <div className="p-3 flex items-center gap-2"><div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{tx(c.name)}</div><div className="text-xs text-muted truncate">{[...new Set(c.boxes.map(b => b.animalId))].map(id => animals.find(a => a.id === id)).filter(Boolean).map(a => a.emoji + ' ' + tx(a.name)).join(', ') || '—'}</div></div>
                <button onClick={() => setEdit({ kind: 'camera', isNew: false, data: { ...c, animalIds: [...new Set(c.boxes.map(b => b.animalId))] } })} className="flex items-center gap-1 px-3 py-2 rounded-[10px] bg-[#E8F1FC] text-ocean text-[13px] font-semibold"><Pencil size={14} />{t.mgEdit}</button></div>
            </div>))}
        </div>
        <div className="mt-5 pt-4 border-t border-[#EEF2F7] flex items-center gap-3 flex-wrap">
          <button onClick={loadDemo} className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#E8F1FC] text-ocean text-sm font-semibold"><PawPrint size={16} />{t.loadDemo}</button><span className="text-xs text-muted">{t.loadDemoSub}</span>
          {(animals.length > 0 || cameras.length > 0) && <button onClick={() => window.confirm(t.clearAllConfirm) && clearAll()} className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[13px] text-[#C0392B] bg-[#FDEAEA] font-semibold"><Trash2 size={14} />{t.clearAll}</button>}
        </div>
      </Card>
      </>}
    </>
  );
}
