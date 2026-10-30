'use client';

import { useEffect, useRef } from 'react';
import { BAYER, STEP, ihash, makeStamper, mix, noise, rand } from './KoiPond';

// The margins of the inner pages, in the same style as the homepage's pond: a scene drawn
// as dithered pixels with dense ASCII over it, fading into the page toward the column.
//   bamboo     a grove swaying, leaves on the stalks (the projects list)
//   garden     a raked zen garden, sand rippling round mossy stones (a project's page)
//   mountains  ridges in mist under the moon (writing, and the 404)
// Only the margins are computed. The garden is still and drawn once; the others move
// slowly. Paused while the tab is hidden; still for reduced motion.

const P = 4; // css px per pixel of the scene
const CW = 4; // ASCII cell
const CH = 6;
const FPS = 20;
const stamp = typeof document === 'undefined' ? null : makeStamper(`600 ${CH}px "JetBrains Mono", monospace`, CW, CH);

const shadeOf = (c, k) => [c[0] * k, c[1] * k, c[2] * k];

const SCENES = {
  bamboo: {
    moving: true,
    setup(g, H) {
      // far stalks thin and dim, near ones wide and lit; nodes at irregular heights
      const stalks = [];
      for (let x = g.x - 10; x < g.x + g.w + 10; x += rand(14, 34)) {
        const near = Math.random() < 0.45;
        const nodes = [];
        for (let y = rand(0, 60); y < H; y += rand(70, 120)) nodes.push(y);
        stalks.push({ x, w: near ? rand(10, 16) : rand(4, 8), near, phase: rand(0, 6), nodes, tone: rand(0.75, 1.1) });
      }
      return { stalks: stalks.sort((a, b) => a.near - b.near) };
    },
    colour(x, y, t, s, H) {
      const fog = noise(x / 160 + t * 0.01, y / 220);
      let c = [4 + 10 * fog, 9 + 18 * fog, 6 + 10 * fog];
      for (const st of s.stalks) {
        const sx = st.x + Math.sin(t * 0.35 + st.phase) * (1 - y / H) * (st.near ? 7 : 4);
        const d = (x - sx) / (st.w / 2);
        if (Math.abs(d) > 1) continue;
        const round = Math.cos((d * Math.PI) / 2); // lit like a cylinder
        const base = st.near ? [52, 92, 44] : [22, 44, 26];
        c = shadeOf(base, (0.45 + 0.7 * round) * st.tone);
        for (const n of st.nodes) {
          const dy = y - n;
          if (dy > -2 && dy < 2) c = shadeOf(c, 0.45);
          else if (dy >= 2 && dy < 6) c = shadeOf(c, 1.25);
        }
      }
      return c;
    },
    // ASCII: leaves in clusters off the near stalks, swaying, and fibres down the stalks
    ascii(ctx, t, s, H, fade) {
      for (const st of s.stalks) {
        if (!st.near) continue;
        for (const n of st.nodes) {
          const sway = Math.sin(t * 0.35 + st.phase) * (1 - n / H) * 7;
          for (let k = 0; k < 9; k++) {
            const h = ihash(Math.round(st.x * 7) + k, Math.round(n));
            if (h > 0.55) continue;
            const side = h < 0.27 ? -1 : 1;
            const lx = st.x + sway + side * (6 + k * 3) + Math.sin(t * 0.8 + k + st.phase) * 1.5;
            const ly = n - 4 + k * 2 * (h * 2);
            const a = fade(lx);
            if (a > 0.05) stamp(ctx, side < 0 ? '\\' : '/', [120 + 60 * h, 168, 70], 0.85 * a, lx, ly);
          }
        }
        for (let y = 0; y < H; y += CH) {
          const sx = st.x + Math.sin(t * 0.35 + st.phase) * (1 - y / H) * 7;
          const a = fade(sx);
          if (a > 0.05 && ihash(Math.round(st.x), y) < 0.5) stamp(ctx, ihash(y, Math.round(st.x)) < 0.5 ? '|' : '!', [86, 130, 70], 0.4 * a, sx - CW / 2, y);
        }
      }
    },
  },

  garden: {
    moving: false,
    setup(g, H) {
      const stones = Array.from({ length: Math.max(2, Math.round(H / 260)) }, () => ({
        x: g.x + rand(0.25, 0.75) * g.w,
        y: rand(0.08, 0.92) * H,
        r: rand(14, Math.min(34, g.w * 0.18)),
        moss: rand(0, 50),
      }));
      return { stones };
    },
    // sand raked in straight lines, which bend into rings around each stone
    rake(x, y, s) {
      let d = Infinity, st = null;
      for (const o of s.stones) {
        const dd = Math.hypot(x - o.x, (y - o.y) * 1.15) - o.r;
        if (dd < d) [d, st] = [dd, o];
      }
      return d < 70 ? { v: Math.sin(d * 0.42), d, st } : { v: Math.sin(y * 0.42), d, st };
    },
    colour(x, y, t, s) {
      const { v, d, st } = this.rake(x, y, s);
      if (d < 0) {
        // the stone: lit from the top left, with moss
        const lit = 0.55 + 0.45 * Math.max(0, -((x - st.x) + (y - st.y)) / (st.r * 1.4));
        const moss = noise((x - st.x) / 8 + st.moss, (y - st.y) / 8) > 0.6;
        return shadeOf(moss ? [46, 76, 38] : [44, 44, 48], lit);
      }
      const grain = 0.92 + 0.16 * ihash(x, y);
      const k = (v > 0.55 ? 0.62 : v < -0.55 ? 1.12 : 0.9) * grain;
      // a soft shadow off each stone, down and right
      const sh = Math.max(0, 1 - Math.hypot(x - st.x - 6, y - st.y - 8) / (st.r + 14));
      return shadeOf([70, 66, 58], k * (1 - 0.5 * sh));
    },
    ascii(ctx, t, s, H, fade, gutters) {
      for (const g of gutters)
        for (let y = 0; y < H; y += CH)
          for (let x = g.x; x < g.x + g.w; x += CW) {
            const a = fade(x);
            if (a < 0.05) continue;
            const { v, d } = this.rake(x + CW / 2, y + CH / 2, s);
            if (d < 0 || v < 0.75) continue;
            stamp(ctx, d < 70 ? '~' : '-', [150, 142, 124], 0.5 * a, x, y);
          }
    },
  },

  mountains: {
    moving: true,
    setup(g, H) {
      return { moon: { x: g.x + rand(0.3, 0.7) * g.w, y: rand(0.12, 0.22) * H, r: rand(16, 24) }, seed: rand(0, 100) };
    },
    // layers far to near: each ridge from noise, lower and darker as it comes forward
    ridge(x, k, H, seed) {
      const n = noise(x / (220 - k * 30) + seed + k * 17, k * 3.1) * 0.7 + noise(x / 60 + k * 5 + seed, 9) * 0.3;
      return H * (0.32 + k * 0.15) - n * H * 0.22;
    },
    colour(x, y, t, s, H) {
      const sky = y / H;
      let c = [6 + 10 * sky, 10 + 14 * sky, 22 + 18 * sky];
      const m = s.moon;
      const dm = Math.hypot(x - m.x, y - m.y);
      if (dm < m.r) c = [196, 200, 210];
      else c = c.map((v, i) => v + [70, 76, 96][i] * Math.exp(-((dm - m.r) / 26)) * 0.5);
      for (let k = 0; k < 4; k++) {
        const top = this.ridge(x, k, H, s.seed);
        if (y < top) continue;
        const depth = k / 3;
        c = [mix(70, 10, depth), mix(80, 14, depth), mix(104, 24, depth)];
        // mist drifting at the foot of each ridge
        const drift = noise(x / 140 + t * 0.03 + k * 4, y / 40) * Math.min(1, (y - top) / 60);
        c = c.map((v, i) => mix(v, [96, 104, 124][i], drift * (0.5 - depth * 0.35)));
      }
      return c;
    },
    ascii(ctx, t, s, H, fade, gutters) {
      for (const g of gutters)
        for (let x = g.x; x < g.x + g.w; x += CW) {
          const a = fade(x);
          if (a < 0.05) continue;
          for (let k = 0; k < 4; k++) {
            const y = this.ridge(x, k, H, s.seed);
            const slope = this.ridge(x + CW, k, H, s.seed) - y;
            stamp(ctx, slope < -1.5 ? '/' : slope > 1.5 ? '\\' : '^', [150, 160, 184].map((v) => v * (1 - k * 0.18)), 0.75 * a, x, y - CH / 2);
          }
          // mist trails
          for (let y = H * 0.4; y < H; y += CH * 2) {
            const n = noise(x / 90 + t * 0.05, y / 30);
            if (n > 0.66) stamp(ctx, '~', [160, 170, 190], (n - 0.66) * 1.6 * a, x, y);
          }
        }
    },
  },
};

