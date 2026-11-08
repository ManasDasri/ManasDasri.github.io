'use client';

import { useEffect, useRef } from 'react';
import grid from '@/lib/adamGrid.json';
import { makeStamper, motionPaused, whenIdle } from './KoiPond';

// The banner: the hands from Michelangelo's The Creation of Adam, rebuilt in characters on
// black. Each cell starts as noise and resolves into the picture; once settled, a few cells
// keep flickering, a scan band passes every so often and scrambles what it crosses, and the
// pointer scrambles the cells near it. A few bright cells are accent squares.

const CW = 5; // cell, css px (scripts/adam-grid.py assumes 5 × 8)
const CH = 8;
const FPS = 24;
const FONT = `400 8px "Space Mono", monospace`;
const RAMP = ' .:-=+*#%@';
const NOISE = '01#%@*+=-:./\\<>[]{}';
const SCAN_EVERY = 7; // s
const ZOOM = 1.4;

const level = (x, y) => parseInt(grid.data[y * grid.cols + x], 16) / 15;

export default function HandsBanner() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const stamp = makeStamper(FONT, CW, CH);
    let W, H, cols, rows, cells, colours, raf, last = 0, t = 0, visible = true, ready = false;
    let still = motionPaused();
    let pointer = null;

    const readColours = () => {
      const css = getComputedStyle(document.documentElement);
      const rgb = (token) => css.getPropertyValue(`--c-${token}`).trim().split(/\s+/).map(Number);
      colours = { text: rgb('text'), dim: rgb('mute'), accent: rgb('accent'), hot: rgb('signal') };
    };

    // the picture, sampled into this banner's grid: fitted to the width, centred a little high
    const setup = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CW);
      rows = Math.ceil(H / CH);
      // the crop is 840 × 270 px of the painting (scripts/adam-grid.py): keep its proportions,
      // zoomed so the hands fill the banner and the arms run off its sides
      const picW = W * ZOOM, left = (W - picW) / 2 / CW;
      const picRows = Math.round(picW / (840 / 270) / CH);
      const top = Math.max(5, Math.round(rows * 0.36 - picRows / 2));
      cells = [];
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const gy = ((y - top) / picRows) * grid.rows, gx = ((x - left) / (cols * ZOOM)) * grid.cols;
          let v = 0;
          if (gy >= 0 && gy < grid.rows && gx >= 0 && gx < grid.cols) v = level(Math.min(grid.cols - 1, Math.floor(gx)), Math.min(grid.rows - 1, Math.floor(gy)));
          cells.push({ v, at: Math.random() * 1.4 + (x / cols) * 0.6, accent: v > 0.55 && Math.random() < 0.05, buzz: 0 });
        }
      readColours();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const scanX = ((t % SCAN_EVERY) / 1.6) * cols; // the band crosses in 1.6 s, then waits
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        const x = (i % cols) * CW, y = Math.floor(i / cols) * CH;
        const col = i % cols;
        const near = pointer && Math.hypot(pointer.x - x, (pointer.y - y) * 1.2) < 40;
        const scanned = Math.abs(col - scanX) < 3.5;
        if (near || scanned) c.buzz = 0.4 + Math.random() * 0.3;
        const settling = t < c.at;
        if (c.v < 0.07) {
          // the dark ground: a faint dotted grid, like the screen it's drawn on
          if ((col + Math.floor(i / cols)) % 2 === 0) stamp(ctx, '.', colours.dim, 0.18, x, y);
          if (settling && Math.random() < 0.05) stamp(ctx, NOISE[(Math.random() * NOISE.length) | 0], colours.dim, 0.8, x, y);
          continue;
        }
        if (settling || c.buzz > 0 || Math.random() < 0.004) {
          stamp(ctx, NOISE[(Math.random() * NOISE.length) | 0], near ? colours.hot : colours.text, 0.35 + c.v * 0.65, x, y);
          continue;
        }
        if (c.accent) {
          stamp(ctx, '■', colours.accent, 0.9, x, y);
          continue;
        }
        stamp(ctx, RAMP[Math.max(1, Math.round(c.v * (RAMP.length - 1)))], colours.text, 0.3 + c.v * 0.7, x, y);
      }
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      for (const c of cells) if (c.buzz > 0) c.buzz -= dt;
      draw();
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (!ready || still || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    // when still, the picture as it settles, with no scan band
    const settled = () => {
      t = 2.5;
      for (const c of cells) c.buzz = 0;
      draw();
    };

    setup();
    if (still) settled();
    const cancelIdle = whenIdle(() => {
      ready = true;
      run();
    });

    const header = canvas.parentElement;
    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const leave = () => (pointer = null);
    const onResize = () => {
      setup();
      if (still) settled();
    };
    const onMotion = () => {
      still = motionPaused();
      if (still) settled();
      run();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      run();
    });
    io.observe(canvas);
    header.addEventListener('pointermove', move);
    header.addEventListener('pointerleave', leave);
    window.addEventListener('resize', onResize);
    window.addEventListener('motion-change', onMotion);
    document.addEventListener('visibilitychange', run);
    document.fonts?.ready.then(() => still && settled());
    return () => {
      cancelIdle();
      cancelAnimationFrame(raf);
      io.disconnect();
      header.removeEventListener('pointermove', move);
      header.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('motion-change', onMotion);
      document.removeEventListener('visibilitychange', run);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <p className="absolute top-4 left-6 sm:left-9 m-0 font-mono text-[11px] text-mute pointer-events-none select-none">
        The Creation of Adam, Michelangelo, c. 1512 · in characters
      </p>
    </>
  );
}
