'use client';

import { useEffect, useRef, useState } from 'react';
import { cssColor } from '@/lib/themes';

// Draw your own colony: click or drag to paint cells, then play it.
const W = 48, H = 30, CELL = 10, TICK_MS = 110;

export default function MiniLife() {
  const ref = useRef(null);
  const grid = useRef(new Uint8Array(W * H));
  const painting = useRef(null); // 1 = painting cells on, 0 = erasing
  const [running, setRunning] = useState(false);
  const [gen, setGen] = useState(0);

  const draw = () => {
    const ctx = ref.current.getContext('2d');
    ctx.fillStyle = cssColor('ink');
    ctx.fillRect(0, 0, W * CELL, H * CELL);
    ctx.fillStyle = cssColor('raised');
    for (let i = 0; i < W * H; i++) if (!grid.current[i]) ctx.fillRect((i % W) * CELL, ((i / W) | 0) * CELL, CELL - 1, CELL - 1);
    ctx.fillStyle = cssColor('signal');
    for (let i = 0; i < W * H; i++) if (grid.current[i]) ctx.fillRect((i % W) * CELL, ((i / W) | 0) * CELL, CELL - 1, CELL - 1);
  };

  const step = () => {
    const g = grid.current, next = new Uint8Array(W * H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += g[((y + dy + H) % H) * W + ((x + dx + W) % W)];
        const i = y * W + x;
        next[i] = n === 3 || (n === 2 && g[i]) ? 1 : 0;
      }
    grid.current = next;
    setGen((n) => n + 1);
    draw();
  };

  useEffect(draw, []);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(step, TICK_MS);
    return () => clearInterval(t);
  }, [running]);

  const cellAt = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * W), y = Math.floor(((e.clientY - r.top) / r.height) * H);
    return x >= 0 && x < W && y >= 0 && y < H ? y * W + x : -1;
  };
  const paint = (e) => {
    const i = cellAt(e);
    if (i < 0 || painting.current === null) return;
    grid.current[i] = painting.current;
    draw();
  };

  const button = 'font-mono text-xs border border-line rounded px-2.5 py-1 hover:border-signal hover:text-signal transition-colors';
  return (
    <div className="flex flex-col gap-3 h-full">
      <canvas
        ref={ref}
        width={W * CELL}
        height={H * CELL}
        className="w-full h-auto rounded-md cursor-crosshair touch-none"
        aria-label="Drawing grid: click or drag to add cells"
        onPointerDown={(e) => {
          const i = cellAt(e);
          if (i < 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          painting.current = grid.current[i] ? 0 : 1;
          paint(e);
        }}
        onPointerMove={paint}
        onPointerUp={() => (painting.current = null)}
      />
      <div className="flex flex-wrap items-center gap-2 text-text">
        <button className={button} onClick={() => setRunning((r) => !r)}>{running ? 'pause' : 'play'}</button>
        <button className={button} onClick={step} disabled={running}>step</button>
        <button className={button} onClick={() => { grid.current = grid.current.map(() => (Math.random() < 0.22 ? 1 : 0)); setGen(0); draw(); }}>random</button>
        <button className={button} onClick={() => { grid.current = new Uint8Array(W * H); setRunning(false); setGen(0); draw(); }}>clear</button>
        <span className="font-mono text-xs text-mute ml-auto">generation {gen}</span>
      </div>
    </div>
  );
}
