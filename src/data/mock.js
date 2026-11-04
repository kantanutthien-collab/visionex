export const EMOTIONS = {
  calm:     { th: 'สงบ',        en: 'Calm',     emoji: '😊', color: '#27AE60', bg: '#E8F8EF' },
  playful:  { th: 'ร่าเริง',     en: 'Playful',  emoji: '😄', color: '#2E86DE', bg: '#E8F1FC' },
  stressed: { th: 'เครียด',      en: 'Stressed', emoji: '😟', color: '#E67E22', bg: '#FDF1E6' },
  agitated: { th: 'กระวนกระวาย', en: 'Agitated', emoji: '😠', color: '#E74C3C', bg: '#FDEAEA' },
};

export const BEHAVIORS = {
  eating:   { th: 'กำลังกิน', en: 'Eating' },
  walking:  { th: 'เดิน',     en: 'Walking' },
  resting:  { th: 'พัก',      en: 'Resting' },
  pacing:   { th: 'เดินวน',   en: 'Pacing' },
  playing:  { th: 'เล่น',     en: 'Playing' },
  drinking: { th: 'ดื่มน้ำ',   en: 'Drinking' },
};

// 7-day arrays run oldest → today. eating = kg/day, activity = index 0-100, resting = hours/day, pacing = episodes/day.
// timeline = emotion per hour, 06:00 → 18:00 (12 slots).
export const ANIMALS = [
  { id: 'giraffe', emoji: '🦒', tint: '#FBEBC9', name: { th: 'ยาหยี', en: 'Yayee' }, species: { th: 'ยีราฟ', en: 'Giraffe' }, age: 7, enclosure: { th: 'โซนสะวันนา A', en: 'Savanna Zone A' }, emotion: 'calm', health: 92, minutesAgo: 2, camera: 1,
    eating: [32, 31, 33, 32, 34, 33, 33], activity: [68, 70, 66, 69, 71, 70, 69], resting: [5, 4.5, 5, 5, 4.8, 5, 5], pacing: [1, 0, 1, 1, 0, 1, 1],
    timeline: ['calm', 'calm', 'calm', 'playful', 'calm', 'calm', 'calm', 'calm', 'playful', 'calm', 'calm', 'calm'] },
  { id: 'elephant', emoji: '🐘', tint: '#E3E8EF', name: { th: 'พลายบุญมี', en: 'Boonmee' }, species: { th: 'ช้างเอเชีย', en: 'Asian elephant' }, age: 24, enclosure: { th: 'ลานช้าง', en: 'Elephant Yard' }, emotion: 'calm', health: 88, minutesAgo: 4, camera: 3,
    eating: [150, 148, 152, 151, 149, 150, 147], activity: [60, 62, 59, 61, 60, 58, 59], resting: [4, 4.2, 4, 4.1, 4, 4.3, 4.2], pacing: [2, 1, 2, 2, 3, 2, 2],
    timeline: ['calm', 'calm', 'calm', 'calm', 'calm', 'playful', 'calm', 'calm', 'calm', 'calm', 'calm', 'calm'] },
  { id: 'lion', emoji: '🦁', tint: '#F7DFC4', name: { th: 'เจ้าสิงห์', en: 'Singh' }, species: { th: 'สิงโตแอฟริกา', en: 'African lion' }, age: 9, enclosure: { th: 'โซนสัตว์ผู้ล่า B', en: 'Predator Zone B' }, emotion: 'stressed', health: 61, minutesAgo: 1, camera: 5,
    eating: [8.2, 8.0, 8.1, 7.9, 6.9, 6.0, 5.4], activity: [55, 54, 56, 52, 48, 45, 42], resting: [13, 13, 12.5, 12, 11, 10, 9], pacing: [4, 5, 4, 6, 9, 12, 14],
    timeline: ['calm', 'calm', 'stressed', 'stressed', 'calm', 'stressed', 'stressed', 'agitated', 'stressed', 'stressed', 'calm', 'stressed'] },
  { id: 'monkey', emoji: '🐒', tint: '#E6EFD9', name: { th: 'จ๋อ', en: 'Jor' }, species: { th: 'ลิงแสม', en: 'Long-tailed macaque' }, age: 4, enclosure: { th: 'เกาะลิง', en: 'Monkey Island' }, emotion: 'playful', health: 90, minutesAgo: 3, camera: 6,
    eating: [1.8, 1.9, 1.8, 2.0, 1.9, 1.9, 2.0], activity: [85, 88, 84, 86, 87, 89, 88], resting: [9, 9, 8.5, 9, 9, 8.8, 9], pacing: [0, 1, 0, 0, 1, 0, 0],
    timeline: ['calm', 'playful', 'playful', 'playful', 'calm', 'calm', 'playful', 'playful', 'playful', 'calm', 'playful', 'calm'] },
  { id: 'penguin', emoji: '🐧', tint: '#DCEBF7', name: { th: 'ปิ๊งปิ๊ง', en: 'Ping' }, species: { th: 'เพนกวินฮัมโบลต์', en: 'Humboldt penguin' }, age: 3, enclosure: { th: 'บ่อเพนกวิน', en: 'Penguin Pool' }, emotion: 'playful', health: 94, minutesAgo: 2, camera: 7,
    eating: [1.2, 1.2, 1.3, 1.2, 1.2, 1.3, 1.3], activity: [78, 80, 77, 79, 81, 80, 82], resting: [8, 8, 8, 7.8, 8, 8, 8], pacing: [0, 0, 0, 0, 0, 0, 0],
    timeline: ['calm', 'playful', 'playful', 'calm', 'playful', 'playful', 'calm', 'calm', 'playful', 'playful', 'calm', 'calm'] },
  { id: 'tiger', emoji: '🐯', tint: '#F9E2C8', name: { th: 'ขวัญใจ', en: 'Kwanjai' }, species: { th: 'เสือโคร่งอินโดจีน', en: 'Indochinese tiger' }, age: 6, enclosure: { th: 'โซนสัตว์ผู้ล่า A', en: 'Predator Zone A' }, emotion: 'calm', health: 78, minutesAgo: 5, camera: 4,
    eating: [6.5, 6.4, 6.6, 6.5, 6.3, 6.4, 6.2], activity: [50, 52, 51, 49, 46, 44, 41], resting: [14, 14, 14.5, 14, 15, 15.5, 16], pacing: [3, 3, 2, 3, 4, 4, 5],
    timeline: ['calm', 'calm', 'calm', 'calm', 'calm', 'calm', 'calm', 'calm', 'calm', 'calm', 'calm', 'calm'] },
  { id: 'zebra', emoji: '🦓', tint: '#E8E8EC', name: { th: 'ลายเส้น', en: 'Laisen' }, species: { th: 'ม้าลาย', en: 'Plains zebra' }, age: 5, enclosure: { th: 'โซนสะวันนา A', en: 'Savanna Zone A' }, emotion: 'calm', health: 89, minutesAgo: 2, camera: 2,
    eating: [12, 12.5, 12, 12.2, 12, 12.4, 12.1], activity: [65, 66, 64, 67, 65, 66, 66], resting: [6, 6, 6.2, 6, 6, 6, 6.1], pacing: [1, 1, 2, 1, 1, 1, 1],
    timeline: ['calm', 'calm', 'calm', 'calm', 'playful', 'calm', 'calm', 'calm', 'calm', 'calm', 'calm', 'calm'] },
  { id: 'otter', emoji: '🦦', tint: '#E1EEEA', name: { th: 'โอ๋โอ๋', en: 'Oh-oh' }, species: { th: 'นากเล็กเล็บสั้น', en: 'Small-clawed otter' }, age: 2, enclosure: { th: 'ลำธารนาก', en: 'Otter Creek' }, emotion: 'playful', health: 93, minutesAgo: 1, camera: 8,
    eating: [0.9, 0.9, 1.0, 0.9, 0.9, 1.0, 1.0], activity: [90, 89, 91, 90, 92, 90, 91], resting: [10, 10, 9.5, 10, 10, 10, 10], pacing: [0, 0, 0, 0, 0, 0, 0],
    timeline: ['playful', 'playful', 'calm', 'playful', 'playful', 'playful', 'calm', 'playful', 'playful', 'playful', 'calm', 'calm'] },
];

