'use client';

import { useEffect, useRef } from 'react';

// The page background: a window on a rainy night. Out-of-focus city lights drift
// behind the glass; droplets bead on it, and every so often a heavy drop runs down,
// swallowing the droplets in its path and leaving a beaded trail. New drops keep
// landing. Dimmed behind the text column (globals.css, .rain-glass). Pauses in hidden
// tabs; reduced motion gets a still pane.
const LIGHTS = ['255 190 120', '255 150 90', '90 205 225', '255 110 170', '120 140 255'];
const RUN_EVERY_MS = 700;

// one droplet, drawn once and stamped at any size: a lens that's dark at the rim,
// clear in the middle, with a highlight where the light catches it
function dropSprite() {
  const s = document.createElement('canvas');
  s.width = s.height = 64;
  const c = s.getContext('2d');
  const body = c.createRadialGradient(28, 26, 4, 32, 32, 31);
  body.addColorStop(0, 'rgb(220 230 255 / 0.10)');
  body.addColorStop(0.75, 'rgb(170 190 230 / 0.12)');
  body.addColorStop(0.9, 'rgb(6 10 24 / 0.7)');
  body.addColorStop(1, 'rgb(8 12 28 / 0)');
  c.fillStyle = body;
  c.beginPath();
  c.arc(32, 32, 31, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgb(255 255 255 / 0.9)';
  c.beginPath();
  c.ellipse(24, 21, 6, 3.5, -0.6, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgb(255 255 255 / 0.22)';
  c.beginPath();
  c.ellipse(41, 43, 4, 2, -0.6, 0, Math.PI * 2);
  c.fill();
  return s;
}

export default function RainGlass() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const bokeh = document.createElement('canvas');
    const beads = document.createElement('canvas');
    const sprite = dropSprite();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, drops = [], runners = [], dirty = true, raf = 0, last = 0, nextRun = 0;

    const newDrop = (x = Math.random() * w, y = Math.random() * h, r = Math.random() < 0.7 ? 1.5 + Math.random() * 2.5 : 4 + Math.random() * 5) => ({ x, y, r });

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      for (const c of [canvas, bokeh, beads]) {
        c.width = w * dpr;
        c.height = h * dpr;
        c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      // the city behind the glass: soft discs of light, blurred once
      const b = bokeh.getContext('2d');
      b.clearRect(0, 0, w, h);
      b.filter = 'blur(14px)';
      for (let i = 0; i < Math.round((w * h) / 22000); i++) {
        const c = LIGHTS[(Math.random() * LIGHTS.length) | 0], r = 16 + Math.random() * 64;
        b.fillStyle = `rgb(${c} / ${0.18 + Math.random() * 0.3})`;
        b.beginPath();
        b.arc(Math.random() * w, h * (0.25 + Math.random() * 0.8), r, 0, Math.PI * 2);
        b.fill();
      }
      b.filter = 'none';
      drops = Array.from({ length: Math.round((w * h) / 1300) }, () => newDrop());
      dirty = true;
    }

    const stamp = (c, d) => c.drawImage(sprite, d.x - d.r, d.y - d.r, d.r * 2, d.r * 2);

    function step(dt, t) {
      // a heavy drop breaks loose somewhere and starts to run
      if (t >= nextRun) {
        nextRun = t + RUN_EVERY_MS * (0.5 + Math.random());
        runners.push({ x: Math.random() * w, y: Math.random() * h * 0.6, r: 6 + Math.random() * 4, vy: 0.4, drift: 0 });
      }
      for (const run of runners) {
        run.vy = Math.min(run.vy + 0.05 * dt, 2.2 + run.r * 0.25);
        run.y += run.vy * dt;
        run.drift += (Math.random() - 0.5) * 0.3;
        run.x += run.drift * 0.15 * dt;
        // swallow the droplets it runs into
        const before = drops.length;
        drops = drops.filter((d) => {
          const hit = Math.hypot(d.x - run.x, d.y - run.y) < run.r + d.r;
          if (hit) run.r = Math.min(13, run.r + d.r * 0.08);
          return !hit;
        });
        // and leave a beaded trail behind
        if (Math.random() < 0.18 * dt) drops.push(newDrop(run.x + (Math.random() - 0.5) * 2, run.y - run.r * 1.5, 1 + Math.random() * 1.8));
        if (drops.length !== before || Math.random() < 0.18 * dt) dirty = true;
      }
      runners = runners.filter((run) => run.y - run.r < h);
      // new rain keeps landing on the glass
      if (Math.random() < 0.6 * dt) {
        drops.push(newDrop());
        dirty = true;
      }
      if (drops.length > (w * h) / 1100) drops.shift();
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      // the lights sway a little, like a city seen through moving water
      ctx.drawImage(bokeh, Math.sin(t / 9000) * 12, Math.cos(t / 11000) * 8, w, h);
      if (dirty) {
        const b = beads.getContext('2d');
        b.clearRect(0, 0, w, h);
        for (const d of drops) stamp(b, d);
        dirty = false;
      }
      ctx.drawImage(beads, 0, 0, w, h);
      for (const run of runners) stamp(ctx, run);
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return (last = t);
      const dt = Math.min((t - (last || t)) / 16.7, 3);
      last = t;
      step(dt, t);
      draw(t);
    }

    layout();
    window.addEventListener('resize', layout);
    if (reduce) draw(0);
    else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', layout);
    };
  }, []);

  return <canvas ref={ref} className="rain-glass" aria-hidden="true" />;
}
