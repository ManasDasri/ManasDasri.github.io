'use client';

import { useEffect, useState } from 'react';

// A project's badge: a classic Life pattern on a tiny 6×6 torus, drawn in ASCII.
// Live cells are #, newborn ones +, cells that just died :, empty ones .
const N = 6;
const PATTERNS = {
  glider: [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]],
  blinker: [[1, 2], [2, 2], [3, 2]],
  clock: [[3, 1], [1, 2], [3, 2], [2, 3], [4, 3], [2, 4]],
  toad: [[2, 2], [3, 2], [4, 2], [1, 3], [2, 3], [3, 3]],
  beacon: [[1, 1], [2, 1], [1, 2], [2, 2], [3, 3], [4, 3], [3, 4], [4, 4]],
};

const seed = (name) => {
  const g = new Array(N * N).fill(0);
  PATTERNS[name].forEach(([x, y]) => (g[y * N + x] = 1));
  return g;
};

function step(g) {
  return g.map((alive, i) => {
    const x = i % N, y = (i / N) | 0;
    let n = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += g[((y + dy + N) % N) * N + ((x + dx + N) % N)];
    return n === 3 || (n === 2 && alive) ? 1 : 0;
  });
}

export default function Sigil({ pattern, playing, dim, name }) {
  const [{ cells, prev }, setGen] = useState(() => ({ cells: seed(pattern), prev: seed(pattern) }));

  useEffect(() => {
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setGen((g) => ({ cells: step(g.cells), prev: g.cells })), 180);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div
      className="grid grid-cols-6 grid-rows-6 w-[52px] h-[52px] p-[4px] rounded-md bg-ink border border-line flex-shrink-0 font-mono text-[9px] font-bold leading-none overflow-hidden"
      style={name ? { viewTransitionName: name } : undefined}
      aria-hidden="true"
    >
      {cells.map((c, i) => {
        const [ch, colour] = c ? (prev[i] ? ['#', 'text-signal'] : ['+', 'text-mature']) : prev[i] ? [':', 'text-mute'] : ['.', 'text-line'];
        return (
          <span key={i} className={`flex items-center justify-center ${dim && c ? 'text-mute' : colour}`}>
            {ch}
          </span>
        );
      })}
    </div>
  );
}
