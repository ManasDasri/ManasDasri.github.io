'use client';

import { useEffect, useRef } from 'react';
import { motionPaused, noise, whenIdle } from './KoiPond';

// The homepage's background: a halftone dot field in the margins and across the top of the
// header, where it fades out before the name. Each dot's size follows slow noise, so the field breathes like a print shifting
// under a lens, and dots swell around the pointer. Only the margins are drawn, fading out
// toward the content column. Still when motion is reduced or paused from the dock.

const GAP = 12; // grid spacing, css px
const R = 5.2; // the largest dot's radius
const SIZES = 12; // dot sizes, pre-drawn
const FPS = 24;

export default function Halftone() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let W, H, dpr, gutters, sprites, raf, last = 0, t = Math.random() * 100, ready = false;
    let still = motionPaused();
    let pointer = null;

    // one small canvas per dot size, so a frame is just drawImage calls
    const makeSprites = () => {
      const css = getComputedStyle(document.documentElement).getPropertyValue('--c-text').trim().split(/\s+/).map(Number);
      const rgb = css.length === 3 ? css : [236, 228, 214];
      sprites = Array.from({ length: SIZES }, (_, i) => {
        const r = (R * (i + 1)) / SIZES;
        const c = document.createElement('canvas');
        c.width = c.height = Math.ceil(R * 2 * dpr) + 2;
        const x = c.getContext('2d');
        x.fillStyle = `rgb(${rgb.join(' ')})`;
        x.beginPath();
        x.arc(c.width / 2, c.height / 2, r * dpr, 0, Math.PI * 2);
        x.fill();
        return c;
      });
    };

    const setup = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const col = document.getElementById('main')?.getBoundingClientRect();
      const left = col ? col.left : W / 2, right = col ? col.right : W / 2;
      gutters = [
        { x: 0, w: left, edge: left },
        { x: right, w: W - right, edge: right },
      ].filter((g) => g.w >= 48);
      makeSprites();
    };

    // 0 at the column's edge, 1 well into the margin
    const fade = (x, g) => Math.min(1, Math.abs(x - g.edge) / Math.min(160, g.w * 0.6)) ** 1.4;

    // where to draw: the margins, fading toward the column, and the header above the name,
    // fading out before it (the header scrolls, so it's measured each frame)
    const zones = () => {
      const z = gutters.map((g) => ({ x0: g.x, x1: g.x + g.w, y0: 0, y1: H, f: (x) => fade(x, g) }));
      const hdr = document.getElementById('top')?.getBoundingClientRect();
      if (hdr && hdr.bottom > 0 && hdr.top < H)
        z.push({ x0: hdr.left, x1: hdr.right, y0: Math.max(0, hdr.top), y1: Math.min(H, hdr.bottom), f: (x, y) => 0.85 * Math.max(0, 1 - (y - hdr.top) / (hdr.height * 0.62)) ** 1.3 });
      return z;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const side = Math.ceil(R * 2 * dpr) + 2;
      // one grid across every zone, so the header's dots line up with the margins'
      const snap = (v) => Math.ceil((v - GAP / 2) / GAP) * GAP + GAP / 2;
      for (const z of zones())
        for (let y = snap(z.y0); y < z.y1; y += GAP)
          for (let x = snap(z.x0); x < z.x1; x += GAP) {
            const f = z.f(x, y);
            if (f < 0.04) continue;
            // two layers of noise: broad tone that drifts, and a finer one that moves faster
            let v = noise(x / 260 + t * 0.03, y / 260 - t * 0.02) * 0.75 + noise(x / 70 - t * 0.08, y / 70 + t * 0.05) * 0.4 - 0.18;
            if (pointer) {
              const d = Math.hypot(x - pointer.x, y - pointer.y);
              if (d < 150) v += (1 - d / 150) ** 2 * 0.8;
            }
            v *= f;
            const i = Math.min(SIZES - 1, Math.floor(v * SIZES));
            if (i < 1) continue;
            ctx.globalAlpha = 0.16 + 0.34 * Math.min(1, v);
            ctx.drawImage(sprites[i], (x - R) * dpr - 1, (y - R) * dpr - 1, side, side);
          }
      ctx.globalAlpha = 1;
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      t += Math.min(0.1, (now - last) / 1000);
      last = now;
      draw();
    };
    const run = () => {
      cancelAnimationFrame(raf);
      draw();
      if (!ready || still || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    setup();
    draw();
    const cancelIdle = whenIdle(() => {
      ready = true;
      run();
    });

    let lastMove = 0;
    const move = (e) => {
      pointer = { x: e.clientX, y: e.clientY };
      // when still, the swell follows the pointer without animating anything else
      if (still && e.timeStamp - lastMove > 40) {
        lastMove = e.timeStamp;
        draw();
      }
    };
    const leave = () => {
      pointer = null;
      if (still) draw();
    };
    const onResize = () => {
      setup();
      draw();
    };
    const onMotion = () => {
      still = motionPaused();
      run();
    };
    const onScroll = () => still && draw();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', move);
    document.addEventListener('pointerleave', leave);
    window.addEventListener('resize', onResize);
    window.addEventListener('theme-change', onResize);
    window.addEventListener('motion-change', onMotion);
    document.addEventListener('visibilitychange', run);
    return () => {
      cancelIdle();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('theme-change', onResize);
      window.removeEventListener('motion-change', onMotion);
      document.removeEventListener('visibilitychange', run);
    };
  }, []);

  return <canvas ref={ref} className="pond fixed inset-0 w-screen h-screen pointer-events-none" aria-hidden="true" />;
}
