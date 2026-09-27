'use client';

import { useEffect, useRef } from 'react';

// Conway's Game of Life. It starts as a handful of acorns — 7-cell seeds that
// grow for thousands of generations — over a thin soup, so the banner visibly
// sprouts on load. Move the cursor to seed cells, click to launch a glider.
// Keys while the banner is on screen: P pauses, R reseeds, 1–3 drop a pattern where the cursor last was.
const TICK_MS = 110;
const ACORN = [[1, 0], [3, 1], [0, 2], [1, 2], [4, 2], [5, 2], [6, 2]];
const GLIDER = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];
// Gosper glider gun: fires a new glider every 30 generations
const GUN = [[24,0],[22,1],[24,1],[12,2],[13,2],[20,2],[21,2],[34,2],[35,2],[11,3],[15,3],[20,3],[21,3],[34,3],[35,3],[0,4],[1,4],[10,4],[16,4],[20,4],[21,4],[0,5],[1,5],[10,5],[14,5],[16,5],[17,5],[22,5],[24,5],[10,6],[16,6],[24,6],[11,7],[15,7],[12,8],[13,8]];
// Pulsar: period-3 oscillator, built from its four mirrored arms
const PULSAR = [];
for (const a of [0, 5, 7, 12]) for (const b of [2, 3, 4, 8, 9, 10]) PULSAR.push([b, a], [a, b]);
const PATTERNS = { 1: GUN, 2: PULSAR, 3: ACORN };
const HEAT = ['#FFC857', '#FF6B57', '#9D7BFF']; // born → maturing → old

const Key = ({ children }) => (
  <kbd className="font-mono text-[10px] text-text/80 border border-line rounded px-1 mx-0.5">{children}</kbd>
);

export default function LifeCanvas() {
  const canvasRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cell, cols = 0, rows = 0, grid, age, gen = 0, raf, last = 0, onScreen = true;
    let paused = false, lastCell = null;

    const idx = (x, y) => ((y + rows) % rows) * cols + ((x + cols) % cols);
    const stamp = (shape, x, y) => shape.forEach(([dx, dy]) => (grid[idx(x + dx, y + dy)] = 1));

    function seed() {
      grid = new Uint8Array(cols * rows).map(() => (Math.random() < 0.035 ? 1 : 0));
      age = new Uint8Array(cols * rows);
      const acorns = Math.max(4, Math.round((cols * rows) / 900));
      for (let k = 0; k < acorns; k++) stamp(ACORN, (Math.random() * cols) | 0, (Math.random() * rows) | 0);
      gen = 0;
    }

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
      seed();
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
      showStats(pop);
    }

    function showStats(pop = grid.reduce((a, b) => a + b, 0)) {
      if (statsRef.current)
        statsRef.current.textContent = `${paused ? 'paused · ' : ''}generation ${gen} · ${pop} alive`;
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
      if (paused || !onScreen || document.hidden || t - last < TICK_MS) return;
      last = t;
      step();
      draw();
    }

    function cellAt(e) {
      const r = host.getBoundingClientRect();
      return [((e.clientX - r.left) / cell) | 0, ((e.clientY - r.top) / cell) | 0];
    }
    function onMove(e) {
      const [x, y] = (lastCell = cellAt(e));
      if (paused) return;
      for (let k = 0; k < 4; k++)
        grid[idx(x + ((Math.random() * 3) | 0) - 1, y + ((Math.random() * 3) | 0) - 1)] = 1;
    }
    function onClick(e) {
      const [x, y] = cellAt(e);
      stamp(GLIDER, x, y);
      draw();
    }
    function onKey(e) {
      const t = e.target;
      if (!onScreen || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'p') {
        paused = !paused;
      } else if (k === 'r') {
        seed();
      } else if (PATTERNS[k]) {
        const shape = PATTERNS[k];
        const w = Math.max(...shape.map(([x]) => x)), h = Math.max(...shape.map(([, y]) => y));
        const [x, y] = lastCell ?? [(cols - w) >> 1, (rows - h) >> 1];
        stamp(shape, x - (w >> 1), y - (h >> 1));
      } else return;
      draw();
      showStats();
    }

    resize();
    window.addEventListener('resize', resize);
    if (reduce) return () => window.removeEventListener('resize', resize);

    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(host);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <div className="absolute top-16 right-5 sm:right-8 font-mono text-[11px] leading-relaxed text-mute text-right pointer-events-none select-none">
        <div ref={statsRef}>generation 0 · 0 alive</div>
        <div className="hidden sm:block text-mute/70">move to seed cells, click to launch a glider</div>
        <div className="hidden sm:block [@media(hover:none)]:!hidden text-mute/70">
          <Key>P</Key> pause <Key>R</Key> reseed <Key>1</Key> glider gun <Key>2</Key> pulsar <Key>3</Key> acorn
        </div>
      </div>
    </>
  );
}
