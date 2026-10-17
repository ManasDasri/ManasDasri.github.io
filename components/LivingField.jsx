'use client';

import { useEffect, useRef } from 'react';
import { cssColor } from '@/lib/themes';

// The page background: one Game of Life colony behind everything, drawn in ASCII.
// A cell's character and colour show its age (+ newborn, * young, # old, @ in the
// accent colour once it has survived 24 generations, · just died). Gliders keep
// flying in from the edges. The pointer paints cells as it moves; clicking empty space drops an
// R-pentomino (a five-cell seed that burns for over a thousand generations).
// The field drifts at a quarter of the scroll speed, and fast scrolling speeds
// evolution up. It's dimmed behind the text column (globals.css, .living-field).
const CELL = 16; // px per cell
const GEN_MS = 110; // one generation at rest
const R_PENTOMINO = [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]];
const GLYPHS = ['+', '*', '*', '#']; // by age: 1, 2, 3, 4+
const ANCIENT = 24; // generations survived before a cell turns '@' in the accent colour
const GLIDER_MS = 450; // a new glider flies in about this often
// a glider for each diagonal direction
const GLIDERS = [
  [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]],
  [[1, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 0], [2, 0], [2, 1], [1, 2]],
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 2]],
];

export default function LivingField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cols = 0, rows = 0, age = new Uint16Array(0), was = new Uint8Array(0);
    let colours = {};
    let raf = 0, last = 0, acc = 0, gliderAcc = 0, lastScroll = window.scrollY, speed = 0, dirty = true;

    const readColours = () => {
      colours = { born: cssColor('signal'), young: cssColor('mature'), old: cssColor('old'), ancient: cssColor('accent'), dead: cssColor('line') };
      dirty = true;
    };

    const seed = (density) => {
      for (let i = 0; i < age.length; i++) if (Math.random() < density) age[i] = 1 + ((Math.random() * 6) | 0);
    };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nc = Math.ceil(window.innerWidth / CELL), nr = Math.ceil(window.innerHeight / CELL) + 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `bold ${CELL - 4}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (nc !== cols || nr !== rows) {
        cols = nc;
        rows = nr;
        age = new Uint16Array(cols * rows);
        was = new Uint8Array(cols * rows);
        seed(0.16);
      }
      dirty = true;
    }

    function step() {
      const next = new Uint16Array(age.length);
      for (let y = 0; y < rows; y++) {
        const up = ((y - 1 + rows) % rows) * cols, mid = y * cols, down = ((y + 1) % rows) * cols;
        for (let x = 0; x < cols; x++) {
          const l = (x - 1 + cols) % cols, r = (x + 1) % cols;
          const n =
            (age[up + l] > 0) + (age[up + x] > 0) + (age[up + r] > 0) +
            (age[mid + l] > 0) + (age[mid + r] > 0) +
            (age[down + l] > 0) + (age[down + x] > 0) + (age[down + r] > 0);
          const a = age[mid + x];
          if (n === 3 || (n === 2 && a)) next[mid + x] = Math.min(a + 1, 999);
        }
      }
      for (let i = 0; i < age.length; i++) was[i] = age[i] > 0 && !next[i];
      age = next;
      // keep it alive: a quiet field gets a fresh patch of soup somewhere
      let alive = 0;
      for (let i = 0; i < age.length; i++) alive += age[i] > 0;
      if (alive < age.length * 0.04) soup((Math.random() * cols) | 0, (Math.random() * rows) | 0, 10);
      dirty = true;
    }

    // the field scrolls at a quarter speed and wraps, so map screen rows through the offset
    const offsetRows = () => Math.floor((window.scrollY * 0.25) / CELL);
    const offsetPx = () => (window.scrollY * 0.25) % CELL;
    const cellAt = (px, py) => {
      const x = Math.floor(px / CELL);
      const y = (Math.floor((py + offsetPx()) / CELL) + offsetRows()) % rows;
      return [((x % cols) + cols) % cols, (y + rows) % rows];
    };
    const set = (x, y) => (age[((y + rows) % rows) * cols + ((x + cols) % cols)] = 1);
    function glider() {
      const shape = GLIDERS[(Math.random() * 4) | 0];
      const x = Math.random() < 0.5 ? 0 : cols - 3, y = (Math.random() * rows) | 0;
      shape.forEach(([dx, dy]) => set(x + dx, y + dy));
    }
    function soup(cx, cy, r) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.random() < 0.35) set(cx + dx, cy + dy);
    }

    function draw() {
      const w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const shift = offsetRows(), px = offsetPx();
      for (let sy = 0; sy < rows; sy++) {
        const y = (sy + shift) % rows, top = sy * CELL - px + CELL / 2;
        if (top > h + CELL) break;
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x, a = age[i];
          if (!a && !was[i]) continue;
          if (a >= ANCIENT) {
            ctx.fillStyle = colours.ancient;
            ctx.fillText('@', x * CELL + CELL / 2, top);
          } else if (a) {
            ctx.fillStyle = a === 1 ? colours.born : a < 4 ? colours.young : colours.old;
            ctx.fillText(GLYPHS[Math.min(a, 4) - 1], x * CELL + CELL / 2, top);
          } else {
            ctx.fillStyle = colours.dead;
            ctx.fillText('·', x * CELL + CELL / 2, top);
          }
        }
      }
      dirty = false;
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return (last = t);
      const dt = Math.min(t - (last || t), 100);
      last = t;
      // scroll speed in px/ms, eased, turns into extra generations
      const y = window.scrollY;
      speed = speed * 0.9 + (Math.abs(y - lastScroll) / Math.max(dt, 1)) * 0.1;
      if (y !== lastScroll) dirty = true;
      lastScroll = y;
      acc += dt * (1 + Math.min(speed * 2, 5));
      if (acc >= GEN_MS) {
        acc %= GEN_MS;
        step();
      }
      gliderAcc += dt;
      if (gliderAcc >= GLIDER_MS) {
        gliderAcc = 0;
        glider();
      }
      if (dirty) draw();
    }

    // the pointer paints; ignore it over things you'd click or read inside cards
    let lastPaint = 0;
    const busy = (el) => el.closest?.('a, button, input, textarea, select, [role="tab"], [role="menu"], nav, .spotlight, pre, canvas:not(.living-field)');
    const onMove = (e) => {
      if (e.pointerType === 'touch' || busy(e.target) || e.timeStamp - lastPaint < 30) return;
      lastPaint = e.timeStamp;
      const [x, y] = cellAt(e.clientX, e.clientY);
      set(x, y);
      set(x + (Math.random() < 0.5 ? 1 : -1), y);
      set(x, y + (Math.random() < 0.5 ? 1 : -1));
      dirty = true;
    };
    const onDown = (e) => {
      if (busy(e.target) || window.getSelection()?.toString()) return;
      const [x, y] = cellAt(e.clientX, e.clientY);
      R_PENTOMINO.forEach(([dx, dy]) => set(x + dx - 1, y + dy - 1));
      dirty = true;
    };

    readColours();
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('theme-change', readColours);
    if (reduce) {
      for (let i = 0; i < 40; i++) step(); // a settled still frame
      draw();
      window.addEventListener('scroll', draw, { passive: true });
    } else {
      raf = requestAnimationFrame(frame);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerdown', onDown);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('theme-change', readColours);
      window.removeEventListener('scroll', draw);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
    };
  }, []);

  return <canvas ref={ref} className="living-field" aria-hidden="true" />;
}
