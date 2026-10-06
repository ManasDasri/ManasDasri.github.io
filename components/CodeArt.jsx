'use client';

import { useEffect, useRef, useState } from 'react';
import Section from './Section';
import { BitLoader } from './Bits';

// "This is what my code looks like": every public repository becomes a strand
// growing out of the centre, steered by a seeded flow field.
//   angle      → when the repo was created (clockwise, oldest first)
//   length     → repo size (log scale), also how many fibres it has
//   colour     → main language
//   brightness → how recently it was pushed to
// The seed is a hash of the data itself, so the same repos always draw the
// same piece; new commits change it. "Regenerate" re-rolls the arrangement.
const SOURCES = ['users/ManasDasri/repos?per_page=100', 'orgs/Sprout-DevLabs/repos?per_page=100'];
const W = 960, H = 540;
const COLOURS = {
  Go: '#FF7A6B',
  Python: '#2BB3B1',
  JavaScript: '#7CF5E4',
  HTML: '#1F5F8B',
  Astro: '#B9F3EA',
  Ruby: '#FFB4A8',
};
const OTHER = '#86A9AC';

// small, fast, seedable PRNG
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

// smooth 2D value noise on a seeded lattice
function noise2D(seed) {
  const rand = mulberry32(seed);
  const SIZE = 256;
  const lattice = Float32Array.from({ length: SIZE * SIZE }, rand);
  const at = (x, y) => lattice[((y & 255) << 8) | (x & 255)];
  const fade = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = fade(x - xi), yf = fade(y - yi);
    const top = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * xf;
    const bottom = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * xf;
    return top + (bottom - top) * yf;
  };
}

function draw(ctx, repos, seed, progress) {
  const rand = mulberry32(seed);
  const noise = noise2D(seed ^ 0x9e3779b9);
  const now = Date.now();
  const cx = W / 2, cy = H / 2;
  let fibres = 0, steps = 0;

  ctx.fillStyle = '#041419';
  ctx.fillRect(0, 0, W, H);

  repos.forEach((r, i) => {
    const base = -Math.PI / 2 + (i / repos.length) * Math.PI * 2; // 12 o'clock = oldest
    const sizeT = Math.log10(Math.max(r.size, 1)) / Math.log10(20000); // 0..~1
    const length = 90 + sizeT * 300;
    const count = 3 + Math.round(sizeT * 14);
    const daysSincePush = (now - new Date(r.pushed_at)) / 86400000;
    const glow = Math.max(0.18, 1 - daysSincePush / 180); // pushed in the last ~6 months glows
    ctx.strokeStyle = COLOURS[r.language] ?? OTHER;

    for (let f = 0; f < count; f++) {
      fibres++;
      let x = cx + Math.cos(base) * 26, y = cy + Math.sin(base) * 26;
      let angle = base + (rand() - 0.5) * 0.5;
      const len = length * (0.6 + rand() * 0.4) * progress;
      ctx.globalAlpha = (0.08 + rand() * 0.12) * glow * 2.2;
      ctx.lineWidth = 0.6 + sizeT * 1.4 * rand();
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < len; s += 3) {
        // steer: mostly outward, bent by the field
        const field = (noise(x * 0.008 + i, y * 0.008) - 0.5) * 3.2;
        angle = angle * 0.9 + (base + field) * 0.1;
        x += Math.cos(angle) * 3;
        y += Math.sin(angle) * 3;
        ctx.lineTo(x, y);
        steps++;
      }
      ctx.stroke();
      // a seed-pod at the tip of the longest fibres
      if (f === 0 && progress === 1) {
        ctx.globalAlpha = Math.min(1, glow + 0.2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    }
  });

  // the nucleus
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#E6F4F1';
  ctx.fillRect(cx - 3, cy - 3, 6, 6);
  return { fibres, steps };
}

export default function CodeArt() {
  const ref = useRef(null);
  const [repos, setRepos] = useState(null);
  const [variation, setVariation] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all(SOURCES.map((s) => fetch(`https://api.github.com/${s}`).then((r) => (r.ok ? r.json() : Promise.reject()))))
      .then((lists) =>
        setRepos(
          lists
            .flat()
            .filter((r) => !r.fork)
            .sort((a, b) => a.created_at.localeCompare(b.created_at))
        )
      )
      .catch(() => setRepos([]));
  }, []);

  const baseSeed = repos?.length ? hash(repos.map((r) => `${r.full_name}:${r.size}:${r.pushed_at}`).join('|')) : 0;
  const seed = (baseSeed + variation * 0x2545f491) >>> 0;

  useEffect(() => {
    if (!repos?.length) return;
    const canvas = ref.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return void setStats(draw(ctx, repos, seed, 1));

    // grow it in over ~2 seconds
    let raf, start;
    const frame = (t) => {
      start ??= t;
      const p = Math.min(1, (t - start) / 2000);
      const s = draw(ctx, repos, seed, 1 - (1 - p) ** 3);
      if (p < 1) raf = requestAnimationFrame(frame);
      else setStats(s);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [repos, seed]);

  function download() {
    const a = document.createElement('a');
    a.href = ref.current.toDataURL('image/png');
    a.download = `algorithmicbit-${seed.toString(16)}.png`;
    a.click();
  }

  if (repos && !repos.length) return null; // GitHub unreachable or rate-limited

  const languages = repos ? Object.entries(repos.reduce((m, r) => ((m[r.language ?? 'other'] = (m[r.language ?? 'other'] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]) : [];
  const button = 'font-mono text-xs border border-line rounded px-2.5 py-1 hover:border-signal hover:text-signal transition-colors';

  return (
    <Section id="art" index={6} title="My code, drawn" note="every public repository, as a strand; generated live from GitHub">
      <figure className="m-0">
        <div className="relative rounded-md border border-line overflow-hidden bg-ink">
          {!stats && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <BitLoader label={repos ? 'growing…' : 'reading GitHub…'} />
            </div>
          )}
          <canvas ref={ref} className="block w-full h-auto aspect-[16/9]" role="img" aria-label={`Generative artwork drawn from ${repos?.length ?? 0} GitHub repositories`} />
          <div className="absolute top-3 left-3 font-mono text-[11px] text-mute leading-relaxed pointer-events-none">
            <div>
              SEED <span className="text-signal">0x{seed.toString(16).toUpperCase().padStart(8, '0')}</span>
              {variation > 0 && <span> · variation {variation}</span>}
            </div>
            {stats && (
              <div>
                STRANDS {repos.length} · FIBRES {stats.fibres} · STEPS {stats.steps.toLocaleString('en-US')}
              </div>
            )}
          </div>
        </div>
        <figcaption className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <p className="text-sm text-mute leading-relaxed max-w-[62ch] m-0">
              Each strand is one of my repositories. It grows clockwise from twelve o’clock in the order I created them;
              its length is the repo’s size, its colour the main language, and it glows brighter the more recently I
              pushed to it. Same data, same artwork: a new commit changes it.
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
            <button className={button} onClick={() => setVariation((v) => v + 1)} disabled={!repos}>
              regenerate ↻
            </button>
            <button className={button} onClick={download} disabled={!stats}>
              download png
            </button>
          </div>
        </figcaption>
      </figure>
    </Section>
  );
}