export default function MarginArt({ scene: name }) {
  const ref = useRef(null);

  useEffect(() => {
    const scene = SCENES[name];
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const off = document.createElement('canvas');
    const octx = off.getContext('2d');
    const still = !scene.moving || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const v = getComputedStyle(document.documentElement).getPropertyValue('--c-ink').trim().split(/\s+/).map(Number);
    const ink = v.length === 3 && v.every((n) => n >= 0) ? v : [0, 0, 0];
    let W, H, gw, gh, img, gutters, state, raf, last = 0, t = rand(0, 100), frameNo = 0;

    const fade = (x) => {
      for (const g of gutters) if (x >= g.x && x < g.x + g.w) return Math.min(1, Math.abs(x - g.edge) / Math.min(120, g.w * 0.5)) ** 1.5;
      return 0;
    };

    const setup = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gw = Math.ceil(W / P);
      gh = Math.ceil(H / P);
      off.width = gw;
      off.height = gh;
      img = octx.createImageData(gw, gh);
      const col = document.getElementById('main')?.getBoundingClientRect();
      const left = col ? col.left : W / 2, right = col ? col.right : W / 2;
      gutters = [
        { x: 0, w: left, edge: left },
        { x: right, w: W - right, edge: right },
      ].filter((g) => g.w >= 48);
      // set up each margin and merge them: lists (stalks, stones) span both; anything else
      // (the moon) comes from the first
      const parts = gutters.map((g) => scene.setup(g, H));
      state = Object.fromEntries(Object.keys(parts[0] ?? {}).map((k) => [k, Array.isArray(parts[0][k]) ? parts.flatMap((p) => p[k]) : parts[0][k]]));
    };

    const frame = (dt) => {
      t += dt;
      // the scene's pixels change slowly: worked out every other frame
      if (frameNo++ % 2 === 0) {
        const d = img.data;
        d.fill(0);
        for (const g of gutters) {
          const x0 = Math.floor(g.x / P), x1 = Math.ceil((g.x + g.w) / P);
          for (let py = 0; py < gh; py++)
            for (let px = x0; px < x1; px++) {
              const x = px * P, y = py * P, i = (py * gw + px) * 4;
              const k = fade(x);
              d[i + 3] = 255;
              if (k < 0.02) {
                d[i] = ink[0];
                d[i + 1] = ink[1];
                d[i + 2] = ink[2];
                continue;
              }
              const c = scene.colour(x, y, t, state, H);
              const th = BAYER[(py & 3) * 4 + (px & 3)];
              for (let ch = 0; ch < 3; ch++) d[i + ch] = mix(ink[ch], Math.floor(c[ch] / STEP + th) * STEP, k);
            }
        }
        octx.putImageData(img, 0, 0);
      }
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, gw * P, gh * P);
      scene.ascii(ctx, t, state, H, fade, gutters);
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      frame(dt);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      setup();
      if (!gutters.length) return ctx.clearRect(0, 0, W, H);
      frameNo = 0;
      frame(0);
      if (still) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());

    document.fonts?.ready.then(start);
    start();
    window.addEventListener('resize', start);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', start);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [name]);

  return <canvas ref={ref} className="pond fixed inset-0 w-screen h-screen pointer-events-none" aria-hidden="true" />;
}
