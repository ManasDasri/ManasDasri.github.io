'use client';

import { useEffect, useRef } from 'react';

// Conway's Game of Life — a nod to the life simulator on the roadmap.
// Move the cursor over the banner to seed cells, click to drop a glider.
const CELL = 9;
const TICK_MS = 120;
const GLIDER = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];

export default function LifeCanvas() {
  const canvasRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cols = 0, rows = 0, grid, age, gen = 0, raf, last = 0, onScreen = true;

    const idx = (x, y) => ((y + rows) % rows) * cols + ((x + cols) % cols);

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = host.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const c = Math.ceil(width / CELL), r = Math.ceil(height / CELL);
      if (c !== cols || r !== rows) {
        cols = c;
        rows = r;
        grid = new Uint8Array(cols * rows).map(() => (Math.random() < 0.16 ? 1 : 0));
        age = new Uint8Array(cols * rows);
        gen = 0;
      }
      draw();
    }

    function step() {
      const next = new Uint8Array(cols * rows);
      let pop = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let n = 0;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += grid[idx(x + dx, y + dy)];
          const i = y * cols + x;
          if (n === 3 || (n === 2 && grid[i])) {
            next[i] = 1;
            age[i] = Math.min(age[i] + 1, 40);
            pop++;
          } else age[i] = 0;
        }
      }
      grid = next;
      gen++;
      // colony dying out → sprinkle fresh life so the banner never goes dark
      if (pop < grid.length * 0.03)
        for (let k = 0; k < grid.length * 0.05; k++) grid[(Math.random() * grid.length) | 0] = 1;
      if (statsRef.current) statsRef.current.textContent = `gen ${gen} · pop ${pop}`;
    }

    function draw() {
      ctx.clearRect(0, 0, cols * CELL, rows * CELL);
      for (let i = 0; i < grid.length; i++) {
        if (!grid[i]) continue;
        const a = age[i];
        ctx.fillStyle = a < 2 ? '#4FD1A5' : '#C792EA';
        ctx.globalAlpha = a < 2 ? 0.85 : Math.max(0.18, 0.6 - a * 0.012);
        ctx.fillRect((i % cols) * CELL + 1, ((i / cols) | 0) * CELL + 1, CELL - 2, CELL - 2);
      }
      ctx.globalAlpha = 1;
    }

    function loop(t) {
      raf = requestAnimationFrame(loop);
      if (!onScreen || document.hidden || t - last < TICK_MS) return;
      last = t;
      step();
      draw();
    }

    function cellAt(e) {
      const r = host.getBoundingClientRect();
      return [((e.clientX - r.left) / CELL) | 0, ((e.clientY - r.top) / CELL) | 0];
    }
    function onMove(e) {
      const [x, y] = cellAt(e);
      for (let k = 0; k < 4; k++)
        grid[idx(x + ((Math.random() * 3) | 0) - 1, y + ((Math.random() * 3) | 0) - 1)] = 1;
    }
    function onClick(e) {
      const [x, y] = cellAt(e);
      GLIDER.forEach(([dx, dy]) => (grid[idx(x + dx, y + dy)] = 1));
      draw();
    }

    resize();
    window.addEventListener('resize', resize);
    if (reduce) return () => window.removeEventListener('resize', resize);

    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(host);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('click', onClick);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <div className="absolute top-3 right-4 font-display text-[10px] text-mute/80 text-right pointer-events-none select-none">
        <div>// conway&apos;s game of life</div>
        <div ref={statsRef}>gen 0 · pop 0</div>
        <div className="hidden sm:block">move to seed · click for a glider</div>
      </div>
    </>
  );
}