export const ALERTS = [
  { id: 'a1', severity: 'urgent', animalId: 'lion', time: '08:42', day: { th: 'วันนี้', en: 'Today' }, handled: false,
    reason: { th: 'กินอาหารน้อยลง 32% ติดต่อกัน 3 วัน และเดินวนเพิ่มขึ้น 2 เท่า', en: 'Eating 32% less for 3 days in a row and pacing doubled' } },
  { id: 'a2', severity: 'warning', animalId: 'tiger', time: '07:15', day: { th: 'วันนี้', en: 'Today' }, handled: false,
    reason: { th: 'ระดับกิจกรรมลดลง 16% เทียบค่าเฉลี่ย 7 วัน', en: 'Activity level down 16% vs 7-day average' } },
  { id: 'a3', severity: 'info', animalId: 'penguin', time: '06:30', day: { th: 'วันนี้', en: 'Today' }, handled: false,
    reason: { th: 'ให้อาหารรอบเช้าเรียบร้อย กินครบตามปริมาณ', en: 'Morning feeding complete, full portion eaten' } },
  { id: 'a4', severity: 'info', animalId: 'elephant', time: '16:20', day: { th: 'เมื่อวาน', en: 'Yesterday' }, handled: true,
    reason: { th: 'ตรวจสุขภาพประจำสัปดาห์เสร็จสิ้น ผลปกติ', en: 'Weekly health check complete, results normal' } },
  { id: 'a5', severity: 'warning', animalId: 'lion', time: '09:05', day: { th: 'เมื่อวาน', en: 'Yesterday' }, handled: true,
    reason: { th: 'กินอาหารเหลือ 25% ของปริมาณปกติ', en: 'Left 25% of normal portion uneaten' } },
];

