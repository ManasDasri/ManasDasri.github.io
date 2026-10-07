'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getWeather } from '@/lib/weather';

// A dot-matrix LED board scrolling live-ish data. GitHub/LeetCode values come
// from the build (hourly); weather and the clock are live. Text is drawn once
// into a tiny offscreen strip and every pixel of it becomes one LED.
const PITCH = 3; // CSS px between LED centres
const ROWS = 13; // LED rows = strip height in px
const SPEED = 20; // LED columns per second
const COLOURS = { label: '#86A9AC', value: '#7CF5E4', text: '#E6F4F1', sep: '#2BB3B1' };

const ago = (iso) => {
  const mins = Math.round((Date.now() - new Date(iso)) / 60000);
  if (mins < 60) return `${mins}M AGO`;
  if (mins < 1440) return `${Math.round(mins / 60)}H AGO`;
  return `${Math.round(mins / 1440)}D AGO`;
};

export default function LedTicker({ data }) {
  const canvasRef = useRef(null);
  const offsetRef = useRef(0); // scroll position survives strip rebuilds (weather, clock)
  const [weather, setWeather] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => void getWeather().then(setWeather), []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000); // keep "2h ago" and the clock honest
    return () => clearInterval(t);
  }, []);

  // each item is a list of [colour, text] segments
  const items = useMemo(() => {
    const list = [];
    const { push, sprout, leetcode } = data ?? {};
    if (push) list.push([['label', 'LAST PUSH '], ['text', `“${push.message}”`], ['label', ` → ${push.repo.split('/')[1]} · ${ago(push.at)}`]]);
    if (sprout) list.push([['label', 'SPROUT '], ['value', sprout]]);
    if (leetcode != null) list.push([['label', 'LEETCODE '], ['value', `${leetcode} SOLVED`]]);
    if (weather) list.push([['label', 'BENGALURU '], ['value', `${Math.round(weather.temp)}°C`], ['text', ` ${weather.text.toUpperCase()}`]]);
    const ist = new Date(now).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
    list.push([['label', 'IST '], ['value', ist]]);
    return list;
  }, [data, weather, now]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf, strip, stripW = 0, last = 0, paused = false, cols = 0;

    // render the items into a 1px-per-LED strip, then read back which LEDs are lit
    function buildStrip() {
      const off = document.createElement('canvas');
      const o = off.getContext('2d');
      const font = 'bold 11px "JetBrains Mono", monospace';
      o.font = font;
      const sep = '    •    ';
      const segments = items.flatMap((it) => [...it, ['sep', sep]]);
      stripW = Math.ceil(segments.reduce((w, [, t]) => w + o.measureText(t).width, 0));
      off.width = stripW;
      off.height = ROWS;
      o.font = font;
      o.textBaseline = 'middle';
      let x = 0;
      for (const [kind, t] of segments) {
        o.fillStyle = COLOURS[kind];
        o.fillText(t, x, ROWS / 2 + 1);
        x += o.measureText(t).width;
      }
      const px = o.getImageData(0, 0, stripW, ROWS).data;
      strip = new Array(stripW * ROWS);
      for (let i = 0; i < stripW * ROWS; i++)
        strip[i] = px[i * 4 + 3] > 110 ? `rgb(${px[i * 4]},${px[i * 4 + 1]},${px[i * 4 + 2]})` : null;
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.parentElement.getBoundingClientRect().width;
      cols = Math.floor(w / PITCH);
      canvas.width = cols * PITCH * dpr;
      canvas.height = ROWS * PITCH * dpr;
      canvas.style.width = `${cols * PITCH}px`;
      canvas.style.height = `${ROWS * PITCH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      ctx.fillStyle = '#041419';
      ctx.fillRect(0, 0, cols * PITCH, ROWS * PITCH);
      const start = Math.floor(offsetRef.current) % stripW;
      for (let c = 0; c < cols; c++) {
        const sx = (start + c) % stripW;
        for (let r = 0; r < ROWS; r++) {
          ctx.fillStyle = strip[r * stripW + sx] ?? '#0B2A31'; // unlit LEDs stay faintly visible
          ctx.fillRect(c * PITCH, r * PITCH, PITCH - 1, PITCH - 1);
        }
      }
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (!last) last = t;
      if (!paused && !document.hidden) offsetRef.current = (offsetRef.current + ((t - last) / 1000) * SPEED) % stripW;
      last = t;
      draw();
    }

    const pause = () => (paused = true);
    const play = () => (paused = false);
    canvas.addEventListener('pointerenter', pause);
    canvas.addEventListener('pointerleave', play);

    let ro;
    document.fonts.ready.then(() => {
      buildStrip();
      resize();
      ro = new ResizeObserver(resize);
      ro.observe(canvas.parentElement);
      if (!reduce) raf = requestAnimationFrame(frame);
    });

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      canvas.removeEventListener('pointerenter', pause);
      canvas.removeEventListener('pointerleave', play);
    };
  }, [items]);

  return (
    <div className="rounded-md border border-line bg-ink p-2">
      <canvas ref={canvasRef} className="block mx-auto" aria-hidden="true" title="Hover to pause" />
      <p className="sr-only">{items.map((it) => it.map(([, t]) => t).join('')).join('. ')}</p>
    </div>
  );
}
