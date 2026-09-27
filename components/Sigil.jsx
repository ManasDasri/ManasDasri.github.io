'use client';

import { useEffect, useState } from 'react';

// A project's badge: a classic Life pattern on a tiny 6×6 torus.
const N = 6;
const PATTERNS = {
  glider: [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]],
  blinker: [[1, 2], [2, 2], [3, 2]],
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
  const [cells, setCells] = useState(() => seed(pattern));

  useEffect(() => {
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setCells(step), 180);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div
      className="grid grid-cols-6 gap-[2px] w-[46px] h-[46px] p-[3px] rounded-md bg-ink border border-line flex-shrink-0"
      style={name ? { viewTransitionName: name } : undefined}
      aria-hidden="true"
    >
      {cells.map((c, i) => (
        <span
          key={i}
          className={`rounded-[1px] transition-colors duration-150 ${c ? (dim ? 'bg-mute' : 'bg-signal') : 'bg-line/40'}`}
        />
      ))}
    </div>
  );
}