// One camera per enclosure. photo = key in data/photos.js. Boxes are in photo-percent coordinates (x, y, w, h) and are mapped onto the feed by components/CamFeed.jsx.
export const CAMERAS = [
  { id: 1, name: { th: 'สะวันนา A · ยีราฟ', en: 'Savanna A · Giraffe' },   photo: 'giraffe',  boxes: [ { animalId: 'giraffe',  tag: 'Giraffe #1',  conf: 92, x: 3,  y: 4,  w: 90, h: 88 } ] },
  { id: 2, name: { th: 'สะวันนา A · ม้าลาย', en: 'Savanna A · Zebra' },    photo: 'zebra',    boxes: [ { animalId: 'zebra',    tag: 'Zebra #3',    conf: 88, x: 29, y: 12, w: 64, h: 79 } ] },
  { id: 3, name: { th: 'ลานช้าง', en: 'Elephant Yard' },                    photo: 'elephant', boxes: [ { animalId: 'elephant', tag: 'Elephant #1', conf: 97, x: 31, y: 12, w: 42, h: 78 } ] },
  { id: 4, name: { th: 'ผู้ล่า A · เสือโคร่ง', en: 'Predator A · Tiger' },  photo: 'tiger',    boxes: [ { animalId: 'tiger',    tag: 'Tiger #2',    conf: 90, x: 12, y: 22, w: 82, h: 52 } ] },
  { id: 5, name: { th: 'ผู้ล่า B · สิงโต', en: 'Predator B · Lion' },       photo: 'lion',     boxes: [ { animalId: 'lion',     tag: 'Lion #1',     conf: 71, x: 15, y: 14, w: 75, h: 72 } ] },
  { id: 6, name: { th: 'เกาะลิง', en: 'Monkey Island' },                    photo: 'monkey',   boxes: [ { animalId: 'monkey', tag: 'Macaque #4', conf: 95, x: 3, y: 10, w: 40, h: 78 }, { animalId: 'monkey', tag: 'Macaque #7', conf: 89, x: 50, y: 15, w: 50, h: 78 }, { animalId: 'monkey', tag: 'Macaque #2', conf: 81, x: 35, y: 37, w: 15, h: 30 } ] },
  { id: 7, name: { th: 'บ่อเพนกวิน', en: 'Penguin Pool' },                  photo: 'penguin',  boxes: [ { animalId: 'penguin',  tag: 'Penguin #5',  conf: 96, x: 18, y: 16, w: 78, h: 65 } ] },
  { id: 8, name: { th: 'ลำธารนาก', en: 'Otter Creek' },                     photo: 'otter',    boxes: [ { animalId: 'otter',    tag: 'Otter #1',    conf: 91, x: 24, y: 18, w: 66, h: 55 } ] },
];

export const BEHAVIOR_SEED = {
  1: [ ['09:41:12', 'giraffe', 'eating'], ['09:31:27', 'giraffe', 'walking'], ['09:22:46', 'giraffe', 'eating'], ['09:12:03', 'giraffe', 'resting'] ],
  2: [ ['09:38:50', 'zebra', 'walking'], ['09:28:11', 'zebra', 'resting'], ['09:17:40', 'zebra', 'eating'], ['09:05:22', 'zebra', 'walking'] ],
  3: [ ['09:35:04', 'elephant', 'drinking'], ['09:24:18', 'elephant', 'eating'], ['09:10:51', 'elephant', 'walking'], ['08:58:30', 'elephant', 'eating'] ],
  4: [ ['09:33:05', 'tiger', 'resting'], ['09:19:33', 'tiger', 'resting'], ['09:02:14', 'tiger', 'walking'], ['08:49:57', 'tiger', 'resting'] ],
  5: [ ['09:40:58', 'lion', 'pacing'], ['09:37:20', 'lion', 'pacing'], ['09:30:41', 'lion', 'walking'], ['09:26:12', 'lion', 'pacing'], ['09:14:08', 'lion', 'resting'] ],
  6: [ ['09:41:30', 'monkey', 'playing'], ['09:39:02', 'monkey', 'eating'], ['09:36:48', 'monkey', 'playing'], ['09:32:15', 'monkey', 'walking'], ['09:27:59', 'monkey', 'resting'] ],
  7: [ ['09:38:22', 'penguin', 'eating'], ['09:34:47', 'penguin', 'walking'], ['09:25:36', 'penguin', 'resting'], ['09:13:10', 'penguin', 'playing'] ],
  8: [ ['09:41:05', 'otter', 'playing'], ['09:30:10', 'otter', 'eating'], ['09:20:44', 'otter', 'playing'], ['09:08:29', 'otter', 'resting'] ],
};

export const VISITORS = [
  { tin: '05:50', tout: '07:30', name: { th: 'สมชาย วงศ์ดี', en: 'Somchai Wongdee' }, role: 'keeper', area: { th: 'โซนสัตว์ผู้ล่า B', en: 'Predator Zone B' }, purpose: { th: 'ให้อาหารเช้า ทำความสะอาดคอก', en: 'Morning feeding, enclosure cleaning' } },
  { tin: '06:10', tout: '07:05', name: { th: 'อรทัย แสงจันทร์', en: 'Orathai Saengchan' }, role: 'keeper', area: { th: 'โซนสะวันนา A', en: 'Savanna Zone A' }, purpose: { th: 'ให้อาหารเช้า', en: 'Morning feeding' } },
  { tin: '06:30', tout: '07:15', name: { th: 'ประยุทธ์ ใจกล้า', en: 'Prayut Jaikla' }, role: 'cleaner', area: { th: 'บ่อเพนกวิน', en: 'Penguin Pool' }, purpose: { th: 'ล้างบ่อ เปลี่ยนน้ำ', en: 'Pool cleaning, water change' } },
  { tin: '08:00', tout: '08:45', name: { th: 'น.สพ.วิภา ศรีสุข', en: 'Dr. Wipa Srisuk' }, role: 'vet', area: { th: 'โซนสัตว์ผู้ล่า B', en: 'Predator Zone B' }, purpose: { th: 'ตรวจอาการเจ้าสิงห์ตามแจ้งเตือน', en: 'Examine Singh following alert' } },
  { tin: '08:20', tout: '08:35', name: { th: 'กิตติ เทคนิค', en: 'Kitti Technic' }, role: 'tech', area: { th: 'ลานช้าง', en: 'Elephant Yard' }, purpose: { th: 'ปรับตำแหน่งกล้อง 1 เปลี่ยนแบตเตอรี่ ESP32', en: 'Adjust camera 1, replace ESP32 battery' } },
  { tin: '09:00', tout: '09:40', name: { th: 'มานี รักสัตว์', en: 'Manee Raksat' }, role: 'guide', area: { th: 'เกาะลิง', en: 'Monkey Island' }, purpose: { th: 'นำชมกลุ่มนักเรียน 30 คน', en: 'Guided tour, 30 students' } },
  { tin: '09:00', tout: '09:40', name: { th: 'โรงเรียนวัดสระแก้ว ป.5', en: 'Wat Sakaew School, Grade 5' }, role: 'student', area: { th: 'เกาะลิง', en: 'Monkey Island' }, purpose: { th: 'ทัศนศึกษา', en: 'Field trip' } },
  { tin: '09:25', tout: null, name: { th: 'สมชาย วงศ์ดี', en: 'Somchai Wongdee' }, role: 'keeper', area: { th: 'โซนสัตว์ผู้ล่า B', en: 'Predator Zone B' }, purpose: { th: 'สังเกตพฤติกรรมเจ้าสิงห์เพิ่มเติม', en: 'Additional observation of Singh' } },
];

