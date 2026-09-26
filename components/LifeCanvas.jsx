'use client';

import { useEffect, useRef } from 'react';

// Conway's Game of Life. It starts as a handful of acorns — 7-cell seeds that
// grow for thousands of generations — over a thin soup, so the banner visibly
// sprouts on load. Move the cursor to seed cells, click to launch a glider.
const TICK_MS = 110;
const ACORN = [[1, 0], [3, 1], [0, 2], [1, 2], [4, 2], [5, 2], [6, 2]];
const GLIDER = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];
const HEAT = ['#FFC857', '#FF6B57', '#9D7BFF']; // born → maturing → old

export default function LifeCanvas() {
  const canvasRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cell, cols = 0, rows = 0, grid, age, gen = 0, raf, last = 0, onScreen = true;

    const idx = (x, y) => ((y + rows) % rows) * cols + ((x + cols) % cols);
    const stamp = (shape, x, y) => shape.forEach(([dx, dy]) => (grid[idx(x + dx, y + dy)] = 1));

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = host.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = width < 640 ? 7 : 9;
      const c = Math.ceil(width / cell), r = Math.ceil(height / cell);
      if (c === cols && r === rows) return draw();
      cols = c;
      rows = r;
      grid = new Uint8Array(cols * rows).map(() => (Math.random() < 0.035 ? 1 : 0));
      age = new Uint8Array(cols * rows);
      const acorns = Math.max(4, Math.round((cols * rows) / 900));
      for (let k = 0; k < acorns; k++) stamp(ACORN, (Math.random() * cols) | 0, (Math.random() * rows) | 0);
      gen = 0;
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
            age[i] = Math.min(age[i] + 1, 60);
            pop++;
          } else age[i] = 0;
        }
      }
      grid = next;
      gen++;
      // colony settled into still lifes → plant a fresh acorn
      if (gen % 150 === 0 || pop < grid.length * 0.02)
        stamp(ACORN, (Math.random() * cols) | 0, (Math.random() * rows) | 0);
      if (statsRef.current) statsRef.current.textContent = `generation ${gen} · ${pop} alive`;
    }

    function draw() {
      ctx.clearRect(0, 0, cols * cell, rows * cell);
      const s = cell - 1;
      for (let i = 0; i < grid.length; i++) {
        if (!grid[i]) continue;
        const a = age[i];
        if (a <= 1) (ctx.fillStyle = HEAT[0]), (ctx.globalAlpha = 0.9);
        else if (a <= 6) (ctx.fillStyle = HEAT[1]), (ctx.globalAlpha = 0.65);
        else (ctx.fillStyle = HEAT[2]), (ctx.globalAlpha = Math.max(0.22, 0.55 - a * 0.006));
        ctx.fillRect((i % cols) * cell, ((i / cols) | 0) * cell, s, s);
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
      return [((e.clientX - r.left) / cell) | 0, ((e.clientY - r.top) / cell) | 0];
    }
    function onMove(e) {
      const [x, y] = cellAt(e);
      for (let k = 0; k < 4; k++)
        grid[idx(x + ((Math.random() * 3) | 0) - 1, y + ((Math.random() * 3) | 0) - 1)] = 1;
    }
    function onClick(e) {
      const [x, y] = cellAt(e);
      stamp(GLIDER, x, y);
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
      <div className="absolute top-4 right-5 sm:right-8 font-mono text-[11px] leading-relaxed text-mute text-right pointer-events-none select-none">
        <div ref={statsRef}>generation 0 · 0 alive</div>
        <div className="hidden sm:block text-mute/70">move to seed cells, click to launch a glider</div>
      </div>
    </>
  );
}
