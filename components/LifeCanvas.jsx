'use client';

import { useEffect, useRef, useState } from 'react';
import { decode, shareColony } from '@/lib/lifeShare';
import { createSynth } from '@/lib/lifeSound';

// Life-like cellular automaton. It starts as a handful of acorns — 7-cell seeds
// that grow for thousands of generations — over a thin soup, so the banner
// visibly sprouts on load. Move the cursor to seed cells, click to launch a glider.
//
// Controls, from the keyboard (while the banner is on screen) or from anywhere
// via window.dispatchEvent(new CustomEvent('life', { detail: { action, value, reply } })):
//   P pause · R reseed · L next rule · M sound · 1 glider gun · 2 pulsar · 3 acorn
// `reply`, if given, is called with a status snapshot (used by the terminal).
const TICK_MS = 110;
const ACORN = [[1, 0], [3, 1], [0, 2], [1, 2], [4, 2], [5, 2], [6, 2]];
const GLIDER = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];
// Gosper glider gun: fires a new glider every 30 generations
const GUN = [[24,0],[22,1],[24,1],[12,2],[13,2],[20,2],[21,2],[34,2],[35,2],[11,3],[15,3],[20,3],[21,3],[34,3],[35,3],[0,4],[1,4],[10,4],[16,4],[20,4],[21,4],[0,5],[1,5],[10,5],[14,5],[16,5],[17,5],[22,5],[24,5],[10,6],[16,6],[24,6],[11,7],[15,7],[12,8],[13,8]];
// Pulsar: period-3 oscillator, built from its four mirrored arms
const PULSAR = [];
for (const a of [0, 5, 7, 12]) for (const b of [2, 3, 4, 8, 9, 10]) PULSAR.push([b, a], [a, b]);
export const SHAPES = { gun: GUN, pulsar: PULSAR, acorn: ACORN, glider: GLIDER };
const KEY_SHAPES = { 1: 'gun', 2: 'pulsar', 3: 'acorn' };

// B = neighbour counts that give birth, S = counts that let a cell survive
export const RULES = {
  conway: { name: 'Conway', b: [3], s: [2, 3] },
  highlife: { name: 'HighLife', b: [3, 6], s: [2, 3] },
  daynight: { name: 'Day & Night', b: [3, 6, 7, 8], s: [3, 4, 6, 7, 8] },
  seeds: { name: 'Seeds', b: [2], s: [] },
};
export const ruleCode = (r) => `B${r.b.join('')}/S${r.s.join('')}`;
const HEAT = ['#7CF5E4', '#2BB3B1', '#1F5F8B']; // born → maturing → old

const Key = ({ children }) => (
  <kbd className="font-mono text-[10px] text-text/80 border border-line rounded px-1 mx-0.5">{children}</kbd>
);

function ShareButton() {
  const [note, setNote] = useState(null);
  async function share() {
    const result = await shareColony();
    if (!result) return;
    setNote({ shared: 'shared', copied: 'link copied', 'address bar': 'link is in the address bar' }[result.how]);
    setTimeout(() => setNote(null), 2500);
  }
  return (
    <button onClick={share} className="block ml-auto text-text/80 hover:text-signal hover:underline underline-offset-4">
      {note ?? 'share this colony'}
    </button>
  );
}

