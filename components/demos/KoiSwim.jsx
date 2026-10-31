'use client';

import { useEffect, useRef, useState } from 'react';
import { body, drawKoi, makeFish, swim } from '../KoiPond';

// One koi, with the two rules that make it swim like one switchable: how far each joint of
// its spine may bend, and how wide it has to turn. Take either away and it misbehaves.
const W = 600, H = 300;
const MODES = [
  { id: 'koi', label: 'both rules', bend: 0.11, turning: 0.45, note: 'Wide, unhurried arcs; the body curves but never folds.' },
  { id: 'no-turn', label: 'no turning circle', bend: 0.11, turning: 0.04, note: 'It can turn on the spot, so it wheels round in tight little loops.' },
  { id: 'no-bend', label: 'no bend limit', bend: Math.PI, turning: 0.04, note: 'Nothing stops the spine folding: the tail follows the head straight back down its own body.' },
];

export default function KoiSwim() {
  const ref = useRef(null);
  const koi = useRef(null);
  const [mode, setMode] = useState(MODES[0]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    koi.current = makeFish({ x: 150, y: 80, w: W - 300, h: H - 160 }, 0, 150);
    let raf, last = performance.now(), t = 0;
    const draw = () => {
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);
      drawKoi(ctx, koi.current, body(koi.current), () => 1);
    };
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      swim(koi.current, t, dt);
      draw();
    };
    // only swim while it's on screen
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else draw();
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!koi.current) return;
    koi.current.bend = mode.bend;
    koi.current.turning = mode.turning;
  }, [mode]);

  return (
    <figure className="not-prose my-8">
      <div className="rounded-md border border-line bg-paper overflow-hidden">
        <canvas ref={ref} className="block w-full h-auto" style={{ aspectRatio: `${W} / ${H}` }} aria-label={`A koi swimming: ${mode.note}`} role="img" />
      </div>
      <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label="Swimming rules">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m)}
            aria-pressed={mode.id === m.id}
            className={`font-mono text-xs px-2.5 py-1 rounded border transition-colors ${
              mode.id === m.id ? 'border-signal text-signal bg-signal/10' : 'border-line text-mute hover:text-text'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <figcaption className="font-mono text-xs text-mute mt-2">{mode.note}</figcaption>
    </figure>
  );
}