export const SIM_EVENTS = [
  { animalId: 'monkey', emotion: 'agitated', severity: 'warning', behavior: 'pacing', reason: { th: 'ตรวจพบความกระวนกระวาย เสียงดังจากกลุ่มผู้ชมบริเวณกรง', en: 'Agitation detected: loud noise from visitor group near enclosure' } },
  { animalId: 'zebra', emotion: 'stressed', severity: 'warning', behavior: 'pacing', reason: { th: 'เดินวนเพิ่มขึ้นผิดปกติในช่วง 15 นาทีที่ผ่านมา', en: 'Unusual pacing increase in the last 15 minutes' } },
  { animalId: 'otter', emotion: 'stressed', severity: 'urgent', behavior: 'resting', reason: { th: 'ไม่กินอาหารรอบบ่าย และหลบอยู่ในที่พักนานกว่าปกติ', en: 'Skipped afternoon feeding and hiding longer than usual' } },
  { animalId: 'elephant', emotion: null, severity: 'info', behavior: 'drinking', reason: { th: 'เซนเซอร์ ESP32 ตรวจพบระดับน้ำในบ่อต่ำ', en: 'ESP32 sensor: pool water level low' } },
  { animalId: 'tiger', emotion: 'agitated', severity: 'urgent', behavior: 'pacing', reason: { th: 'เดินวนต่อเนื่องนานกว่า 20 นาที และส่งเสียงคำราม', en: 'Continuous pacing over 20 minutes with vocalisation' } },
];