export default function LifeCanvas() {
  const canvasRef = useRef(null);
  const statsRef = useRef(null);
  const ruleRef = useRef(null);
  const soundRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cell, cols = 0, rows = 0, grid, age, gen = 0, pop = 0, raf, last = 0, onScreen = true;
    let paused = false, lastCell = null, ruleKey = 'conway', born, survive, shared = false;
    let synth = null, soundOn = false; // synth is created on the first toggle (needs a user gesture)
    const NOTES_PER_GEN = 3;

    const idx = (x, y) => ((y + rows) % rows) * cols + ((x + cols) % cols);
    const stamp = (shape, x, y) => shape.forEach(([dx, dy]) => (grid[idx(x + dx, y + dy)] = 1));

    function setRule(key) {
      ruleKey = key;
      const r = RULES[key];
      born = Array.from({ length: 9 }, (_, n) => r.b.includes(n));
      survive = Array.from({ length: 9 }, (_, n) => r.s.includes(n));
      if (ruleRef.current) ruleRef.current.textContent = `${r.name} ${ruleCode(r)}`;
    }

    function seed() {
      grid = new Uint8Array(cols * rows).map(() => (Math.random() < 0.035 ? 1 : 0));
      age = new Uint8Array(cols * rows);
      const acorns = Math.max(4, Math.round((cols * rows) / 900));
      for (let k = 0; k < acorns; k++) stamp(ACORN, (Math.random() * cols) | 0, (Math.random() * rows) | 0);
      gen = 0;
    }

    function drop(name) {
      const shape = SHAPES[name];
      const w = Math.max(...shape.map(([x]) => x)), h = Math.max(...shape.map(([, y]) => y));
      const [x, y] = lastCell ?? [cols >> 1, rows >> 1];
      stamp(shape, x - (w >> 1), y - (h >> 1));
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
      pop = 0;
      // reservoir-sample a few births so notes come from across the whole colony
      let births = 0;
      const picked = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let n = 0;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += grid[idx(x + dx, y + dy)];
          const i = y * cols + x;
          if (grid[i] ? survive[n] : born[n]) {
            next[i] = 1;
            if (!grid[i] && soundOn) {
              births++;
              if (picked.length < NOTES_PER_GEN) picked.push(x);
              else if (Math.random() < NOTES_PER_GEN / births) picked[(Math.random() * NOTES_PER_GEN) | 0] = x;
            }
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
      // every other generation, so the music breathes
      if (soundOn && gen % 2 === 0) synth.play(picked.map((x) => x / cols), births, ruleKey);
      showStats();
    }

    function setSound(on) {
      if (on && !synth) synth = createSynth();
      soundOn = on;
      synth?.setOn(on);
      if (soundRef.current) soundRef.current.textContent = on ? 'sound: on' : 'sound: off';
    }

    function showStats() {
      if (statsRef.current)
        statsRef.current.textContent = `${shared ? 'shared colony · ' : ''}${paused ? 'paused · ' : ''}generation ${gen} · ${pop} alive`;
    }

    // ASCII view of the busiest w×h window of the grid, for the terminal
    function snapshot(w = 48, h = 10) {
      let x0 = 0, y0 = 0, best = -1;
      for (let y = 0; y < rows; y += 2)
        for (let x = 0; x < cols; x += 4) {
          let n = 0;
          for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) n += grid[idx(x + dx, y + dy)];
          if (n > best) (best = n), (x0 = x), (y0 = y);
        }
      return Array.from({ length: h }, (_, y) =>
        Array.from({ length: w }, (_, x) => (grid[idx(x0 + x, y0 + y)] ? '■' : '·')).join('')
      );
    }

    function draw() {
      ctx.clearRect(0, 0, cols * cell, rows * cell);
      const s = cell - 1;
      // bioluminescence: a faint halo behind newborn cells
      ctx.fillStyle = HEAT[0];
      ctx.globalAlpha = 0.14;
      for (let i = 0; i < grid.length; i++)
        if (grid[i] && age[i] <= 1) ctx.fillRect((i % cols) * cell - 2, ((i / cols) | 0) * cell - 2, s + 4, s + 4);
      for (let i = 0; i < grid.length; i++) {
        if (!grid[i]) continue;
        const a = age[i];
        if (a <= 1) (ctx.fillStyle = HEAT[0]), (ctx.globalAlpha = 0.9);
        else if (a <= 6) (ctx.fillStyle = HEAT[1]), (ctx.globalAlpha = 0.65);
        else (ctx.fillStyle = HEAT[2]), (ctx.globalAlpha = Math.max(0.4, 0.8 - a * 0.008));
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

    // one entry point for keys, the rule button, the terminal and the palette
    function control({ action, value, reply }) {
      if (action === 'pause') paused = value ?? !paused;
      else if (action === 'reseed') seed();
      else if (action === 'rule') {
        const keys = Object.keys(RULES);
        setRule(RULES[value] ? value : keys[(keys.indexOf(ruleKey) + 1) % keys.length]);
      } else if (action === 'drop' && SHAPES[value]) drop(value);
      else if (action === 'sound') setSound(value ?? !soundOn);
      else if (action === 'export') {
        const cells = [];
        for (let i = 0; i < grid.length; i++) if (grid[i]) cells.push([i % cols, (i / cols) | 0]);
        return reply?.({ rule: ruleKey, cells });
      } else if (action === 'import') {
        // a shared colony replaces the soup, centred on this screen's grid
        grid = new Uint8Array(cols * rows);
        age = new Uint8Array(cols * rows);
        stamp(value.cells, (cols - value.w) >> 1, (rows - value.h) >> 1);
        if (RULES[value.rule]) setRule(value.rule);
        gen = 0;
        shared = true;
      }
      draw();
      showStats();
      reply?.({ gen, pop, paused, sound: soundOn, rule: ruleKey, grid: snapshot() });
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
      if (e.target.closest('button')) return;
      const [x, y] = cellAt(e);
      stamp(GLIDER, x, y);
      draw();
    }
    function onKey(e) {
      const t = e.target;
      if (!onScreen || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'p') control({ action: 'pause' });
      else if (k === 'r') control({ action: 'reseed' });
      else if (k === 'l') control({ action: 'rule' });
      else if (k === 'm') control({ action: 'sound' });
      else if (KEY_SHAPES[k]) control({ action: 'drop', value: KEY_SHAPES[k] });
    }
    const onLife = (e) => control(e.detail);

    setRule('conway');
    resize();
    // opened from a shared link: load that colony instead of the random soup
    const code = new URLSearchParams(location.search).get('life');
    if (code) decode(code).then((colony) => colony && control({ action: 'import', value: colony }));
    window.addEventListener('resize', resize);
    window.addEventListener('life', onLife);
    if (reduce)
      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('life', onLife);
      };

    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(host);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    raf = requestAnimationFrame(loop);

    return () => {
      synth?.setOn(false);
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('life', onLife);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <div className="absolute top-4 right-5 sm:right-8 font-mono text-[11px] leading-relaxed text-mute text-right select-none">
        <div ref={statsRef} className="pointer-events-none">generation 0 · 0 alive</div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('life', { detail: { action: 'rule' } }))}
          className="text-signal hover:underline underline-offset-4"
          title="Switch to the next rule"
        >
          rule: <span ref={ruleRef}>Conway B3/S23</span>
        </button>
        <ShareButton />
        <button
          ref={soundRef}
          onClick={() => window.dispatchEvent(new CustomEvent('life', { detail: { action: 'sound' } }))}
          className="block ml-auto text-text/80 hover:text-signal hover:underline underline-offset-4"
          title="Play the colony: each birth is a note"
        >
          sound: off
        </button>
        <div className="hidden sm:block [@media(hover:none)]:!hidden text-mute/70 pointer-events-none">
          <Key>P</Key> pause <Key>R</Key> reseed <Key>L</Key> rule <Key>M</Key> sound <Key>1</Key> gun <Key>2</Key> pulsar <Key>3</Key> acorn
        </div>
      </div>
    </>
  );
}
