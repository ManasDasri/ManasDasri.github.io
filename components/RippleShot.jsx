'use client';

import { useEffect, useRef } from 'react';
import { BAYER } from './KoiPond';

// A project's picture, printed like the pond: at rest the screenshot is dithered to a few
// tones of the page's palette. Under the pointer it opens like a ripple from where the pointer
// came in, a ring spreading across the card with ASCII riding its front in the accent colour,
// and the screenshot in full colour behind it; when the pointer leaves the ring closes again
// toward where it left. On touch screens, or with reduced motion, the plain screenshot shows.

const P = 2; // css px per dither pixel
const CW = 5, CH = 8; // ASCII cells along the ring's front
const BAND = 26; // how wide the front is, css px
const RAMP = ' .:-=+*#%8';
const OPEN_MS = 750, CLOSE_MS = 600;

const rgb = (token) => getComputedStyle(document.documentElement).getPropertyValue(`--c-${token}`).trim().split(/\s+/).map(Number);

export default function RippleShot({ children }) {
  const ref = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const frame = ref.current, canvas = canvasRef.current;
    const card = frame.closest('a') ?? frame;
    if (!matchMedia('(hover: hover)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const img = frame.querySelector('img');
    const ctx = canvas.getContext('2d');
    const print = document.createElement('canvas');
    let W, H, lum, gw, gh, raf, r = 0, from = 0, to = 0, began = 0, dur = 1, ox = 0, oy = 0, ready = false;

    // the dithered print, made once from the screenshot (or, for the GitHub tile, not at all)
    const setup = () => {
      const box = frame.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = box.width;
      H = box.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gw = Math.ceil(W / P);
      gh = Math.ceil(H / P);
      print.width = gw;
      print.height = gh;
      const pctx = print.getContext('2d', { willReadFrequently: true });
      // object-fit: cover, anchored to the top, as the img itself is
      const s = Math.max(gw / img.naturalWidth, gh / img.naturalHeight);
      pctx.drawImage(img, (gw - img.naturalWidth * s) / 2, 0, img.naturalWidth * s, img.naturalHeight * s);
      const data = pctx.getImageData(0, 0, gw, gh);
      const d = data.data;
      lum = new Float32Array(gw * gh);
      const tones = [rgb('ink'), rgb('line'), rgb('old'), rgb('mute'), rgb('text')];
      let mean = 0;
      for (let i = 0; i < gw * gh; i++) mean += (0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]) / 255 / (gw * gh);
      for (let i = 0; i < gw * gh; i++) {
        let l = (0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]) / 255;
        if (mean > 0.5) l = 1 - l; // a light page is printed as a negative, so it stays dark like the rest
        lum[i] = l;
        const x = i % gw, y = (i / gw) | 0;
        const k = Math.min(tones.length - 1, Math.floor(l * (tones.length - 1) + BAYER[(y & 3) * 4 + (x & 3)]));
        d.set(tones[k], i * 4);
        d[i * 4 + 3] = 255;
      }
      pctx.putImageData(data, 0, 0);
      ready = true;
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(print, 0, 0, gw * P, gh * P);
      if (r <= 0) return;
      // open a hole the size of the ripple, so the real screenshot shows through
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(ox, oy, Math.max(0, r - BAND * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      // the front: the screenshot as ASCII, brightest at the crest
      const sig = rgb('signal'), ink = rgb('ink');
      ctx.font = `700 ${CH}px "Space Mono", monospace`;
      ctx.textBaseline = 'top';
      const x0 = Math.max(0, Math.floor((ox - r - BAND) / CW)), x1 = Math.ceil((ox + r + BAND) / CW);
      const y0 = Math.max(0, Math.floor((oy - r - BAND) / CH)), y1 = Math.ceil((oy + r + BAND) / CH);
      for (let cy = y0; cy <= y1 && cy * CH < H; cy++) {
        for (let cx = x0; cx <= x1 && cx * CW < W; cx++) {
          const x = cx * CW + CW / 2, y = cy * CH + CH / 2;
          const dd = Math.hypot(x - ox, y - oy) - r;
          if (dd < -BAND * 0.5 || dd > BAND * 0.5) continue;
          const crest = 1 - Math.abs(dd) / (BAND * 0.5);
          const l = lum[Math.min(gh - 1, (y / P) | 0) * gw + Math.min(gw - 1, (x / P) | 0)];
          ctx.fillStyle = `rgb(${ink.join(' ')})`;
          ctx.fillRect(cx * CW, cy * CH, CW, CH);
          ctx.fillStyle = `rgb(${sig.join(' ')} / ${0.35 + 0.65 * crest})`;
          ctx.fillText(RAMP[Math.min(RAMP.length - 1, 1 + Math.floor((l * 0.7 + crest * 0.4) * (RAMP.length - 1)))], cx * CW, cy * CH);
        }
      }
    };

    const ease = (k) => 1 - (1 - k) ** 3;
    const tick = (now) => {
      const k = Math.min(1, (now - began) / dur);
      r = from + (to - from) * ease(k);
      draw();
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    const go = (target, ms, e) => {
      if (!ready) return;
      const box = frame.getBoundingClientRect();
      if (e?.clientX != null) {
        ox = Math.max(0, Math.min(W, e.clientX - box.left));
        oy = Math.max(0, Math.min(H, e.clientY - box.top));
      } else if (target > 0) (ox = W / 2), (oy = H / 2);
      // far enough to reach the furthest corner, front and all
      const far = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => Math.hypot(x - ox, y - oy))) + BAND;
      from = r;
      to = target ? far : 0;
      dur = ms;
      began = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const enter = (e) => go(1, OPEN_MS, e);
    const leave = (e) => go(0, CLOSE_MS, e);

    const load = () => (img.complete && img.naturalWidth ? setup() : img.addEventListener('load', setup, { once: true }));
    if (img) {
      canvas.hidden = false;
      load();
      card.addEventListener('pointerenter', enter);
      card.addEventListener('pointerleave', leave);
      card.addEventListener('focus', enter);
      card.addEventListener('blur', leave);
    }
    const onResize = () => ready && setup();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointerleave', leave);
      card.removeEventListener('focus', enter);
      card.removeEventListener('blur', leave);
    };
  }, []);

  return (
    <span ref={ref} className="shot">
      {children}
      <canvas ref={canvasRef} hidden aria-hidden="true" />
    </span>
  );
}
