'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Section from './Section';
import { BitLoader } from './Bits';

// "This is what my code looks like", drawn in ASCII. Every public repository
// is a strand growing out of the centre, steered by a seeded flow field, then
// rasterised into a grid of characters.
//   angle      → when the repo was created (clockwise from 12, oldest first)
//   length     → repo size (log scale), also how many fibres it has
//   colour     → main language
//   brightness → how recently it was pushed to
//   character  → how densely fibres overlap in that cell
// The seed is a hash of the data, so the same repos always draw the same piece.
// Hover (or tap) a strand to see which repository it is.
const SOURCES = ['users/ManasDasri/repos?per_page=100', 'orgs/Sprout-DevLabs/repos?per_page=100'];
const WORLD_W = 960, WORLD_H = 540;
// characters are ~1.83× taller than wide (0.6em wide, 1.1 line-height), so 120×37 keeps the shape undistorted
const COLS = 120, ROWS = 37;
const RAMP = ' ·:-=+*#%@';
const COLOURS = { Go: '#FF7A6B', Python: '#2BB3B1', JavaScript: '#7CF5E4', HTML: '#5B9BD5', Astro: '#B9F3EA', Ruby: '#FFB4A8' };
const OTHER = '#86A9AC';
const colourOf = (r) => COLOURS[r.language] ?? OTHER;

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
function noise2D(seed) {
  const rand = mulberry32(seed);
  const lattice = Float32Array.from({ length: 65536 }, rand);
  const at = (x, y) => lattice[((y & 255) << 8) | (x & 255)];
  const fade = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = fade(x - xi), yf = fade(y - yi);
    const top = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * xf;
    const bottom = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * xf;
    return top + (bottom - top) * yf;
  };
}

// Grow every strand and rasterise into the character grid.
function render(repos, seed, progress) {
  const rand = mulberry32(seed);
  const noise = noise2D(seed ^ 0x9e3779b9);
  const cells = COLS * ROWS;
  const counts = new Uint16Array(cells * repos.length); // fibre hits per cell per repo
  const tips = new Map(); // cell → repo index, for the seed-pods at strand tips
  const cx = WORLD_W / 2, cy = WORLD_H / 2;
  const cellOf = (x, y) => {
    const c = Math.floor((x / WORLD_W) * COLS), r = Math.floor((y / WORLD_H) * ROWS);
    return c >= 0 && c < COLS && r >= 0 && r < ROWS ? r * COLS + c : -1;
  };
  let fibres = 0;

  repos.forEach((repo, i) => {
    const base = -Math.PI / 2 + (i / repos.length) * Math.PI * 2;
    const sizeT = Math.log10(Math.max(repo.size, 1)) / Math.log10(20000);
    const length = 90 + sizeT * 300;
    const count = 3 + Math.round(sizeT * 14);
    for (let f = 0; f < count; f++) {
      fibres++;
      let x = cx + Math.cos(base) * 26, y = cy + Math.sin(base) * 26;
      let angle = base + (rand() - 0.5) * 0.5;
      const len = length * (0.6 + rand() * 0.4) * progress;
      for (let s = 0; s < len; s += 3) {
        const field = (noise(x * 0.008 + i, y * 0.008) - 0.5) * 3.2;
        angle = angle * 0.9 + (base + field) * 0.1;
        x += Math.cos(angle) * 3;
        y += Math.sin(angle) * 3;
        const c = cellOf(x, y);
        if (c >= 0) counts[c * repos.length + i]++;
      }
      if (f === 0 && progress === 1) {
        const c = cellOf(x, y);
        if (c >= 0) tips.set(c, i);
      }
    }
  });

  // each cell: total density picks the character, the dominant repo picks the colour
  const owner = new Int16Array(cells).fill(-1);
  const total = new Uint16Array(cells);
  let max = 1;
  for (let c = 0; c < cells; c++) {
    let best = -1, bestN = 0, sum = 0;
    for (let i = 0; i < repos.length; i++) {
      const n = counts[c * repos.length + i];
      sum += n;
      if (n > bestN) (bestN = n), (best = i);
    }
    owner[c] = best;
    total[c] = sum;
    if (sum > max) max = sum;
  }
  const chars = new Array(cells);
  const logMax = Math.log(max + 1);
  for (let c = 0; c < cells; c++) {
    if (tips.has(c)) {
      chars[c] = 'o';
      owner[c] = tips.get(c);
      continue;
    }
    const t = total[c] ? Math.log(total[c] + 1) / logMax : 0;
    chars[c] = total[c] ? RAMP[Math.max(1, Math.min(RAMP.length - 1, Math.round(t * (RAMP.length - 1))))] : ' ';
  }
  const centre = Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2);
  chars[centre] = '@';
  owner[centre] = -2; // the nucleus
  return { chars, owner, fibres, ink: chars.filter((ch) => ch !== ' ').length };
}

