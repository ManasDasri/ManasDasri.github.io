'use client';

import { useEffect, useRef } from 'react';
import { glyph, LED_W, LED_H } from '@/lib/ledFont';

// Snow falling over whatever this canvas covers: the Hiroshige print in the header
// (with a dot-matrix clock printed in its corner, Bengaluru time), or the whole page
// behind the layout. Flakes fall slowly with a sideways sway; nearer ones are bigger,
// brighter and faster. Pauses in hidden tabs; reduced motion gets still flakes.
export default function Snowfall({ density, colour, clock = null, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, flakes = [], raf = 0, last = 0;

    const flake = (top) => {
      const z = Math.random(); // 0 far, 1 near
      return { x: Math.random() * w, y: top ? -4 : Math.random() * h, z, r: 0.6 + z * 1.8, vy: 0.15 + z * 0.55, phase: Math.random() * 6, sway: 0.2 + Math.random() * 0.4 };
    };

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      flakes = Array.from({ length: Math.round(w * h * density) }, () => flake(false));
    }

    function drawClock() {
      const now = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
      const dot = w < 640 ? 2 : 3, pitch = dot * 1.6;
      const step = LED_W * pitch + pitch;
      // bottom right on wide screens; top right on phones, where the walkers fill the bottom corner
      const x0 = w - now.length * step - (w < 640 ? 12 : 24), y0 = w < 640 ? 10 : h - LED_H * pitch - 22;
      ctx.fillStyle = clock;
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

    function draw(t, dt) {
      ctx.clearRect(0, 0, w, h);
      if (clock) drawClock();
      ctx.fillStyle = colour;
      for (const f of flakes) {
        if (dt) {
          f.phase += 0.02 * dt;
          f.y += f.vy * dt;
          f.x += Math.sin(f.phase) * f.sway * 0.3 * dt;
          if (f.y > h + 4) Object.assign(f, flake(true));
        }
        ctx.globalAlpha = 0.35 + f.z * 0.6;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return (last = t);
      const dt = Math.min((t - (last || t)) / 16.7, 3);
      last = t;
      draw(t, dt);
    }

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    // reduced motion: still flakes, and the clock (if any) still ticks once a second
    const tick = reduce ? setInterval(() => draw(0, 0), 1000) : 0;
    if (reduce) draw(0, 0);
    else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(tick);
      ro.disconnect();
    };
  }, [density, colour, clock]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
