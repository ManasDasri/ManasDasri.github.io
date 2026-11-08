'use client';

import { useEffect, useRef } from 'react';
import { motionPaused, whenIdle } from './KoiPond';

// The homepage's margins: a deep starfield around the black hole in the header. Stars sit at
// different depths, so they drift and parallax at different speeds as the page scrolls, and
// twinkle. While the header is on screen, stars near the black hole are pushed outward and
// brightened, the way a lens bends light round it. Now and then a shooting star crosses in
// the accent colour. Only the margins are drawn, fading toward the content column.

const DENSITY = 2600; // css px² per star
const FPS = 30;
const LENS_R = 420; // how far the black hole's pull reaches, px
const EINSTEIN = 70; // the ring's radius: stars inside it are pushed out past it

export default function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let W, H, dpr, gutters, stars, star = [236, 236, 230], accent = [232, 54, 62];
    let raf, last = 0, t = 0, ready = false, still = motionPaused();
    let shot = null, nextShot = 3;

    const rgb = (token, fallback) => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(`--c-${token}`).trim().split(/\s+/).map(Number);
      return v.length === 3 ? v : fallback;
    };

    const setup = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const col = document.getElementById('main')?.getBoundingClientRect();
      const left = col ? col.left : W / 2, right = col ? col.right : W / 2;
      gutters = [
        { x: 0, w: left, edge: left },
        { x: right, w: W - right, edge: right },
      ].filter((g) => g.w >= 48);
      // stars live in a tile one screen tall, repeated as the page scrolls
      stars = gutters.flatMap((g) =>
        Array.from({ length: Math.round((g.w * H) / DENSITY) }, () => {
          const z = Math.random() ** 1.8; // most stars far and faint, a few near and bright
          return { g, x: g.x + Math.random() * g.w, y: Math.random() * H, z, ph: Math.random() * 6.28, tw: 0.6 + Math.random() * 2.2 };
        })
      );
      star = rgb('text', star);
      accent = rgb('signal', accent);
    };

    // 0 at the column's edge, 1 well into the margin
    const fade = (x, g) => Math.min(1, Math.abs(x - g.edge) / Math.min(140, g.w * 0.6)) ** 1.3;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const sy = window.scrollY;
      // the black hole: left of centre in the header's video, while the header is in view
      const hdr = document.getElementById('top')?.getBoundingClientRect();
      const bh = hdr && hdr.bottom > 0 ? { x: hdr.left + hdr.width * 0.32, y: hdr.top + hdr.height * 0.32 } : null;
      for (const s of stars) {
        // nearer stars scroll faster (parallax) and drift a little faster
        let x = s.x + Math.sin(t * 0.05 + s.ph) * 4 * s.z;
        let y = (((s.y - sy * (0.08 + 0.35 * s.z) - t * (1 + 5 * s.z)) % H) + H) % H;
        let bright = 0.25 + 0.75 * s.z;
        if (bh) {
          const dx = x - bh.x, dy = y - bh.y, r = Math.hypot(dx, dy);
          if (r < LENS_R && r > 1) {
            const k = 1 - r / LENS_R;
            const push = ((EINSTEIN * EINSTEIN) / r) * k;
            x += (dx / r) * push;
            y += (dy / r) * push;
            bright *= 1 + 0.9 * k;
          }
        }
        const f = fade(x, s.g);
        if (f < 0.03 || x < s.g.x || x > s.g.x + s.g.w) continue;
        const a = Math.min(1, bright * (0.7 + 0.3 * Math.sin(t * s.tw + s.ph))) * f;
        const size = s.z > 0.75 ? 2 : s.z > 0.35 ? 1.5 : 1;
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgb(${star.join(' ')})`;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        // the brightest few get a soft cross of light
        if (s.z > 0.92) {
          ctx.globalAlpha = a * 0.35;
          ctx.fillRect(x - 3, y - 0.5, 6, 1);
          ctx.fillRect(x - 0.5, y - 3, 1, 6);
        }
      }
      // a shooting star: a short bright streak with a fading tail, in the accent colour
      if (shot) {
        const p = (t - shot.t0) / shot.dur;
        if (p >= 1) shot = null;
        else {
          const hx = shot.x + shot.vx * p, hy = shot.y + shot.vy * p;
          const n = 18;
          for (let i = 0; i < n; i++) {
            const q = i / n;
            const x = hx - shot.vx * 0.18 * q, y = hy - shot.vy * 0.18 * q;
            const f = fade(x, shot.g);
            ctx.globalAlpha = (1 - q) * Math.sin(Math.PI * p) * f;
            ctx.fillStyle = `rgb(${(i ? accent : star).join(' ')})`;
            ctx.fillRect(x - 1, y - 1, i ? 1.5 : 2.5, i ? 1.5 : 2.5);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      if (!shot && t > nextShot && gutters.length) {
        const g = gutters[Math.floor(Math.random() * gutters.length)];
        const dir = g.edge > g.x + g.w / 2 ? -1 : 1; // head away from the column
        shot = { g, t0: t, dur: 0.9, x: g.x + g.w * (dir > 0 ? 0.25 : 0.75), y: Math.random() * H * 0.6, vx: dir * -g.w * 0.5, vy: H * 0.18 };
        nextShot = t + 5 + Math.random() * 7;
      }
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
    const onScroll = () => still && draw();
    const onResize = () => {
      setup();
      draw();
    };
    const onMotion = () => {
      still = motionPaused();
      run();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    // a new accent recolours the stars where they are; the field isn't scattered again
    const recolour = () => {
      star = rgb('text', star);
      accent = rgb('signal', accent);
      draw();
    };
    window.addEventListener('theme-change', recolour);
    window.addEventListener('motion-change', onMotion);
    document.addEventListener('visibilitychange', run);
    return () => {
      cancelIdle();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('theme-change', recolour);
      window.removeEventListener('motion-change', onMotion);
      document.removeEventListener('visibilitychange', run);
    };
  }, []);

  return <canvas ref={ref} className="pond fixed inset-0 w-screen h-screen pointer-events-none" aria-hidden="true" />;
}