// Live Dex: visual identity record per animal. signature = 8-dim normalized feature vector (pattern, size, coat tone, limb ratio, gait, head shape, tail, markings).
export const DEX = {
  giraffe:  { code: 'GR-01', pattern: { th: 'ลายตาข่ายน้ำตาลเข้ม ขอบขาว', en: 'Dark brown reticulated patches, white edges' }, size: { th: 'สูง 4.6 ม.', en: 'Height 4.6 m' }, coat: { th: 'น้ำตาลส้ม', en: 'Orange-brown' }, mark: { th: 'จุดดำบนคอด้านซ้าย', en: 'Dark spot left neck' }, signature: [0.92, 0.98, 0.61, 0.95, 0.40, 0.72, 0.55, 0.66], accuracy: 97, sightings: 14 },
  elephant: { code: 'EL-01', pattern: { th: 'ผิวเรียบ ไม่มีลาย', en: 'Smooth skin, no pattern' }, size: { th: 'สูง 2.8 ม.', en: 'Height 2.8 m' }, coat: { th: 'เทาเข้ม', en: 'Dark grey' }, mark: { th: 'ใบหูขวามีรอยแหว่ง', en: 'Notch on right ear' }, signature: [0.05, 0.99, 0.30, 0.60, 0.25, 0.88, 0.35, 0.45], accuracy: 99, sightings: 11 },
  lion:     { code: 'LN-01', pattern: { th: 'ขนสีเดียว แผงคอหนา', en: 'Solid coat, full mane' }, size: { th: 'ยาว 2.5 ม.', en: 'Length 2.5 m' }, coat: { th: 'น้ำตาลทอง', en: 'Tawny gold' }, mark: { th: 'แผลเป็นเหนือตาขวา', en: 'Scar above right eye' }, signature: [0.10, 0.70, 0.70, 0.55, 0.60, 0.65, 0.80, 0.52], accuracy: 95, sightings: 22 },
  monkey:   { code: 'MK-04', pattern: { th: 'ขนสีเดียว หน้าชมพู', en: 'Solid coat, pink face' }, size: { th: 'ยาว 50 ซม.', en: 'Length 50 cm' }, coat: { th: 'เทาน้ำตาล', en: 'Grey-brown' }, mark: { th: 'หางยาวปลายขาว', en: 'Long tail, white tip' }, signature: [0.12, 0.20, 0.45, 0.70, 0.95, 0.40, 0.98, 0.30], accuracy: 91, sightings: 31 },
  penguin:  { code: 'PG-05', pattern: { th: 'ขาว-ดำ แถบดำพาดอก', en: 'Black and white, chest band' }, size: { th: 'สูง 65 ซม.', en: 'Height 65 cm' }, coat: { th: 'ดำ-ขาว', en: 'Black / white' }, mark: { th: 'จุดดำ 3 จุดบนท้อง', en: 'Three belly spots' }, signature: [0.65, 0.18, 0.15, 0.30, 0.55, 0.50, 0.10, 0.80], accuracy: 93, sightings: 18 },
  tiger:    { code: 'TG-02', pattern: { th: 'ลายทางดำบนส้ม', en: 'Black stripes on orange' }, size: { th: 'ยาว 2.7 ม.', en: 'Length 2.7 m' }, coat: { th: 'ส้มเข้ม', en: 'Deep orange' }, mark: { th: 'ลายหน้าผากรูปตัว W', en: 'W-shaped brow stripe' }, signature: [0.88, 0.72, 0.85, 0.55, 0.58, 0.63, 0.78, 0.90], accuracy: 98, sightings: 9 },
  zebra:    { code: 'ZB-03', pattern: { th: 'ลายทางขาว-ดำ', en: 'Black and white stripes' }, size: { th: 'สูง 1.4 ม.', en: 'Height 1.4 m' }, coat: { th: 'ขาว-ดำ', en: 'Black / white' }, mark: { th: 'ลายสะโพกซ้ายแยกเป็นสองแฉก', en: 'Forked stripe left hip' }, signature: [0.95, 0.60, 0.15, 0.85, 0.50, 0.70, 0.60, 0.95], accuracy: 96, sightings: 13 },
  otter:    { code: 'OT-01', pattern: { th: 'ขนสีเดียว คางขาว', en: 'Solid coat, pale chin' }, size: { th: 'ยาว 60 ซม.', en: 'Length 60 cm' }, coat: { th: 'น้ำตาลเข้ม', en: 'Dark brown' }, mark: { th: 'เล็บหน้าซ้ายสั้นกว่าปกติ', en: 'Short claw left forepaw' }, signature: [0.08, 0.15, 0.68, 0.35, 0.80, 0.42, 0.85, 0.28], accuracy: 90, sightings: 27 },
};
export const DEX_FEATURES = [ { th: 'ลวดลาย', en: 'Pattern' }, { th: 'ขนาดตัว', en: 'Body size' }, { th: 'โทนสีขน', en: 'Coat tone' }, { th: 'สัดส่วนขา', en: 'Limb ratio' }, { th: 'ท่าเดิน', en: 'Gait' }, { th: 'รูปหัว', en: 'Head shape' }, { th: 'หาง', en: 'Tail' }, { th: 'ตำหนิ', en: 'Markings' } ];

// ---------- Habitat condition monitoring (ESP32 sensors per enclosure). range = species-approved range ----------
export const SENSOR_LABELS = {
  temp:     { th: 'อุณหภูมิอากาศ', en: 'Air temperature' }, humidity: { th: 'ความชื้น', en: 'Humidity' }, shade: { th: 'พื้นที่ร่มเงา', en: 'Shade cover' },
  noise:    { th: 'ระดับเสียง', en: 'Noise level' }, waterLevel: { th: 'ระดับน้ำในบ่อ', en: 'Pool water level' }, waterTemp: { th: 'อุณหภูมิน้ำ', en: 'Water temperature' },
  ph:       { th: 'ค่า pH น้ำ', en: 'Water pH' }, chlorine: { th: 'คลอรีน', en: 'Chlorine' }, turbidity: { th: 'ความขุ่นของน้ำ', en: 'Water turbidity' },
};
export const HABITATS = [
  { id: 'savanna',   name: { th: 'โซนสะวันนา A', en: 'Savanna Zone A' },    animals: ['giraffe', 'zebra'], camera: 1, aquatic: false, sensors: [ { key: 'temp', value: 31.4, unit: '°C', range: [18, 35] }, { key: 'humidity', value: 62, unit: '%', range: [40, 75] }, { key: 'shade', value: 48, unit: '%', range: [30, 100] } ] },
  { id: 'elephant',  name: { th: 'ลานช้าง', en: 'Elephant Yard' },           animals: ['elephant'], camera: 3, aquatic: false, sensors: [ { key: 'temp', value: 32.8, unit: '°C', range: [18, 34] }, { key: 'humidity', value: 58, unit: '%', range: [40, 80] }, { key: 'waterLevel', value: 42, unit: '%', range: [50, 100] } ] },
  { id: 'predatorA', name: { th: 'โซนสัตว์ผู้ล่า A', en: 'Predator Zone A' }, animals: ['tiger'], camera: 4, aquatic: false, sensors: [ { key: 'temp', value: 29.6, unit: '°C', range: [16, 33] }, { key: 'humidity', value: 66, unit: '%', range: [40, 80] }, { key: 'noise', value: 54, unit: 'dB', range: [0, 70] } ] },
  { id: 'predatorB', name: { th: 'โซนสัตว์ผู้ล่า B', en: 'Predator Zone B' }, animals: ['lion'], camera: 5, aquatic: false, sensors: [ { key: 'temp', value: 30.1, unit: '°C', range: [16, 33] }, { key: 'humidity', value: 64, unit: '%', range: [40, 80] }, { key: 'noise', value: 73, unit: 'dB', range: [0, 70] } ] },
  { id: 'monkey',    name: { th: 'เกาะลิง', en: 'Monkey Island' },            animals: ['monkey'], camera: 6, aquatic: false, sensors: [ { key: 'temp', value: 30.5, unit: '°C', range: [18, 35] }, { key: 'humidity', value: 70, unit: '%', range: [40, 85] }, { key: 'noise', value: 68, unit: 'dB', range: [0, 70] } ] },
  { id: 'penguin',   name: { th: 'บ่อเพนกวิน', en: 'Penguin Pool' },          animals: ['penguin'], camera: 7, aquatic: true,  sensors: [ { key: 'waterTemp', value: 17.2, unit: '°C', range: [12, 20] }, { key: 'ph', value: 7.6, unit: '', range: [7.2, 8.2] }, { key: 'chlorine', value: 0.4, unit: 'ppm', range: [0.2, 0.8] }, { key: 'temp', value: 24.1, unit: '°C', range: [15, 28] } ] },
  { id: 'otter',     name: { th: 'ลำธารนาก', en: 'Otter Creek' },             animals: ['otter'], camera: 8, aquatic: true,  sensors: [ { key: 'waterTemp', value: 26.0, unit: '°C', range: [20, 28] }, { key: 'ph', value: 7.0, unit: '', range: [6.5, 8.0] }, { key: 'turbidity', value: 12, unit: 'NTU', range: [0, 25] }, { key: 'temp', value: 29.8, unit: '°C', range: [20, 32] } ] },
];

