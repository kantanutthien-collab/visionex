import React, { useEffect, useRef, useState } from 'react';
import { photoOf, focusOf, PHOTO_ASPECT } from '../data/photos.js';

// Animal photo that never slices the animal: if the photo is much taller than its box (e.g. a portrait
// giraffe in a wide card) it is shown whole on a blurred copy of itself; otherwise it fills the box.
export default function Photo({ a, className = '', alt = '', ...rest }) {
  const ref = useRef(null);
  const [box, setBox] = useState(null);
  useEffect(() => {
    const el = ref.current; if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setBox(e.contentRect.width / Math.max(1, e.contentRect.height)));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const src = photoOf(a), ar = (a && (a.aspect || PHOTO_ASPECT[a.id])) || 1.5;
  const letterbox = box ? ar / box < 0.6 : false;
  return (
    <div ref={ref} className={`relative overflow-hidden bg-[#DCEBF7] ${className}`} {...rest}>
      {letterbox && <img src={src} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-70" style={{ objectPosition: focusOf(a) }} />}
      <img src={src} alt={alt} className={`absolute inset-0 w-full h-full ${letterbox ? 'object-contain' : 'object-cover'}`} style={{ objectPosition: letterbox ? '50% 50%' : focusOf(a) }} />
    </div>
  );
}
