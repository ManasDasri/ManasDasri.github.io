'use client';

import { useEffect, useRef, useState } from 'react';
import { getWeather } from '@/lib/weather';
import { body, drawKoi, makeFish, makeStamper, swim } from './KoiPond';

// The banner: the pond's surface, seen from above, in ASCII. Ripples run on a small wave
// simulation; moving the pointer stirs the water, a click drops a stone, and a koi glides
// beneath, pushing a wake. Bengaluru's live weather sets the rain: a stray drop now and
// then when it's dry, steady drops while it rains, and wind speeds the koi up.

const CW = 6; // cell, css px
const CH = 10;
const FPS = 30;
const DAMP = 0.975;
const RAMP = " .·:-=+*#%@";
const FONT = `500 ${CH - 2}px "JetBrains Mono", monospace`;

export default function PondBanner() {
  const ref = useRef(null);
  const [weather, setWeather] = useState(null);
  // the weather is read inside the animation without restarting it
  const weatherRef = useRef(null);
  weatherRef.current = weather;

  useEffect(() => void getWeather().then(setWeather), []);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W, H, cols, rows, cur, prev, koi, colours, raf, last = 0, t = 0, nextDrop = 0, visible = true;

    const stamp = makeStamper(FONT, CW, CH);
    const readColours = () => {
      const css = getComputedStyle(document.documentElement);
      const rgb = (token) => css.getPropertyValue(`--c-${token}`).trim().split(/\s+/).map(Number);
      colours = { crest: rgb('text'), trough: rgb('mature'), calm: rgb('line') };
    };

    const setup = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CW) + 2;
      rows = Math.ceil(H / CH) + 2;
      cur = new Float32Array(cols * rows);
      prev = new Float32Array(cols * rows);
      koi = makeFish({ x: 0, w: W, h: H }, 0);
      readColours();
    };

    const drop = (x, y, strength, radius = 1) => {
      const cx = Math.round(x / CW) + 1, cy = Math.round(y / CH) + 1;
      for (let dy = -radius; dy <= radius; dy++)
        for (let dx = -radius; dx <= radius; dx++) {
          const i = (cy + dy) * cols + cx + dx;
          if (cx + dx > 0 && cx + dx < cols - 1 && cy + dy > 0 && cy + dy < rows - 1) cur[i] += strength * (1 - Math.hypot(dx, dy) / (radius + 1));
        }
    };

    const step = (dt) => {
      // the wave equation on the grid: each cell pulled toward its neighbours, then damped
      const next = prev;
      for (let y = 1; y < rows - 1; y++)
        for (let x = 1; x < cols - 1; x++) {
          const i = y * cols + x;
          next[i] = ((cur[i - 1] + cur[i + 1] + cur[i - cols] + cur[i + cols]) / 2 - next[i]) * DAMP;
        }
      prev = cur;
      cur = next;
      // rain, and the koi's wake
      t += dt;
      const w = weatherRef.current;
      if (t > nextDrop) {
        drop(Math.random() * W, Math.random() * H, w?.rain ? 8 : 6, w?.storm ? 2 : 1);
        nextDrop = t + (w?.rain ? 0.08 + 0.3 / (1 + (w.precip ?? 0)) : 1.2 + Math.random() * 2);
      }
      swim(koi, t, dt * (1 + Math.min(1, (w?.wind ?? 0) / 30)));
      const [hx, hy] = koi.spine[0];
      drop(hx, hy, -0.5);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // the koi first, faint, so it reads as under the water
      drawKoi(ctx, koi, body(koi), () => 0.55);
      for (let y = 1; y < rows - 1; y++)
        for (let x = 1; x < cols - 1; x++) {
          const v = cur[y * cols + x];
          const a = Math.min(1, Math.abs(v) / 2.6);
          if (a < 0.06) {
            // still water: a sparse, faint texture
            if ((x * 7 + y * 13) % 23 === 0) stamp(ctx, '.', colours.calm, 1, (x - 1) * CW, (y - 1) * CH);
            continue;
          }
          stamp(ctx, RAMP[Math.min(RAMP.length - 1, Math.ceil(a * (RAMP.length - 1)))], v > 0 ? colours.crest : colours.trough, 0.2 + a * 0.55, (x - 1) * CW, (y - 1) * CH);
        }
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      step(dt);
      draw();
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (still || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    setup();
    if (still) {
      for (let i = 0; i < 60; i++) step(1 / FPS);
      draw();
    }
    run();

    const header = canvas.parentElement;
    let lastStir = 0;
    const stir = (e) => {
      const r = canvas.getBoundingClientRect();
      if (e.timeStamp - lastStir < 30) return;
      lastStir = e.timeStamp;
      drop(e.clientX - r.left, e.clientY - r.top, 1.6);
    };
    const stone = (e) => {
      const r = canvas.getBoundingClientRect();
      drop(e.clientX - r.left, e.clientY - r.top, 10, 2);
    };
    const onResize = () => {
      setup();
      if (still) draw();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      run();
    });
    io.observe(canvas);
    header.addEventListener('pointermove', stir);
    header.addEventListener('pointerdown', stone);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', run);
    document.fonts?.ready.then(() => draw());
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      header.removeEventListener('pointermove', stir);
      header.removeEventListener('pointerdown', stone);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', run);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <div className="absolute top-4 right-6 sm:right-9 text-right font-mono text-[11px] leading-relaxed text-mute pointer-events-none select-none">
        {weather && (
          <p className="m-0">
            Bengaluru {Math.round(weather.temp)}°C, {weather.text}
            {weather.rain ? ' · it’s raining on the pond' : ''}
          </p>
        )}
        <p className="m-0 max-sm:hidden">move to stir · click to drop a stone</p>
      </div>
    </>
  );
}