// ---------- Keeper routine tasks (scheduled checks for today) ----------
export const ROUTINE_TASKS = [
  { id: 'r1', time: '06:00', animalId: 'elephant', title: { th: 'ให้อาหารเช้าและตรวจฝ่าเท้า', en: 'Morning feed and foot check' } },
  { id: 'r2', time: '06:30', animalId: 'penguin',  title: { th: 'ตรวจคุณภาพน้ำในบ่อ (pH, อุณหภูมิ)', en: 'Pool water test (pH, temperature)' } },
  { id: 'r3', time: '08:00', animalId: 'lion',     title: { th: 'ติดตามผลตรวจของสัตวแพทย์', en: 'Vet observation follow-up' } },
  { id: 'r4', time: '09:30', animalId: 'monkey',   title: { th: 'กิจกรรมให้ลิง: กล่องหาอาหาร', en: 'Activity for monkeys: foraging puzzle box' } },
  { id: 'r5', time: '11:00', animalId: 'giraffe',  title: { th: 'ให้กิ่งไม้สดรอบสาย', en: 'Late-morning browse feeding' } },
  { id: 'r6', time: '13:00', animalId: 'otter',    title: { th: 'ตรวจการเปลี่ยนน้ำลำธาร', en: 'Creek water change check' } },
  { id: 'r7', time: '15:00', animalId: 'tiger',    title: { th: 'ตรวจคอกรอบบ่าย', en: 'Afternoon enclosure check' } },
  { id: 'r8', time: '16:30', animalId: null,       title: { th: 'นับจำนวนสัตว์รอบเย็น', en: 'Evening headcount' } },
];

