'use client';

import { useEffect, useRef } from 'react';
import { glyph, LED_W, LED_H } from '@/lib/ledFont';

// The night over Hiroshige's "Moon over Takanawa": faint stars twinkling in the
// print's dark sky, a soft halo breathing around its moon, and a dot-matrix clock
// (Bengaluru time). Positions are fractions of the canvas width, because the print
// is scaled to the header's width and pinned to its top. Pauses in hidden tabs;
// reduced motion gets still stars and the clock.
const MOON = { x: 0.285, y: 0.056, r: 0.026 };
const SKY_BOTTOM = 0.195; // the horizon, where the bay begins
const TITLE = { x: 0.94, y: 0.2 }; // the red title cartouche, top right: no stars on it
const CREAM = '246 236 210';

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function PrintSky() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, stars = [], raf = 0;

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // the same sky every time: seeded, kept off the moon and the title
      const r = rng(5);
      stars = [];
      while (stars.length < Math.round(w / 14)) {
        const x = r() * w, y = r() * w * SKY_BOTTOM * 0.92;
        const nearMoon = Math.hypot(x - MOON.x * w, y - MOON.y * w) < MOON.r * w * 2.4;
        const onTitle = x > TITLE.x * w && y < TITLE.y * w;
        if (!nearMoon && !onTitle) stars.push({ x, y, size: 0.6 + r() * 1.1, phase: r() * 6, speed: 0.6 + r() * 1.2 });
      }
    }

    function drawClock() {
      const now = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
      const small = w < 640, dot = small ? 2 : 3, pitch = dot * 1.6, step = LED_W * pitch + pitch;
      // bottom right on wide screens; on phones that's the shore trees, so centre it over the bay
      const width = now.length * step;
      const x0 = small ? (w - width) / 2 : w - width - 24, y0 = h - LED_H * pitch - (small ? 12 : 22);
      ctx.fillStyle = `rgb(${CREAM} / 0.4)`;
      [...now].forEach((ch, i) => {
        const g = glyph(ch);
        for (let y = 0; y < LED_H; y++)
          for (let x = 0; x < LED_W; x++)
            if (g[y][x] === '#') {
              ctx.beginPath();
              ctx.arc(x0 + i * step + x * pitch, y0 + y * pitch, dot / 2, 0, Math.PI * 2);
              ctx.fill();
            }
      });
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      // the moon's halo swells and fades over about eight seconds
      const mx = MOON.x * w, my = MOON.y * w, mr = MOON.r * w;
      const breathe = 0.5 + 0.5 * Math.sin(t / 1300);
      const halo = ctx.createRadialGradient(mx, my, mr * 0.9, mx, my, mr * (3.2 + breathe * 0.8));
      halo.addColorStop(0, `rgb(${CREAM} / ${0.22 + breathe * 0.1})`);
      halo.addColorStop(1, `rgb(${CREAM} / 0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10);
      for (const s of stars) {
        ctx.fillStyle = `rgb(${CREAM} / ${0.25 + 0.6 * Math.abs(Math.sin(t / 1000 * s.speed + s.phase))})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
      drawClock();
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (!document.hidden) draw(t);
    }

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    const tick = reduce ? setInterval(() => draw(0), 1000) : 0;
    if (reduce) draw(0);
    else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(tick);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="print-overlay absolute inset-0 w-full h-full" aria-hidden="true" />;
}
