# VisionEx – AI Zoo Animal Welfare Dashboard

School innovation project, Bangkok Christian College.

**Live:** https://bccvisionex.vercel.app · **Code:** https://github.com/kantanutthien-collab/visionex

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build     # output in dist/
npm run preview
```

## Deploy (GitHub → Vercel)

```bash
git init
git add .
git commit -m "VisionEx dashboard"
git branch -M main
git remote add origin https://github.com/kantanutthien-collab/visionex.git
git push -u origin main
```

Then on vercel.com: **Add New Project → Import** the GitHub repo. Vercel detects Vite automatically
(build command `npm run build`, output `dist`). No environment variables are needed.

## Real camera (Raspberry Pi 5)

The `pi/` folder is the service that runs on the Pi: camera → YOLOv8 detection → behaviour →
JSON API + video stream. Setup, toy-animal model training, and auto-start are in [pi/README.md](pi/README.md).
In the dashboard open **Add / Edit Animals → Connect Raspberry Pi**, enter `http://<pi-ip>:8000`, press Connect.
When connected, Live Cameras shows the real feed with real boxes, the behaviour log comes from real detections,
new animals the camera sees are added automatically, and the animals' 7-day statistics come from the Pi. If the Pi is unreachable the dashboard uses demo data.

## Roles (switch in the top bar)

- **Worker** (keepers, green top bar): Home shows "My shift today" (tasks done, open alerts, animals needing care) and the
  camera wall; tabs are Home, Live Cameras, Animal ID Cards, Alerts, Health & Stress, Enclosure Conditions, Activity Ideas,
  To-do List, How It Works. No editing and no Simulate button.
- **Admin** (navy/purple top bar): Home shows the "Admin panel" (animals, cameras, Pi, AI key, days recorded, edit
  shortcuts, download all records). Adds Trends & History, Daily Reports, Who Entered Today and **Add / Edit Animals**
  (animals, cameras, Raspberry Pi link, Claude API key), plus an Edit button on the enlarged camera view.
- **Visitor screen** (button in the top bar): a display for zoo guests. First a "which animal would you like to visit?"
  page, then one page per animal with Home button, live camera, health in plain words, and a "Talk to the animal"
  sound panel (template: labelled sound buttons with meanings, no audio files yet). "Back to dashboard" returns.

## Daily record + AI analysis

Every day the numbers for each animal (eating, drinking, sleep & rest, playing time, activity, pacing, health) are
written to a daily record in the browser (`visionex-record`). Trends & History shows the record table with a CSV
download, a bar chart per measure against the animal's 7-day usual, and **"What do these numbers mean?"**: an admin can
enter a Claude API key (stored only on that device) and the page asks Claude (`claude-opus-5-5` via the official SDK)
for a plain-language explanation; without a key, built-in rules give the same kind of summary.

Home is a camera wall: one box per animal with its camera frame and a status colour (green normal, yellow almost,
red danger). Tap a box to open that camera.

## Admin layout: 3 main tabs, sub-tabs inside

| Main tab | Sub-tabs |
|---|---|
| **Animals** | Home (needs-you-now list + animal cards) · Live Cameras · Animal ID Cards · Trends & History · Animal Details (tap an animal) |
| **Care** | Alerts · Health & Stress · Enclosure Conditions · Activity Ideas |
| **Work** | To-do List · Daily Reports · Add / Edit Animals (incl. Connect Raspberry Pi, Load demo zoo) · Who Entered Today · How It Works |

On phones the three main tabs are a bottom bar; the sub-tabs scroll horizontally under the header.

The app starts **empty**: no animals, cameras or tasks. Animals appear automatically when the Raspberry Pi camera
detects them (a crop of the camera frame becomes the animal's photo), or you add them by hand on Add / Edit Animals.
**Load demo zoo** on that page adds 8 sample animals for presentations; **Remove all** clears everything. Edits (animals, cameras, tasks, notes, enrichment log,
language, mode) persist in the browser's localStorage. "Reset to defaults" is on the Add / Edit Animals page.

## Structure

- `src/data/mock.js` — all mock data (animals, alerts, cameras, habitats, tasks, enrichment, history)
- `src/data/photos.js` — real animal photos (Wikimedia Commons, see `src/assets/animals/credits.json`)
- `src/i18n.js` — Thai / English strings (`T`, `GUEST`, `ADMIN`)
- `src/lib/analysis.js` — trends, early warnings, health score, Dex matching, history generation
- `src/lib/tasks.js` — task list builder
- `src/components/CamFeed.jsx` — camera feed with bounding boxes mapped onto the photo + camera picker
- `src/App.jsx` — shell (modes, sidebar groups, state, simulate, scan, pacing detector)
- `src/pages/*` — one file per page

Stack: React 18 + Vite + Tailwind + Recharts + lucide-react.