// ---------- Enrichment library per animal + logged sessions with before/after behavior ----------
export const ENRICHMENT = {
  giraffe:  [ { th: 'แขวนกิ่งไม้สดที่ความสูงต่างกัน', en: 'Hang fresh browse at varying heights' }, { th: 'หมุนเวียนก้อนเกลือเลีย', en: 'Rotate mineral lick blocks' }, { th: 'กล่องอาหารแบบต้องใช้ลิ้นดึง', en: 'Tongue-pull feeder box' } ],
  elephant: [ { th: 'ตาข่ายหญ้าแขวนสูง', en: 'High-hung hay net' }, { th: 'เติมบ่อโคลนใหม่', en: 'Refresh mud wallow' }, { th: 'ท่อนไม้เจาะรูใส่อาหาร', en: 'Drilled-log puzzle feeder' } ],
  lion:     [ { th: 'ซ่อนอาหารในกล่องกระดาษ', en: 'Hide food in cardboard boxes' }, { th: 'ทาเครื่องเทศบนท่อนไม้ (กลิ่นใหม่)', en: 'Spice scent trail on logs' }, { th: 'ลูกบอลใหญ่สำหรับผลัก', en: 'Large boomer ball' }, { th: 'เปลี่ยนตำแหน่งแท่นนอน', en: 'Move resting platforms' } ],
  monkey:   [ { th: 'กล่องปริศนาหาอาหาร', en: 'Foraging puzzle box' }, { th: 'เชือกปีนเส้นใหม่', en: 'New climbing rope' }, { th: 'ซ่อนผลไม้ในขี้เลื่อย', en: 'Hide fruit in wood shavings' } ],
  penguin:  [ { th: 'ปล่อยปลาเป็นในบ่อ', en: 'Live fish release' }, { th: 'ม่านฟองอากาศใต้น้ำ', en: 'Bubble curtain in pool' }, { th: 'กระจกเงากันน้ำ', en: 'Waterproof mirror' } ],
  tiger:    [ { th: 'ก้อนน้ำแข็งเนื้อแช่แข็ง', en: 'Frozen meat ice block' }, { th: 'ท่อนไม้ลอยน้ำในบ่อ', en: 'Floating logs in pool' }, { th: 'สลับแท่นยกสูง', en: 'Rotate elevated platforms' }, { th: 'กลิ่นสัตว์ชนิดอื่นบนหิน', en: 'Novel animal scent on rocks' } ],
  zebra:    [ { th: 'โปรยอาหารกระจายทั่วคอก', en: 'Scatter feeding across the yard' }, { th: 'พื้นที่ทรายใหม่สำหรับกลิ้งตัว', en: 'Fresh sand area for rolling' }, { th: 'แปรงขัดตัวติดเสา', en: 'Post-mounted grooming brush' } ],
  otter:    [ { th: 'ก้อนน้ำแข็งใส่ปลา', en: 'Fish frozen in ice cubes' }, { th: 'กองก้อนกรวดใหม่', en: 'Fresh pebble pile' }, { th: 'ท่อ PVC ใส่อาหาร', en: 'PVC feeder tube' } ],
};
export const ENRICHMENT_LOG = [
  { id: 'e1', animalId: 'tiger',    activity: { th: 'ก้อนน้ำแข็งเนื้อแช่แข็ง', en: 'Frozen meat ice block' }, day: { th: 'เมื่อวาน', en: 'Yesterday' }, time: '14:00', before: { activity: 44, pacing: 4 }, after: { activity: 58, pacing: 2 }, response: 'positive' },
  { id: 'e2', animalId: 'lion',     activity: { th: 'ทาเครื่องเทศบนท่อนไม้', en: 'Spice scent trail on logs' }, day: { th: '3 วันก่อน', en: '3 days ago' }, time: '10:30', before: { activity: 52, pacing: 6 }, after: { activity: 50, pacing: 6 }, response: 'neutral' },
  { id: 'e3', animalId: 'elephant', activity: { th: 'ตาข่ายหญ้าแขวนสูง', en: 'High-hung hay net' }, day: { th: '2 วันก่อน', en: '2 days ago' }, time: '09:00', before: { activity: 58, pacing: 3 }, after: { activity: 66, pacing: 1 }, response: 'positive' },
  { id: 'e4', animalId: 'monkey',   activity: { th: 'ซ่อนผลไม้ในขี้เลื่อย', en: 'Hide fruit in wood shavings' }, day: { th: 'เมื่อวาน', en: 'Yesterday' }, time: '15:30', before: { activity: 86, pacing: 1 }, after: { activity: 92, pacing: 0 }, response: 'positive' },
];

// ---------- Behavior history: typical activity by hour (06:00 → 18:00) and keeper observation records ----------
export const HOURLY = {
  giraffe:  [55, 72, 78, 70, 58, 50, 46, 52, 64, 74, 76, 66, 54], elephant: [50, 66, 70, 64, 56, 48, 44, 50, 60, 68, 70, 62, 52],
  lion:     [62, 58, 44, 30, 22, 18, 18, 22, 34, 50, 64, 68, 60], monkey:   [60, 84, 92, 90, 82, 70, 66, 74, 88, 92, 86, 72, 58],
  penguin:  [52, 76, 86, 80, 70, 64, 62, 70, 84, 88, 78, 64, 50], tiger:    [60, 55, 40, 28, 20, 16, 16, 20, 32, 48, 62, 66, 58],
  zebra:    [52, 70, 76, 70, 60, 52, 48, 54, 66, 74, 74, 64, 52], otter:    [58, 86, 94, 92, 86, 78, 74, 82, 92, 94, 88, 74, 60],
};
export const OBSERVATIONS = {
  lion:     [ { daysAgo: 0, by: 'vet',    text: { th: 'ตรวจร่างกายเบื้องต้น ไม่พบบาดแผล แต่กินน้อยและเดินวนบ่อย นัดตรวจเลือดพรุ่งนี้', en: 'Physical exam: no wounds found, but low appetite and frequent pacing. Blood test scheduled tomorrow.' } }, { daysAgo: 1, by: 'keeper', text: { th: 'เหลืออาหาร 25% เดินวนช่วงที่มีกลุ่มนักเรียนเสียงดัง', en: 'Left 25% of food. Paced while a loud student group was nearby.' } }, { daysAgo: 3, by: 'keeper', text: { th: 'ปกติ กินครบ นอนกลางวันตามปกติ', en: 'Normal. Full portion eaten, usual midday rest.' } } ],
  tiger:    [ { daysAgo: 0, by: 'keeper', text: { th: 'นอนมากกว่าปกติเล็กน้อย ตอบสนองดีต่อก้อนน้ำแข็งเมื่อวาน', en: 'Resting slightly more than usual. Responded well to yesterday\'s ice block.' } }, { daysAgo: 2, by: 'keeper', text: { th: 'กิจกรรมช่วงบ่ายลดลง อากาศร้อน', en: 'Afternoon activity down, hot weather.' } } ],
  elephant: [ { daysAgo: 1, by: 'vet',    text: { th: 'ตรวจสุขภาพประจำสัปดาห์ ผลปกติ น้ำหนักคงที่', en: 'Weekly health check normal, weight stable.' } } ],
  monkey:   [ { daysAgo: 1, by: 'keeper', text: { th: 'สนใจกล่องปริศนามาก ใช้เวลา 40 นาทีจึงเปิดได้', en: 'Very engaged with puzzle box, took 40 min to open.' } } ],
  penguin:  [ { daysAgo: 0, by: 'keeper', text: { th: 'ให้อาหารเช้าครบ ว่ายน้ำปกติ', en: 'Morning feed complete, swimming normally.' } } ],
  giraffe:  [ { daysAgo: 2, by: 'keeper', text: { th: 'ชอบกิ่งไม้ที่แขวนสูง กินหมดภายใน 1 ชม.', en: 'Preferred high-hung browse, finished within 1 hour.' } } ],
  zebra:    [ { daysAgo: 4, by: 'keeper', text: { th: 'กลิ้งตัวในทรายใหม่ทันทีที่เปิดพื้นที่', en: 'Rolled in the fresh sand as soon as it was opened.' } } ],
  otter:    [ { daysAgo: 1, by: 'keeper', text: { th: 'เล่นกับก้อนน้ำแข็งใส่ปลานาน 25 นาที', en: 'Played with fish ice cubes for 25 min.' } } ],
};

