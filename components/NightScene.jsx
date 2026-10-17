'use client';

import { useEffect, useRef } from 'react';
import { glyph, LED_W, LED_H } from '@/lib/ledFont';
import { makePetal, stepPetal, drawPetal } from '@/lib/petals';

// The header: a night field of flowers under drifting clouds, petals blowing across
// it, and a dot-matrix clock (Bengaluru time) in the corner. It's an illustration,
// so it keeps its own night palette whatever the theme (globals.css also exempts it
// from Auto's hue drift, like photos). The still parts (sky, field, flowers) are
// painted once per size into an offscreen canvas; each frame only adds stars,
// clouds, petals and the clock on top.
const HORIZON = 0.52; // fraction of the height where the far field begins
const PETALS_PER_PX = 1 / 32; // ~40 on a laptop, ~12 on a phone

const C = {
  skyTop: '#040a1c',
  skyMid: '#0a1838',
  horizon: '#1c3366',
  farField: '#8e9cc2',
  midField: '#2a3a6a',
  nearField: '#0c1634',
  speck: 'rgba(225, 232, 250, 0.75)',
  speckDim: 'rgba(150, 165, 205, 0.6)',
  grass: 'rgba(52, 72, 130, 0.9)',
  grassDim: 'rgba(28, 42, 86, 0.9)',
  petal: '#f2e4c6',
  centre: '#d6b071',
  cloud: '30, 52, 104', // rgb, faded with alpha per puff
  cloudLight: '86, 112, 178',
  cloudShade: '8, 16, 40',
  star: '#dfe7ff',
  falling: 'rgba(236, 240, 252, 0.85)',
  clock: 'rgba(200, 212, 245, 0.38)',
};

// seeded randomness so the field looks the same after a resize
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// the hill line: a gentle rise across the width
const hillY = (x, w, h) => h * HORIZON - Math.sin((x / w) * Math.PI) * h * 0.05;

