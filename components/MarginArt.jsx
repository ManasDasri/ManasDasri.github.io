'use client';

import { useEffect, useRef } from 'react';
import { BAYER, STEP, ihash, makeStamper, mix, noise, rand, whenIdle } from './KoiPond';

// The margins of the inner pages, in the same style as the homepage's pond: a scene drawn
// as dithered pixels with dense ASCII over it, fading into the page toward the column.
//   bamboo     a grove swaying, leaves on the stalks (the projects list)
//   garden     a raked zen garden, sand rippling round mossy stones (any other project)
//   mountains  ridges in mist under the moon (a post, and the 404)
//   network    a neural network drifting, signals running along its links (Gradient Works)
//   sprout     seedlings coming up out of the soil and growing (Sprout)
//   flow       a calm stream running down, currents drawn over it (Flow)
//   air        a city's air: haze, drifting particles, sensors on the roofs (Atmos)
//   market     a chart's dark grid (Velora)
//   rain       rain running down a window, city lights blurred behind (the writing list)
//   books      library shelves under a lamp, titles down the spines (the reading list)
// Only the margins are computed. The garden is still and drawn once; the others move
// slowly. Paused while the tab is hidden; still for reduced motion.

const P = 4; // css px per pixel of the scene
const CW = 4; // ASCII cell
const CH = 6;
const FPS = 20;
const stamp = typeof document === 'undefined' ? null : makeStamper(`700 ${CH}px "JetBrains Mono", monospace`, CW, CH);

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

  network: {
    moving: true,
    setup(g, H) {
      // nodes drift on slow orbits of their own; anything close enough is linked
      return {
        nodes: Array.from({ length: Math.round((g.w * H) / 5500) }, () => ({
          x: g.x + rand(0.05, 0.95) * g.w,
          y: rand(0.03, 0.97) * H,
          ax: rand(6, 18),
          ay: rand(6, 18),
          w: rand(0.1, 0.3),
          p: rand(0, 6.28),
          hot: Math.random() < 0.3,
        })),
      };
    },
    at: (n, t) => [n.x + Math.sin(t * n.w + n.p) * n.ax, n.y + Math.cos(t * n.w * 0.8 + n.p) * n.ay],
    colour(x, y, t, s) {
      let c = [5, 9, 18];
      for (const n of s.nodes) {
        const [nx, ny] = this.at(n, t);
        const q = ((x - nx) ** 2 + (y - ny) ** 2) / 140;
        if (q > 9) continue;
        const a = Math.exp(-q) * 0.6;
        c = c.map((v, i) => v + (n.hot ? [240, 122, 74] : [79, 163, 160])[i] * a * 0.5);
      }
      return c;
    },
    ascii(ctx, t, s, H, fade) {
      const pts = s.nodes.map((n) => this.at(n, t));
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const [x0, y0] = pts[i], [x1, y1] = pts[j];
          const d = Math.hypot(x1 - x0, y1 - y0);
          if (d > 115 || d < 8) continue;
          const ang = Math.atan2(y1 - y0, x1 - x0);
          const sl = Math.abs(Math.tan(ang));
          const ch = sl < 0.4 ? '-' : sl > 2.5 ? '|' : (y1 - y0) * (x1 - x0) > 0 ? '\\' : '/';
          const a = 0.8 * (1 - d / 115);
          // a signal travelling along the link
          const pulse = (t * 0.25 + (i * 7 + j * 3) * 0.13) % 1;
          for (let k = 4; k < d - 4; k += 5) {
            const u = k / d, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u;
            const f = fade(x);
            if (f < 0.05) continue;
            const hit = Math.abs(u - pulse) < 0.06;
            stamp(ctx, hit ? 'o' : ch, hit ? [240, 150, 100] : [110, 170, 180], (hit ? 0.9 : a) * f, x - CW / 2, y - CH / 2);
          }
        }
      s.nodes.forEach((n, i) => {
        const [x, y] = pts[i], f = fade(x);
        if (f > 0.05) stamp(ctx, '@', n.hot ? [250, 150, 100] : [140, 210, 205], 0.95 * f, x - CW / 2, y - CH / 2);
      });
    },
  },

  rain: {
    moving: true,
    setup(g, H) {
      const tints = [[226, 150, 80], [80, 160, 172], [204, 84, 72], [190, 180, 120]];
      // the lights of the city, out of focus through the glass
      return {
        lights: Array.from({ length: Math.round((g.w * H) / 7000) }, () => ({
          x: g.x + rand(0, 1) * g.w,
          y: rand(0.2, 1) * H,
          r: rand(8, 24),
          c: tints[Math.floor(Math.random() * tints.length)],
          p: rand(0, 6.28),
        })),
      };
    },
    colour(x, y, t, s, H) {
      let c = [7 + 6 * (y / H), 10 + 8 * (y / H), 20 + 12 * (y / H)];
      for (const l of s.lights) {
        const r = l.r * (1 + 0.06 * Math.sin(t * 0.7 + l.p));
        const q = ((x - l.x) ** 2 + (y - l.y) ** 2) / (r * r);
        if (q > 4) continue;
        const a = (q < 1 ? 0.55 : 0.55 * Math.exp(-(q - 1) * 2)) * 0.8;
        c = c.map((v, i) => mix(v, l.c[i], a));
      }
      return c;
    },
    ascii(ctx, t, s, H, fade, gutters) {
      for (const g of gutters) {
        // beads stuck to the glass
        for (let y = 0; y < H; y += CH * 2)
          for (let x = g.x; x < g.x + g.w; x += CW * 2) {
            const h = ihash(x, y);
            if (h > 0.05) continue;
            const f = fade(x);
            if (f > 0.05) stamp(ctx, h < 0.015 ? 'o' : '.', [170, 186, 214], 0.55 * f, x, y);
          }
        // drops running down, each leaving a short trail
        const n = Math.round(g.w / 9);
        for (let i = 0; i < n; i++) {
          const h1 = ihash(i, Math.round(g.x)), h2 = ihash(Math.round(g.x), i);
          const x = g.x + h1 * g.w + Math.sin(t * 0.6 + i) * 1.5;
          const f = fade(x);
          if (f < 0.05) continue;
          const speed = 30 + h2 * 90;
          const y = ((t * speed + h2 * 1000) % (H + 60)) - 30;
          for (let k = 0; k < 5; k++) stamp(ctx, k === 0 ? 'o' : k < 3 ? '|' : ':', [176, 196, 228], (0.8 - k * 0.15) * f, x, y - k * CH);
        }
      }
    },
  },

  books: {
    moving: false,
    setup(g, H) {
      const palette = [[120, 46, 40], [44, 70, 54], [150, 112, 54], [40, 52, 88], [96, 64, 92], [138, 120, 96], [70, 36, 30]];
      const rows = [];
      for (let top = 14; top < H; top += 104) {
        const books = [];
        for (let x = g.x + rand(0, 6); x < g.x + g.w; ) {
          const w = rand(6, 15);
          books.push({ x, w, top: top + rand(4, 24), c: palette[Math.floor(Math.random() * palette.length)], word: Math.random().toString(36).slice(2, 9).toUpperCase() });
          x += w + (Math.random() < 0.15 ? rand(4, 12) : 1);
        }
        rows.push({ shelf: top + 88, books });
      }
      return { rows, lamps: [{ x: g.x + g.w * 0.5, y: H * 0.15 }] };
    },
    colour(x, y, t, s) {
      // each margin has its own lamp
      const L = s.lamps.reduce((a, b) => (Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a));
      const light = 0.45 + 0.75 * Math.exp(-((x - L.x) ** 2 + (y - L.y) ** 2) / (2 * 260 * 260));
      let c = [18, 12, 9];
      for (const r of s.rows) {
        if (y >= r.shelf && y < r.shelf + 9) {
          c = y < r.shelf + 2 ? [92, 62, 38] : [52, 34, 20];
          break;
        }
        if (y >= r.shelf - 90 && y < r.shelf) {
          for (const b of r.books) {
            if (x < b.x || x >= b.x + b.w) continue;
            if (y < b.top) break;
            const across = (x - b.x) / b.w;
            const round = 0.6 + 0.5 * Math.sin(across * Math.PI);
            const band = (y - b.top > 6 && y - b.top < 9) || (r.shelf - y > 8 && r.shelf - y < 11);
            c = shadeOf(b.c, round * (band ? 1.5 : 1));
            break;
          }
          break;
        }
      }
      return shadeOf(c, light);
    },
    // a title stacked down each wider spine
    ascii(ctx, t, s, H, fade) {
      for (const r of s.rows)
        for (const b of r.books) {
          if (b.w < 9) continue;
          const x = b.x + b.w / 2 - CW / 2, f = fade(x);
          if (f < 0.05) continue;
          [...b.word].forEach((ch, i) => {
            const y = b.top + 14 + i * CH;
            if (y < r.shelf - 14) stamp(ctx, ch, [226, 206, 160], 0.6 * f, x, y);
          });
        }
    },
  },

  // Sprout: seedlings coming up out of the soil and growing, leaves opening on the way
  sprout: {
    moving: true,
    setup(g, H) {
      const n = Math.max(3, Math.round(g.w / 45));
      return {
        soil: H * 0.86,
        stems: Array.from({ length: n }, (_, i) => ({
          x: g.x + ((i + rand(0.2, 0.8)) / n) * g.w,
          h: rand(0.35, 0.75) * H,
          born: rand(0, 8),
          bend: rand(-1, 1),
          p: rand(0, 6.28),
        })),
      };
    },
    // a point up a stem, u from 0 (soil) to 1 (tip), and its sway
    at(st, u, t, ground) {
      const grown = Math.min(1, Math.max(0, (t - st.born) / 14));
      const y = ground - u * st.h * grown;
      const x = st.x + Math.sin(u * 2.2 + st.p) * 10 * st.bend * u + Math.sin(t * 0.5 + st.p) * 3 * u * u;
      return [x, y, grown];
    },
    colour(x, y, t, s, H) {
      const ground = s.soil;
      if (y > ground) {
        const grain = 0.8 + 0.3 * ihash(x >> 2, y >> 2);
        return shadeOf([46, 32, 22], grain * (1 - (y - ground) / (H - ground) * 0.5));
      }
      // light falling from above, a little greener near the ground
      const k = y / ground;
      return [5 + 6 * k, 10 + 14 * k + 6 * noise(x / 90, y / 140 + t * 0.02), 8 + 6 * k];
    },
    ascii(ctx, t, s, H, fade) {
      const ground = s.soil;
      for (const st of s.stems) {
        const f = fade(st.x);
        if (f < 0.05) continue;
        let prev = null;
        for (let u = 0; u <= 1; u += 0.02) {
          const [x, y, grown] = this.at(st, u, t, ground);
          if (grown === 0) break;
          const ch = prev ? (Math.abs(x - prev[0]) < 1.2 ? '|' : x > prev[0] ? '/' : '\\') : '|';
          stamp(ctx, ch, [96, 160, 78], 0.85 * f, x - CW / 2, y - CH / 2);
          prev = [x, y];
          // a pair of leaves every so often, opening as the stem grows past them
          const node = Math.round(u * 50);
          if (node % 7 === 3 && u < 0.9) {
            const open = Math.min(1, (st.h * grown * (1 - u)) / 40); // leaves near the tip are still unfurling
            stamp(ctx, '<', [130, 196, 96], 0.9 * f, x - CW * (1.2 + open), y - CH / 2);
            stamp(ctx, '>', [130, 196, 96], 0.9 * f, x + CW * (0.2 + open), y - CH / 2);
            if (open > 0.6) {
              stamp(ctx, '~', [110, 176, 84], 0.8 * f, x - CW * (2.2 + open), y - CH / 2);
              stamp(ctx, '~', [110, 176, 84], 0.8 * f, x + CW * (1.2 + open), y - CH / 2);
            }
          }
        }
        if (prev) stamp(ctx, '*', [190, 226, 130], f, prev[0] - CW / 2, prev[1] - CH);
        // roots in the soil
        for (let k = 1; k < 5; k++) stamp(ctx, k % 2 ? '/' : '\\', [110, 84, 60], 0.6 * f, st.x - CW / 2 + (k % 2 ? -k : k) * 2, ground + k * CH * 0.8);
      }
    },
  },

  // Flow: a calm stream running down the margin, currents drawn over it
  flow: {
    moving: true,
    setup() {
      return { seed: rand(0, 100) };
    },
    current(x, y, t, seed) {
      return Math.sin((y - t * 26) / 11 + noise(x / 50 + seed, y / 180) * 7);
    },
    colour(x, y, t, s) {
      const c = this.current(x, y, t, s.seed);
      const depth = noise(x / 120 + s.seed, y / 300 - t * 0.02);
      const base = [8 + 10 * depth, 22 + 28 * depth, 40 + 34 * depth];
      return c > 0.82 ? base.map((v) => v * 1.7 + 12) : base;
    },
    ascii(ctx, t, s, H, fade, gutters) {
      for (const g of gutters)
        for (let y = 0; y < H; y += CH)
          for (let x = g.x; x < g.x + g.w; x += CW) {
            const f = fade(x);
            if (f < 0.05) continue;
            const c = this.current(x, y, t, s.seed);
            if (c > 0.9 && ihash(x, y) < 0.5) stamp(ctx, '~', [150, 206, 222], 0.55 * f, x, y);
          }
    },
  },

  // Atmos: a city's air: haze over a skyline, particles drifting, sensors on the roofs
  air: {
    moving: true,
    setup(g, H) {
      const roofs = [];
      for (let x = g.x; x < g.x + g.w; ) {
        const w = rand(14, 34);
        roofs.push({ x, w, top: H - rand(60, 190), sensor: Math.random() < 0.35 });
        x += w + rand(1, 5);
      }
      return { roofs, motes: Array.from({ length: Math.round((g.w * H) / 1800) }, () => ({ gx: g.x, gw: g.w, x: Math.random() * g.w, y: Math.random() * H, s: rand(0.4, 1), p: rand(0, 6.28) })) };
    },
    colour(x, y, t, s, H) {
      for (const r of s.roofs)
        if (x >= r.x && x < r.x + r.w && y >= r.top) {
          const lit = ihash(Math.floor(x / 6), Math.floor(y / 8)) < 0.12 && (x - r.x) % 6 > 1 && (y - r.top) % 8 > 2;
          return lit ? [150, 120, 60] : [10, 12, 18];
        }
      // haze thickening toward the ground, warmer where the air is worse
      const k = y / H, smog = noise(x / 160 + t * 0.03, y / 120) * k;
      return [14 + 60 * smog, 16 + 40 * smog, 28 + 18 * smog];
    },
    ascii(ctx, t, s, H, fade) {
      for (const m of s.motes) {
        // drifting with the wind, wrapping round within its margin
        const x = m.gx + ((((m.x + t * 6 * m.s) % m.gw) + m.gw) % m.gw) + Math.sin(t * 0.3 + m.p) * 14;
        const y = m.y + Math.cos(t * 0.25 + m.p) * 10;
        const f = fade(x);
        if (f < 0.05) continue;
        stamp(ctx, m.s > 0.8 ? '*' : m.s > 0.55 ? '·' : '.', [214, 180, 130], (0.25 + 0.4 * m.s) * f, x, y);
      }
      for (const r of s.roofs) {
        if (!r.sensor) continue;
        const f = fade(r.x);
        const on = Math.sin(t * 2 + r.x) > 0.4;
        if (f > 0.05) stamp(ctx, '+', on ? [126, 220, 140] : [60, 100, 70], f, r.x + r.w / 2 - CW / 2, r.top - CH);
      }
    },
  },

  // Velora: a chart's dark grid, nothing plotted on it
  market: {
    moving: false,
    setup() {
      return {};
    },
    colour(x, y) {
      return x % 30 < 1 || y % 30 < 1 ? [18, 24, 38] : [8, 11, 20];
    },
    ascii() {},
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

    let started = false;
    const cancelIdle = whenIdle(() => {
      started = true;
      start();
    });
    document.fonts?.ready.then(() => started && start());
    window.addEventListener('resize', start);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelIdle();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', start);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [name]);

  return <canvas ref={ref} className="pond fixed inset-0 w-screen h-screen pointer-events-none" aria-hidden="true" />;
}
