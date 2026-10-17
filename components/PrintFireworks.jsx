'use client';

import { useEffect, useRef } from 'react';
import { glyph, LED_W, LED_H } from '@/lib/ledFont';

// Fireworks over Kiyochika's "Fireworks at Ikenohata", in the print's own style: every
// few seconds a burst high in the sky drops wavy willow streams, orange fading to
// cream, scattering sparks. Also prints a dot-matrix clock (Bengaluru time) in the
// corner. Pauses in hidden tabs; reduced motion gets just the clock.
const ORANGE = [236, 128, 74];
const CREAM = [246, 222, 168];
const mix = (t) => ORANGE.map((o, i) => Math.round(o + (CREAM[i] - o) * t)).join(' ');

export default function PrintFireworks() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, streams = [], sparks = [], raf = 0, last = 0, next = 600;

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // a burst: several streams leaving one point, falling and swaying like a willow
    function burst() {
      const x = w * (0.35 + Math.random() * 0.6), y = h * (0.05 + Math.random() * 0.2);
      const n = 5 + ((Math.random() * 4) | 0);
      for (let i = 0; i < n; i++)
        streams.push({ x: x + (i - n / 2) * (6 + Math.random() * 6), y, vy: 0.9 + Math.random() * 0.7, phase: Math.random() * 6, trail: [], life: 1 });
    }

    function drawClock() {
      const now = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
      const small = w < 640, dot = small ? 2 : 3, pitch = dot * 1.6, step = LED_W * pitch + pitch;
      const x0 = w - now.length * step - (small ? 12 : 24), y0 = small ? 10 : h - LED_H * pitch - 22;
      ctx.fillStyle = 'rgb(246 222 168 / 0.38)';
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

    function draw(dt) {
      ctx.clearRect(0, 0, w, h);
      drawClock();
      if (!dt) return;
      next -= dt * 16.7;
      if (next <= 0) {
        burst();
        next = 2200 + Math.random() * 2800;
      }
      ctx.lineCap = 'round';
      for (const s of streams) {
        s.phase += 0.12 * dt;
        s.y += s.vy * dt;
        s.x += Math.sin(s.phase) * 0.9 * dt;
        s.life -= 0.006 * dt;
        s.trail.push([s.x, s.y]);
        if (s.trail.length > 40) s.trail.shift();
        if (Math.random() < 0.25 * dt) sparks.push({ x: s.x + (Math.random() - 0.5) * 14, y: s.y, life: 1 });
        // the stream: orange at its head, cream along its tail, fading as it burns out
        for (let i = 1; i < s.trail.length; i++) {
          const t = 1 - i / s.trail.length;
          ctx.strokeStyle = `rgb(${mix(t)} / ${Math.max(0, s.life) * (i / s.trail.length)})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(...s.trail[i - 1]);
          ctx.lineTo(...s.trail[i]);
          ctx.stroke();
        }
      }
      for (const p of sparks) {
        p.life -= 0.02 * dt;
        p.y += 0.2 * dt;
        ctx.fillStyle = `rgb(${mix(1)} / ${Math.max(0, p.life)})`;
        ctx.fillRect(p.x, p.y, 1.6, 1.6);
      }
      streams = streams.filter((s) => s.life > 0 && s.y < h);
      sparks = sparks.filter((p) => p.life > 0);
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return (last = t);
      const dt = Math.min((t - (last || t)) / 16.7, 3);
      last = t;
      draw(dt);
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