function paintStill(ctx, w, h) {
  const r = rng(7);
  const sky = ctx.createLinearGradient(0, 0, 0, h * HORIZON);
  sky.addColorStop(0, C.skyTop);
  sky.addColorStop(0.6, C.skyMid);
  sky.addColorStop(1, C.horizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // the field under the hill line: pale and dense far away, dark and grassy up close
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 8) ctx.lineTo(x, hillY(x, w, h));
  ctx.lineTo(w, h);
  ctx.closePath();
  const field = ctx.createLinearGradient(0, h * (HORIZON - 0.05), 0, h);
  field.addColorStop(0, C.farField);
  field.addColorStop(0.28, C.midField);
  field.addColorStop(0.6, C.nearField);
  field.addColorStop(1, C.nearField);
  ctx.fillStyle = field;
  ctx.fill();
  // far flowers: a haze of single specks, thinning toward the viewer
  for (let i = 0; i < w * 2.2; i++) {
    const x = r() * w, y = hillY(x, w, h) + Math.pow(r(), 2) * h * 0.2;
    ctx.fillStyle = r() < 0.55 ? C.speck : C.speckDim;
    ctx.fillRect(x, y, 1, 1);
  }
  // near grass
  for (let i = 0; i < w * 1.1; i++) {
    const x = r() * w, y = h * (HORIZON + 0.12) + r() * h * 0.5, len = 3 + ((y / h) - HORIZON) * 22;
    ctx.strokeStyle = r() < 0.5 ? C.grass : C.grassDim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 3, y - len);
    ctx.stroke();
  }
  // flowers, bigger as they get closer, back to front so near ones overlap far ones
  const flowers = Array.from({ length: Math.round(w / 8) }, () => {
    const depth = Math.pow(r(), 0.7);
    return { x: r() * w, y: h * (HORIZON + 0.1) + depth * h * 0.48, s: 1.6 + depth * 6.5, a: r() * 6 };
  }).sort((a, b) => a.y - b.y);
  for (const f of flowers) {
    ctx.fillStyle = C.petal;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + f.a;
      ctx.beginPath();
      ctx.ellipse(f.x + Math.cos(a) * f.s * 0.55, f.y + Math.sin(a) * f.s * 0.3, f.s * 0.55, f.s * 0.3, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = C.centre;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.s * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
}

// a soft puff: opaque in the middle, fading to nothing at its edge
function puff(ctx, x, y, radius, rgb, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
  g.addColorStop(0.6, `rgba(${rgb}, ${alpha * 0.85})`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// a cumulus: a flat base, piled high in the middle, shaded below and lit along the top
function paintCloud(ctx, x, base, w, r) {
  const puffs = [];
  for (let i = 0; i < 120; i++) {
    const t = r(), env = Math.pow(Math.sin(t * Math.PI), 0.7) * w * 0.3;
    const lift = Math.pow(r(), 1.4); // 0 at the base, 1 at the top of the pile
    puffs.push({ x: x + t * w, y: base - lift * env, r: w * (0.03 + r() * 0.045) * (0.6 + Math.sin(t * Math.PI) * 0.7), lift });
  }
  for (const p of puffs) puff(ctx, p.x, p.y + p.r * 0.35, p.r * 1.1, C.cloudShade, 0.5);
  for (const p of puffs) puff(ctx, p.x, p.y, p.r * 1.15, C.cloud, 0.95);
  for (const p of puffs) if (p.lift > 0.5) puff(ctx, p.x - p.r * 0.2, p.y - p.r * 0.3, p.r * 0.7, C.cloudLight, 0.22);
}

export default function NightScene() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const still = document.createElement('canvas');
    const clouds = document.createElement('canvas');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, stars = [], petals = [], pointer = null, raf = 0, last = 0, drift = 0;

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      for (const cv of [canvas, still, clouds]) {
        cv.width = w * dpr;
        cv.height = h * dpr;
        cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      paintStill(still.getContext('2d'), w, h);
      // clouds sit on the horizon at both edges, with a small one between
      const cc = clouds.getContext('2d'), r = rng(11);
      cc.clearRect(0, 0, w, h);
      paintCloud(cc, -w * 0.04, h * HORIZON + 4, Math.min(w * 0.34, 560), r);
      paintCloud(cc, w * 0.66, h * HORIZON, Math.min(w * 0.36, 600), r);
      paintCloud(cc, w * 0.42, h * HORIZON - 2, Math.min(w * 0.12, 200), r);
      // blur the finished layer once, so the puffs melt into one mass (per-puff blur is far too slow)
      const sharp = document.createElement('canvas');
      sharp.width = clouds.width;
      sharp.height = clouds.height;
      sharp.getContext('2d').drawImage(clouds, 0, 0);
      cc.save();
      cc.setTransform(1, 0, 0, 1, 0, 0);
      cc.clearRect(0, 0, clouds.width, clouds.height);
      cc.filter = `blur(${3 * dpr}px)`;
      cc.drawImage(sharp, 0, 0);
      cc.restore();
      const sr = rng(3);
      stars = Array.from({ length: Math.round((w * h) / 2400) }, () => ({ x: sr() * w, y: sr() * h * HORIZON * 0.92, r: sr() * 1.1 + 0.3, tw: sr() * 6 }));
      if (!petals.length) petals = Array.from({ length: Math.min(Math.round(w * PETALS_PER_PX), 45) }, () => makePetal(w, h));
    }

    function clock() {
      const now = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
      const small = w < 640, dot = small ? 2.5 : 4, pitch = dot * 1.6, gap = pitch;
      const width = now.length * (LED_W * pitch + gap);
      const x0 = w - width - (small ? 16 : 40), y0 = small ? 16 : h * 0.62;
      ctx.fillStyle = C.clock;
      [...now].forEach((ch, i) => {
        const g = glyph(ch);
        for (let y = 0; y < LED_H; y++)
          for (let x = 0; x < LED_W; x++)
            if (g[y][x] === '#') {
              ctx.beginPath();
              ctx.arc(x0 + i * (LED_W * pitch + gap) + x * pitch, y0 + y * pitch, dot / 2, 0, Math.PI * 2);
              ctx.fill();
            }
      });
    }

    function frame(t) {
      raf = reduce ? 0 : requestAnimationFrame(frame);
      if (document.hidden) return (last = t);
      const dt = Math.min((t - (last || t)) / 16.7, 3);
      last = t;
      ctx.drawImage(still, 0, 0, w, h);
      ctx.fillStyle = C.star;
      for (const s of stars) {
        ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t / 1400 + s.tw));
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
      ctx.globalAlpha = 1;
      // clouds drift right very slowly, wrapping around
      drift = (drift + 0.04 * dt) % w;
      ctx.drawImage(clouds, drift, 0, w, h);
      ctx.drawImage(clouds, drift - w, 0, w, h);
      for (const p of petals) {
        if (!reduce) stepPetal(p, dt, w, h, 0, pointer);
        drawPetal(ctx, p, C.falling);
      }
      clock();
    }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => (pointer = null);
    // the clock ticks even with reduced motion: redraw once a second
    const tick = reduce ? setInterval(() => frame(performance.now()), 1000) : 0;

    layout();
    frame(performance.now());
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    const host = canvas.parentElement;
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(tick);
      ro.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={ref} className="night-scene absolute inset-0 w-full h-full" aria-hidden="true" />;
}
