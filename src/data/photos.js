// Real species photos (Wikimedia Commons, free licences — see credits.json and the About page).
import giraffe from '../assets/animals/giraffe.jpg';
import elephant from '../assets/animals/elephant.jpg';
import lion from '../assets/animals/lion.jpg';
import monkey from '../assets/animals/monkey.jpg';
import penguin from '../assets/animals/penguin.jpg';
import tiger from '../assets/animals/tiger.jpg';
import zebra from '../assets/animals/zebra.jpg';
import otter from '../assets/animals/otter.jpg';
import CREDITS from '../assets/animals/credits.json';

export const PHOTOS = { giraffe, elephant, lion, monkey, penguin, tiger, zebra, otter };
// width / height of each file, used to map bounding boxes onto the 16:9 camera feed
export const PHOTO_ASPECT = { giraffe: 1107 / 1400, elephant: 1400 / 933, lion: 1400 / 934, monkey: 1, penguin: 933 / 1400, tiger: 1400 / 1050, zebra: 1400 / 933, otter: 1400 / 933 };
// where to anchor the crop when a photo is used as a card header (object-position)
export const PHOTO_FOCUS = { giraffe: '30% 12%', elephant: '50% 40%', lion: '50% 45%', monkey: '50% 35%', penguin: '45% 22%', tiger: '50% 45%', zebra: '50% 45%', otter: '50% 45%' };
export { CREDITS };

// Helpers that also work for animals / cameras added by the user (photo = data URL stored in localStorage)
const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCEBF7"/><stop offset="1" stop-color="#B9D6EE"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><text x="200" y="165" font-size="90" text-anchor="middle">🐾</text></svg>');
export const photoOf = a => (a && (a.photo || PHOTOS[a.id])) || PLACEHOLDER;
export const focusOf = a => (a && PHOTO_FOCUS[a.id]) || '50% 40%';
// cameras: photo is either a key into PHOTOS or a data URL
export const camSrc = cam => PHOTOS[cam.photo] || cam.photo || cam.snapshot || PLACEHOLDER;
export const camAspect = cam => cam.aspect || PHOTO_ASPECT[cam.photo] || 4 / 3;
// Resize an uploaded image file to a small JPEG data URL so it fits in localStorage
export const fileToDataUrl = (file, max = 1000) => new Promise((res, rej) => {
  const img = new Image(); const url = URL.createObjectURL(file);
  img.onload = () => { const s = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res({ dataUrl: c.toDataURL('image/jpeg', 0.8), aspect: img.width / img.height }); };
  img.onerror = rej; img.src = url;
});