// ---------- Guest "talk to the animal" sound library (template: no audio files yet). avoid = true means the call can alarm the animal ----------
export const SOUNDS = {
  giraffe:  [ { emoji: '🎵', name: { th: 'เสียงฮัม', en: 'Hum' }, meaning: { th: 'เสียงต่ำที่ยีราฟใช้ติดต่อกันตอนกลางคืน', en: 'Low night-time call giraffes use to keep in touch' } }, { emoji: '💨', name: { th: 'เสียงพ่นลม', en: 'Snort' }, meaning: { th: 'สัญญาณเตือนภัย', en: 'Alarm signal' }, avoid: true } ],
  elephant: [ { emoji: '🎺', name: { th: 'แปร๋น', en: 'Trumpet' }, meaning: { th: 'ตื่นเต้นหรือเตือนภัย', en: 'Excitement or alarm' }, avoid: true }, { emoji: '🫧', name: { th: 'เสียงครางต่ำ', en: 'Rumble' }, meaning: { th: 'ทักทายและคุยกับฝูง', en: 'Greeting and chatting with the herd' } } ],
  lion:     [ { emoji: '🦁', name: { th: 'คำราม', en: 'Roar' }, meaning: { th: 'ประกาศอาณาเขต ได้ยินไกลถึง 8 กม.', en: 'Claims territory, heard up to 8 km away' }, avoid: true }, { emoji: '😮‍💨', name: { th: 'ชัฟ (พ่นลม)', en: 'Chuff' }, meaning: { th: 'ทักทายอย่างเป็นมิตร', en: 'Friendly greeting' } }, { emoji: '🗣️', name: { th: 'เสียงกรุ๊งกริ๊ง', en: 'Grunt' }, meaning: { th: 'เรียกสมาชิกในฝูง', en: 'Calling pride members' } } ],
  monkey:   [ { emoji: '🎶', name: { th: 'เสียงคู', en: 'Coo' }, meaning: { th: 'ติดต่อกันอย่างเป็นมิตร', en: 'Friendly contact call' } }, { emoji: '👄', name: { th: 'ขยับปาก (lip-smack)', en: 'Lip-smack' }, meaning: { th: 'บอกว่าไม่เป็นภัย / ขอคืนดี', en: 'Means "I am friendly"' } }, { emoji: '⚠️', name: { th: 'เห่าเตือน', en: 'Alarm bark' }, meaning: { th: 'เตือนภัยนักล่า', en: 'Warns of a predator' }, avoid: true } ],
  penguin:  [ { emoji: '📣', name: { th: 'เสียงร้องเรียกคู่', en: 'Bray' }, meaning: { th: 'เรียกหาคู่ของตัวเอง', en: 'Calling its mate' } }, { emoji: '🔔', name: { th: 'เสียงเรียกฝูง', en: 'Contact call' }, meaning: { th: '"อยู่ไหน?" ใช้หากันในฝูง', en: '"Where are you?" used in the colony' } } ],
  tiger:    [ { emoji: '😮‍💨', name: { th: 'ชัฟ (พ่นลม)', en: 'Chuff' }, meaning: { th: 'ทักทายอย่างเป็นมิตร', en: 'Friendly greeting' } }, { emoji: '🐯', name: { th: 'คำราม', en: 'Roar' }, meaning: { th: 'ประกาศอาณาเขต', en: 'Territory call' }, avoid: true }, { emoji: '🌙', name: { th: 'เสียงครวญ', en: 'Moan' }, meaning: { th: 'เรียกหาเสือตัวอื่นระยะไกล', en: 'Long-distance call to other tigers' } } ],
  zebra:    [ { emoji: '🔊', name: { th: 'เสียงเห่า', en: 'Bark' }, meaning: { th: 'เรียกฝูง / ทักทาย', en: 'Herd contact and greeting' } }, { emoji: '💨', name: { th: 'พ่นลม', en: 'Snort' }, meaning: { th: 'เตือนภัย', en: 'Alarm' }, avoid: true } ],
  otter:    [ { emoji: '🐥', name: { th: 'เสียงจิ๊บ', en: 'Chirp' }, meaning: { th: 'ติดต่อกับครอบครัว', en: 'Keeping in touch with the family' } }, { emoji: '🎉', name: { th: 'เสียงแหลมตื่นเต้น', en: 'Squeak' }, meaning: { th: 'ตื่นเต้น / ชวนเล่น', en: 'Excited, let us play' } }, { emoji: '⚠️', name: { th: 'ขู่ฟ่อ', en: 'Hiss' }, meaning: { th: 'เตือนให้ถอยห่าง', en: 'Warning to back off' }, avoid: true } ],
};