function Line({ row, frame, repos, active, glow }) {
  // group consecutive characters of the same owner into one span
  const spans = [];
  for (let c = 0; c < COLS; c++) {
    const i = row * COLS + c;
    const o = frame.owner[i];
    const last = spans[spans.length - 1];
    if (last && last.o === o) last.text += frame.chars[i];
    else spans.push({ o, text: frame.chars[i] });
  }
  return (
    <div>
      {spans.map((s, k) => {
        if (s.o === -1) return <span key={k}>{s.text}</span>;
        if (s.o === -2) return <span key={k} className="text-text font-bold">{s.text}</span>;
        const dimmed = active !== null && s.o !== active;
        return (
          <span key={k} style={{ color: colourOf(repos[s.o]), opacity: dimmed ? 0.18 : glow[s.o] }}>
            {s.text}
          </span>
        );
      })}
    </div>
  );
}

const fmt = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
const kb = (n) => (n >= 1024 ? `${(n / 1024).toFixed(1)} MB` : `${n} KB`);

export default function CodeArt() {
  const preRef = useRef(null);
  const [repos, setRepos] = useState(null);
  const [variation, setVariation] = useState(0);
  const [frame, setFrame] = useState(null);
  const [done, setDone] = useState(false);
  const [active, setActive] = useState(null); // repo index under the pointer
  const [pinned, setPinned] = useState(false);
  const [fontSize, setFontSize] = useState(8);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all(SOURCES.map((s) => fetch(`https://api.github.com/${s}`).then((r) => (r.ok ? r.json() : Promise.reject()))))
      .then((lists) => setRepos(lists.flat().filter((r) => !r.fork).sort((a, b) => a.created_at.localeCompare(b.created_at))))
      .catch(() => setRepos([]));
  }, []);

  // fit exactly COLS characters across the container (JetBrains Mono is 0.6em wide)
  useEffect(() => {
    const el = preRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setFontSize(Math.max(3, (e.contentRect.width - 2) / (COLS * 0.6))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [repos]);

  const baseSeed = repos?.length ? hash(repos.map((r) => `${r.full_name}:${r.size}:${r.pushed_at}`).join('|')) : 0;
  const seed = (baseSeed + variation * 0x2545f491) >>> 0;
  const glow = useMemo(
    () => (repos ?? []).map((r) => Math.max(0.35, 1 - (Date.now() - new Date(r.pushed_at)) / 86400000 / 240)),
    [repos]
  );

  // grow it in over ~1.6 seconds
  useEffect(() => {
    if (!repos?.length) return;
    setDone(false);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFrame(render(repos, seed, 1));
      return setDone(true);
    }
    let raf, start, last = 0;
    const tick = (t) => {
      start ??= t;
      const p = Math.min(1, (t - start) / 1600);
      if (t - last > 50 || p === 1) {
        last = t;
        setFrame(render(repos, seed, 1 - (1 - p) ** 3));
      }
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [repos, seed]);

  function repoAt(e) {
    const r = preRef.current.getBoundingClientRect();
    const c = Math.floor(((e.clientX - r.left) / r.width) * COLS), row = Math.floor(((e.clientY - r.top) / r.height) * ROWS);
    if (c < 0 || c >= COLS || row < 0 || row >= ROWS) return null;
    // look in a small neighbourhood so thin strands are easy to hit
    for (const [dc, dr] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const cc = c + dc, rr = row + dr;
      if (cc < 0 || cc >= COLS || rr < 0 || rr >= ROWS) continue;
      const o = frame.owner[rr * COLS + cc];
      if (o >= 0) return o;
    }
    return null;
  }

  async function copy() {
    const text = Array.from({ length: ROWS }, (_, r) => frame.chars.slice(r * COLS, (r + 1) * COLS).join('').trimEnd()).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  if (repos && !repos.length) return null; // GitHub unreachable or rate-limited

  const languages = repos
    ? Object.entries(repos.reduce((m, r) => ((m[r.language ?? 'other'] = (m[r.language ?? 'other'] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1])
    : [];
  const sel = active !== null && repos ? repos[active] : null;
  const button = 'font-mono text-xs border border-line rounded px-2.5 py-1 hover:border-signal hover:text-signal transition-colors disabled:opacity-40';

  return (
    <Section id="art" index={6} title="My code, drawn" note="every public repository as a strand of characters; hover one to see which">
      <figure className="m-0">
        <div className="relative rounded-md border border-line bg-ink px-px py-3 overflow-hidden">
          <div className="flex items-center justify-between font-mono text-[11px] text-mute px-3 pb-3">
            <span>
              SEED <span className="text-signal">0x{seed.toString(16).toUpperCase().padStart(8, '0')}</span>
              {variation > 0 && <span> · variation {variation}</span>}
            </span>
            {frame && done && (
              <span className="hidden sm:inline">
                STRANDS {repos.length} · FIBRES {frame.fibres} · CHARS {frame.ink.toLocaleString('en-US')}
              </span>
            )}
          </div>
          <div className="relative">
            {!frame && (
              <div className="absolute inset-0 flex items-center justify-center">
                <BitLoader label={repos ? 'growing…' : 'reading GitHub…'} />
              </div>
            )}
            <pre
              ref={preRef}
              role="img"
              aria-label={`ASCII artwork drawn from ${repos?.length ?? 0} GitHub repositories`}
              className="font-mono m-0 select-none cursor-crosshair"
              style={{ fontSize, lineHeight: 1.1, height: `${ROWS * 1.1 * fontSize}px` }}
              onPointerMove={(e) => frame && !pinned && setActive(repoAt(e))}
              onPointerLeave={() => !pinned && setActive(null)}
              onClick={(e) => {
                if (!frame) return;
                const o = repoAt(e);
                setActive(o);
                setPinned(o !== null);
              }}
            >
              {frame && Array.from({ length: ROWS }, (_, r) => <Line key={r} row={r} frame={frame} repos={repos} active={active} glow={glow} />)}
            </pre>
            {sel && (
              <a
                href={sel.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-3 w-60 rounded-lg border border-line bg-paper/95 backdrop-blur-sm p-3 no-underline shadow-xl"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[1px] shrink-0" style={{ background: colourOf(sel) }} aria-hidden="true" />
                  <span className="text-sm text-text truncate">{sel.full_name}</span>
                </span>
                {sel.description && <span className="block text-xs text-mute mt-1.5 line-clamp-2">{sel.description}</span>}
                <span className="block font-mono text-[11px] text-mute mt-2 leading-relaxed">
                  {sel.language ?? 'no language'} · {kb(sel.size)}
                  <br />
                  created {fmt(sel.created_at)} · pushed {fmt(sel.pushed_at)}
                </span>
                <span className="block font-mono text-[11px] text-signal mt-1.5">open on GitHub ↗</span>
              </a>
            )}
          </div>
        </div>
        <figcaption className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <p className="text-sm text-mute leading-relaxed max-w-[62ch] m-0">
              Each strand is one of my repositories, growing clockwise from twelve o’clock in the order I created them.
              Its length is the repo’s size, its colour the main language, and it glows the more recently I pushed to
              it; denser characters mean more fibres overlapping. Same data, same artwork: a new commit changes it.
            </p>
            <ul className="list-none p-0 m-0 mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {languages.map(([lang, n]) => (
                <li key={lang} className="flex items-center gap-1.5 font-mono text-xs text-mute">
                  <span className="w-2.5 h-2.5 rounded-[1px]" style={{ background: COLOURS[lang] ?? OTHER }} aria-hidden="true" />
                  {lang === 'other' ? 'no language' : lang} {n}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2 text-text">
            <button className={button} onClick={() => (setActive(null), setPinned(false), setVariation((v) => v + 1))} disabled={!repos}>
              regenerate ↻
            </button>
            <button className={button} onClick={copy} disabled={!done}>
              {copied ? 'copied' : 'copy ascii'}
            </button>
          </div>
        </figcaption>
      </figure>
    </Section>
  );
}
