'use client';

import { useEffect, useRef } from 'react';

// Conway's Game of Life, with the name drawn in cells. The name is outside the
// simulation (never dies) and keeps firing gliders into the colony around it.
// Move the cursor to seed cells, click to drop a glider.
const TICK_MS = 110;
const EMIT_EVERY = 4; // generations between gliders fired from the name
const GLIDER = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];
const HEAT = ['#FFC857', '#FF6B57', '#9D7BFF']; // born → maturing → old
const NAME = '#ECE8DF';
const CONTENT_MAX = 1024; // max-w-5xl, so the name lines up with the text below
const CONTENT_PAD = 36; // sm:px-9

export default function LifeCanvas({ lines, compactLines }) {
  const canvasRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cell, cols = 0, rows = 0, grid, age, mask, maskCells, reveal, cx, cy;
    let gen = 0, raf, last = 0, t0 = 0, onScreen = true, destroyed = false;

    const idx = (x, y) => ((y + rows) % rows) * cols + ((x + cols) % cols);

    function buildMask(width) {
      const text = cols < 90 ? compactLines : lines;
      const off = document.createElement('canvas');
      off.width = cols;
      off.height = rows;
      const o = off.getContext('2d');
      const font = (px) => `800 ${px}px "Bricolage Grotesque", sans-serif`;
      o.font = font(100);
      const widest = Math.max(...text.map((l) => o.measureText(l).width));
      const left = Math.round(Math.max(20, (width - CONTENT_MAX) / 2 + CONTENT_PAD) / cell);
      // fit the width, but never taller than ~55% of the banner
      let px = Math.min((100 * (cols - left * 2)) / widest, (rows * 0.55) / (0.72 + (text.length - 1) * 0.95));
      // the font's optical sizing makes small text wider, so re-fit at the real size
      o.font = font(px);
      px *= Math.min(1, (cols - left * 2) / Math.max(...text.map((l) => o.measureText(l).width)));
      o.font = font(px);
      o.fillStyle = '#fff';
      const capH = px * 0.72;
      const lineH = px * 0.95;
      const top = (rows - (capH + lineH * (text.length - 1))) / 2;
      text.forEach((l, i) => o.fillText(l, left, top + capH + lineH * i));

      const d = o.getImageData(0, 0, cols, rows).data;
      mask = new Uint8Array(cols * rows);
      maskCells = [];
      for (let i = 0; i < mask.length; i++) if (d[i * 4 + 3] > 110) (mask[i] = 1), maskCells.push(i);
      cx = maskCells.reduce((s, i) => s + (i % cols), 0) / maskCells.length;
      cy = maskCells.reduce((s, i) => s + ((i / cols) | 0), 0) / maskCells.length;
      // the name crystallises cell by cell on load
      reveal = maskCells.map(() => 150 + Math.random() * 900);
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = host.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = width < 640 ? 6 : 8;
      const c = Math.ceil(width / cell), r = Math.ceil(height / cell);
      if (c !== cols || r !== rows) {
        cols = c;
        rows = r;
        grid = new Uint8Array(cols * rows).map(() => (Math.random() < 0.09 ? 1 : 0));
        age = new Uint8Array(cols * rows);
        buildMask(width);
      }
      if (reduce) draw(Infinity);
    }

    function emitGlider() {
      const i = maskCells[(Math.random() * maskCells.length) | 0];
      const x = i % cols, y = (i / cols) | 0;
      // flip the base glider so it flies away from the name's centre
      const fx = x < cx ? -1 : 1, fy = y < cy ? -1 : 1;
      GLIDER.forEach(([dx, dy]) => (grid[idx(x + fx * (dx + 2), y + fy * (dy + 2))] = 1));
    }

    function step(elapsed) {
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
      if (elapsed > 1200 && gen % EMIT_EVERY === 0) emitGlider();
      // colony dying out → sprinkle fresh life so the banner never goes dark
      if (pop < grid.length * 0.02)
        for (let k = 0; k < grid.length * 0.04; k++) grid[(Math.random() * grid.length) | 0] = 1;
      if (statsRef.current) statsRef.current.textContent = `generation ${gen} · ${pop} alive`;
    }

    function draw(elapsed) {
      ctx.clearRect(0, 0, cols * cell, rows * cell);
      const s = cell - 1;
      for (let i = 0; i < grid.length; i++) {
        if (!grid[i] || mask[i]) continue;
        const a = age[i];
        if (a <= 1) (ctx.fillStyle = HEAT[0]), (ctx.globalAlpha = 0.9);
        else if (a <= 6) (ctx.fillStyle = HEAT[1]), (ctx.globalAlpha = 0.65);
        else (ctx.fillStyle = HEAT[2]), (ctx.globalAlpha = Math.max(0.22, 0.55 - a * 0.006));
        ctx.fillRect((i % cols) * cell, ((i / cols) | 0) * cell, s, s);
      }
      ctx.fillStyle = NAME;
      for (let k = 0; k < maskCells.length; k++) {
        const t = elapsed - reveal[k];
        if (t <= 0) continue;
        const i = maskCells[k];
        ctx.globalAlpha = Math.min(1, t / 180);
        ctx.fillRect((i % cols) * cell, ((i / cols) | 0) * cell, s, s);
      }
      ctx.globalAlpha = 1;
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (!onScreen || document.hidden) return;
      if (!t0) t0 = t;
      if (t - last >= TICK_MS) {
        last = t;
        step(t - t0);
      }
      draw(t - t0);
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
      GLIDER.forEach(([dx, dy]) => (grid[idx(x + dx, y + dy)] = 1));
    }

    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));

    // wait for the display font, or the name would be measured in the fallback face
    document.fonts
      .load('800 100px "Bricolage Grotesque"')
      .catch(() => {})
      .then(() => {
        if (destroyed) return;
        resize();
        window.addEventListener('resize', resize);
        if (reduce) return;
        io.observe(host);
        host.addEventListener('pointermove', onMove);
        host.addEventListener('click', onClick);
        raf = requestAnimationFrame(frame);
      });

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('click', onClick);
    };
  }, [lines, compactLines]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <div className="absolute bottom-5 right-5 sm:right-8 font-mono text-[11px] leading-relaxed text-mute text-right pointer-events-none select-none">
        <div ref={statsRef}>generation 0 · 0 alive</div>
        <div className="hidden sm:block text-mute/70">move to seed cells, click to launch a glider</div>
      </div>
    </>
  );
}
