'use client';

import { useEffect, useRef } from 'react';
import { cssColor } from '@/lib/themes';

// The page background: seigaiha, the overlapping-wave pattern of Japanese textiles,
// in faint indigo. A slow tide of light rolls across it, and the pattern drifts at a
// third of the scroll speed. The pattern is drawn once; each frame only paints the
// tide and keeps the part that falls on the pattern's lines. Dimmed behind the text
// column (globals.css, .seigaiha).
const R = 26; // radius of one wave scale, px
const RINGS = 4; // concentric arcs per scale
const TIDE_MS = 14000; // one tide across the page

// one period of the pattern: scales in rows R/2 apart, alternate rows shifted by R.
// Each scale paints its fill first, so it covers the lower half of the row above:
// that overlap is what makes the waves.
function paintPattern(ctx, cols, rows, fill, line) {
  ctx.lineWidth = 1.2;
  for (let row = -2; row < rows + 2; row++)
    for (let col = -1; col < cols + 2; col++) {
      const x = col * 2 * R + (row % 2 ? R : 0), y = row * (R / 2);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y, R, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = line;
      for (let k = 0; k < RINGS; k++) {
        ctx.beginPath();
        ctx.arc(x, y, R - k * (R / RINGS) - 0.6, Math.PI, 0);
        ctx.stroke();
      }
    }
}

export default function Seigaiha() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const base = document.createElement('canvas'); // the pattern, dim
    const lines = document.createElement('canvas'); // the pattern's lines only, for masking light
    const light = document.createElement('canvas');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, raf = 0;

    function layout() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      // the pattern repeats every R px vertically, so paint one extra period to slide through
      const ph = h + R * 2;
      for (const [cv, height] of [[canvas, h], [base, ph], [lines, ph], [light, h]]) {
        cv.width = w * dpr;
        cv.height = height * dpr;
        cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      const cols = Math.ceil(w / (2 * R)), rows = Math.ceil(ph / (R / 2));
      paintPattern(base.getContext('2d'), cols, rows, cssColor('ink'), 'rgb(64 88 150 / 0.32)');
      // the mask: the same lines, with each scale hiding the ones it overlaps
      const lc = lines.getContext('2d');
      for (let row = -2; row < rows + 2; row++)
        for (let col = -1; col < cols + 2; col++) {
          const x = col * 2 * R + (row % 2 ? R : 0), y = row * (R / 2);
          lc.globalCompositeOperation = 'destination-out';
          lc.beginPath();
          lc.arc(x, y, R, Math.PI, 0);
          lc.fill();
          lc.globalCompositeOperation = 'source-over';
          lc.strokeStyle = '#fff';
          lc.lineWidth = 1.6;
          for (let k = 0; k < RINGS; k++) {
            lc.beginPath();
            lc.arc(x, y, R - k * (R / RINGS) - 0.6, Math.PI, 0);
            lc.stroke();
          }
        }
    }

    function draw(t) {
      const shift = (window.scrollY / 3) % R; // drift with the scroll, wrapping each period
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(base, 0, shift * dpr, w * dpr, h * dpr, 0, 0, w, h);
      if (reduce) return;

      // light: a diagonal tide
      const l = light.getContext('2d');
      l.globalCompositeOperation = 'source-over';
      l.clearRect(0, 0, w, h);
      const p = ((t % TIDE_MS) / TIDE_MS) * (w + h) * 1.4 - h * 0.7;
      const tide = l.createLinearGradient(p - 260, 0, p + 260, h * 0.6);
      tide.addColorStop(0, 'rgb(150 180 255 / 0)');
      tide.addColorStop(0.5, 'rgb(150 180 255 / 0.55)');
      tide.addColorStop(1, 'rgb(150 180 255 / 0)');
      l.fillStyle = tide;
      l.fillRect(0, 0, w, h);
      // keep only the light that lands on the pattern's visible lines
      l.globalCompositeOperation = 'destination-in';
      l.drawImage(lines, 0, shift * dpr, w * dpr, h * dpr, 0, 0, w, h);
      ctx.drawImage(light, 0, 0, w, h);
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (!document.hidden) draw(t);
    }

    const onTheme = () => layout();

    layout();
    window.addEventListener('resize', layout);
    window.addEventListener('theme-change', onTheme);
    if (reduce) {
      draw(0);
      const still = () => draw(0);
      window.addEventListener('scroll', still, { passive: true });
      return () => {
        window.removeEventListener('resize', layout);
        window.removeEventListener('theme-change', onTheme);
        window.removeEventListener('scroll', still);
      };
    }
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', layout);
      window.removeEventListener('theme-change', onTheme);
    };
  }, []);

  return <canvas ref={ref} className="seigaiha" aria-hidden="true" />;
}
