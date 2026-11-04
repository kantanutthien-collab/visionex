import { HABITATS, SENSOR_LABELS } from '../data/mock.js';
import { sensorStatus } from './analysis.js';

export const todayKey = () => 'visionex-tasks-' + new Date().toISOString().slice(0, 10);
export const loadTasks = () => { try { return JSON.parse(localStorage.getItem(todayKey()) || '{"done":{},"extra":[]}'); } catch { return { done: {}, extra: [] }; } };
export const saveTasks = s => localStorage.setItem(todayKey(), JSON.stringify(s));

// Merge routine checks, user-added tasks, open alerts and out-of-range sensors into one list.
export function buildTasks({ alerts, taskState, now, L, animals = [] }) {
  const habitats = HABITATS.filter(h => h.animals.some(id => animals.some(a => a.id === id)));
  const hm = now.getHours() * 60 + now.getMinutes();
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const routine = [...taskState.extra].map(r => ({ ...r, kind: 'routine', done: !!taskState.done[r.id], overdue: !taskState.done[r.id] && toMin(r.time) < hm }));
  const alertTasks = alerts.filter(a => !a.handled).map(a => ({ id: 'al-' + a.id, kind: 'alert', time: a.time, animalId: a.animalId, severity: a.severity, title: a.reason, done: false, overdue: a.severity === 'urgent', alertId: a.id }));
  const sensorTasks = habitats.flatMap(h => h.sensors.filter(s => sensorStatus(s) === 'out').map(s => ({ id: 'sn-' + h.id + s.key, kind: 'sensor', time: '', animalId: h.animals[0], habitat: h, sensor: s, title: { th: `${SENSOR_LABELS[s.key].th} ${s.value}${s.unit} (ช่วง ${s.range[0]}–${s.range[1]}) · ${h.name.th}`, en: `${SENSOR_LABELS[s.key].en} ${s.value}${s.unit} (range ${s.range[0]}–${s.range[1]}) · ${h.name.en}` }, done: !!taskState.done['sn-' + h.id + s.key], overdue: !taskState.done['sn-' + h.id + s.key] })));
  const all = [...routine, ...alertTasks, ...sensorTasks];
  return { all, pending: all.filter(x => !x.done).length, done: all.filter(x => x.done).length, routine, alertTasks, sensorTasks };
}
