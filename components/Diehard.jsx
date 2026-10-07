'use client';

import { useEffect, useRef, useState } from 'react';
import { cssColor } from '@/lib/themes';

// "Diehard": seven cells that evolve for exactly 130 generations, then vanish.
// The grid is sized so it never touches an edge (which would change the outcome).
const W = 40, H = 28, CELL = 9, TICK_MS = 70;
const SEED = [[6, 0], [0, 1], [1, 1], [1, 2], [5, 2], [6, 2], [7, 2]].map(([x, y]) => [x + 14, y + 5]);

export default function Diehard() {
  const ref = useRef(null);
  const [gen, setGen] = useState(0);
  const [run, setRun] = useState(0); // bump to replay

  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    const HEAT = [cssColor('signal'), cssColor('mature'), cssColor('old')];
    let grid = new Uint8Array(W * H), age = new Uint8Array(W * H), g = 0, t;
    SEED.forEach(([x, y]) => (grid[y * W + x] = 1));

    const draw = () => {
      ctx.clearRect(0, 0, W * CELL, H * CELL);
      for (let i = 0; i < grid.length; i++) {
        if (!grid[i]) continue;
        ctx.fillStyle = HEAT[age[i] <= 1 ? 0 : age[i] <= 6 ? 1 : 2];
        ctx.fillRect((i % W) * CELL, ((i / W) | 0) * CELL, CELL - 1, CELL - 1);
      }
    };
    const step = () => {
      const next = new Uint8Array(W * H);
      let alive = 0;
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          let n = 0;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const X = x + dx, Y = y + dy;
              if ((dx || dy) && X >= 0 && X < W && Y >= 0 && Y < H) n += grid[Y * W + X];
            }
          const i = y * W + x;
          if (n === 3 || (n === 2 && grid[i])) (next[i] = 1), (age[i] = Math.min(age[i] + 1, 60)), alive++;
          else age[i] = 0;
        }
      grid = next;
      setGen(++g);
      draw();
      if (alive) t = setTimeout(step, TICK_MS);
    };

    draw();
    setGen(0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    t = setTimeout(step, 600);
    return () => clearTimeout(t);
  }, [run]);

  const gone = gen >= 130;
  return (
    <figure className="m-0">
      <canvas ref={ref} width={W * CELL} height={H * CELL} className="w-full max-w-[360px] h-auto" aria-hidden="true" />
      <figcaption className="font-mono text-xs text-mute mt-3" aria-live="polite">
        {gone ? (
          <>
            generation 130 · nothing left.{' '}
            <button onClick={() => setRun((r) => r + 1)} className="text-signal underline underline-offset-4">
              replay
            </button>
          </>
        ) : (
          `generation ${gen} · diehard`
        )}
      </figcaption>
    </figure>
  );
}
