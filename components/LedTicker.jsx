'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getWeather } from '@/lib/weather';
import { glyph, LED_W, LED_H } from '@/lib/ledFont';
import { cssColor } from '@/lib/themes';

// A dot-matrix LED board scrolling live-ish data, drawn with a real 5×7 LED
// font so every character has the same height and stroke. GitHub/LeetCode
// values come from the build (hourly); weather and the clock are live.
const PITCH = 4; // CSS px between LED centres
const ROWS = LED_H + 2; // one dark row above and below the glyphs
const GAP = 1; // dark columns between characters
const SPEED = 18; // LED columns per second
// segment kinds → theme tokens
const TOKEN = { label: 'mute', value: 'signal', text: 'text', sep: 'mature' };

const ago = (iso) => {
  const mins = Math.round((Date.now() - new Date(iso)) / 60000);
  if (mins < 60) return `${mins}M AGO`;
  if (mins < 1440) return `${Math.round(mins / 60)}H AGO`;
  return `${Math.round(mins / 1440)}D AGO`;
};

// Lay the segments out as columns of lit/unlit LEDs, one colour per column run.
function buildStrip(segments) {
  const colour = Object.fromEntries(Object.entries(TOKEN).map(([k, t]) => [k, cssColor(t)]));
  const cols = []; // each column: array of ROWS colours or null
  for (const [kind, text] of segments) {
    for (const ch of text) {
      const g = glyph(ch);
      for (let x = 0; x < LED_W; x++) {
        const col = new Array(ROWS).fill(null);
        for (let y = 0; y < LED_H; y++) if (g[y][x] === '#') col[y + 1] = colour[kind];
        cols.push(col);
      }
      for (let i = 0; i < GAP; i++) cols.push(new Array(ROWS).fill(null));
    }
  }
  return cols;
}

export default function LedTicker({ data }) {
  const canvasRef = useRef(null);
  const offsetRef = useRef(0); // scroll position survives strip rebuilds (weather, clock)
  const [weather, setWeather] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [themeTick, setThemeTick] = useState(0); // rebuild the strip in the new colours
  useEffect(() => {
    const onTheme = () => setThemeTick((n) => n + 1);
    window.addEventListener('theme-change', onTheme);
    return () => window.removeEventListener('theme-change', onTheme);
  }, []);

  useEffect(() => void getWeather().then(setWeather), []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000); // keep "2H AGO" and the clock honest
    return () => clearInterval(t);
  }, []);

  // each item is a list of [colour, text] segments
  const items = useMemo(() => {
    const list = [];
    const { pr, sprout, leetcode } = data ?? {};
    if (pr)
      list.push([
        ['label', 'LAST PR '],
        ['text', `"${pr.title}"`],
        ['label', ` → ${pr.repo.split('/')[1]} · `],
        ['value', pr.state.toUpperCase()],
        ['label', ` · ${ago(pr.at)}`],
      ]);
    if (sprout) list.push([['label', 'SPROUT '], ['value', sprout]]);
    if (leetcode != null) list.push([['label', 'LEETCODE '], ['value', `${leetcode} SOLVED`]]);
    if (weather) list.push([['label', 'BENGALURU '], ['value', `${Math.round(weather.temp)}°C`], ['text', ` ${weather.text}`]]);
    const ist = new Date(now).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
    list.push([['label', 'IST '], ['value', ist]]);
    return list;
  }, [data, weather, now]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frameEl = canvas.parentElement; // padding-free wrapper: its width is exactly the space we have
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const strip = buildStrip(items.flatMap((it) => [...it, ['sep', '   •   ']]));
    const UNLIT = cssColor('raised'), INK = cssColor('ink');
    let raf, last = 0, paused = false, cols = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      cols = Math.floor(frameEl.clientWidth / PITCH);
      canvas.width = cols * PITCH * dpr;
      canvas.height = ROWS * PITCH * dpr;
      canvas.style.width = `${cols * PITCH}px`;
      canvas.style.height = `${ROWS * PITCH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      ctx.fillStyle = INK;
      ctx.fillRect(0, 0, cols * PITCH, ROWS * PITCH);
      const start = Math.floor(offsetRef.current) % strip.length;
      for (let c = 0; c < cols; c++) {
        const col = strip[(start + c) % strip.length];
        for (let r = 0; r < ROWS; r++) {
          ctx.fillStyle = col[r] ?? UNLIT; // unlit LEDs stay faintly visible
          ctx.fillRect(c * PITCH, r * PITCH, PITCH - 1, PITCH - 1);
        }
      }
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (!last) last = t;
      if (!paused && !document.hidden) offsetRef.current = (offsetRef.current + ((t - last) / 1000) * SPEED) % strip.length;
      last = t;
      draw();
    }

    const pause = () => (paused = true);
    const play = () => (paused = false);
    canvas.addEventListener('pointerenter', pause);
    canvas.addEventListener('pointerleave', play);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(frameEl);
    if (!reduce) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerenter', pause);
      canvas.removeEventListener('pointerleave', play);
    };
  }, [items, themeTick]);

  return (
    <div className="rounded-md border border-line bg-ink p-2 overflow-hidden">
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="block" aria-hidden="true" title="Hover to pause" />
      </div>
      <p className="sr-only">{items.map((it) => it.map(([, t]) => t).join('')).join('. ')}</p>
    </div>
  );
}
