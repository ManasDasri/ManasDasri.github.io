'use client';

import { useEffect, useRef } from 'react';

// The background: a koi pond in the margins either side of the content column. The water
// is a pixel layer, ordered-dithered to a few levels (with blurred lily pads, a pale
// reflection and the fishes' shadows). The koi, their wakes and the ripples are dense ASCII
// on top. Toward the column it fades into the page's own background colour, so there's no
// seam. Only the margins are computed, since the column covers the rest. Paused while the
// tab is hidden; a still frame for reduced motion.

const P = 4; // css px per water pixel
const CW = 5; // ASCII cell, css px
const CH = 8;
const FPS = 30;
export const KOI_FONT = `700 ${CH}px "JetBrains Mono", monospace`;
const STEP = 20; // colour quantisation step for the dither
const BODY = ':;~=+*ixzoIX%#&0@'; // edge to core
const WAKE = "~-=+:!'`";
const FIN = ":;!'~";
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

const rand = (a, b) => a + Math.random() * (b - a);
const ihash = (x, y) => {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
// smooth value noise in [0, 1]
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = ihash(xi, yi), b = ihash(xi + 1, yi), c = ihash(xi, yi + 1), d = ihash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const mix = (a, b, t) => a + (b - a) * t;

// CSS hue-rotate() as a colour matrix, applied to one [r, g, b]
function hueRotate([r, g, b], rad) {
  const c = Math.cos(rad), s = Math.sin(rad);
  return [
    (0.213 + 0.787 * c - 0.213 * s) * r + (0.715 - 0.715 * c - 0.715 * s) * g + (0.072 - 0.072 * c + 0.928 * s) * b,
    (0.213 - 0.213 * c + 0.143 * s) * r + (0.715 + 0.285 * c + 0.14 * s) * g + (0.072 - 0.072 * c - 0.283 * s) * b,
    (0.213 - 0.213 * c - 0.787 * s) * r + (0.715 - 0.715 * c + 0.715 * s) * g + (0.072 + 0.928 * c + 0.072 * s) * b,
  ].map((v) => Math.max(0, Math.min(255, v)));
}

// water colour ramps, dark to light: deep blue, and the teal it shifts to in places
const NAVY = [[3, 6, 16], [10, 18, 46], [20, 36, 82], [34, 58, 120], [58, 92, 158]];
const TEAL = [[3, 10, 14], [10, 32, 40], [18, 58, 64], [32, 88, 90], [60, 124, 120]];
const ramp = (r, l) => {
  const s = Math.max(0, Math.min(0.999, l)) * (r.length - 1);
  const i = Math.floor(s), f = s - i;
  return [mix(r[i][0], r[i + 1][0], f), mix(r[i][1], r[i + 1][1], f), mix(r[i][2], r[i + 1][2], f)];
};

const KOI = [
  { base: [238, 228, 208], patch: [230, 92, 54], amount: 0.6 }, // kohaku
  { base: [240, 232, 214], patch: [236, 108, 56], amount: 0.45 },
  { base: [232, 104, 56], patch: [244, 214, 186], amount: 0.3 }, // orange with pale patches
];

export function makeFish(g, i) {
  const len = Math.max(130, Math.min(300, g.w * 1.25));
  const x = g.x + rand(0.3, 0.7) * g.w;
  const y = rand(0.15, 0.85) * g.h;
  const heading = rand(0, Math.PI * 2);
  const K = 18;
  const seg = len / K;
  return {
    g,
    kind: KOI[i % KOI.length],
    len,
    seg,
    heading,
    speed: rand(10, 18),
    phase: rand(0, 100),
    spots: rand(0, 50),
    spine: Array.from({ length: K }, (_, j) => [x - Math.cos(heading) * seg * j, y - Math.sin(heading) * seg * j]),
  };
}

// half-width of the body at u (0 head, 1 tail tip)
function width(f, u) {
  const w = f.len * 0.15;
  if (u < 0.18) return w * (0.45 + 3 * u);
  if (u > 0.84) return w * (0.2 + (u - 0.84) * 7);
  return w * (0.99 - 0.82 * ((u - 0.18) / 0.66) ** 1.3);
}

export function swim(f, t, dt) {
  const { g } = f;
  const [hx, hy] = f.spine[0];
  let turn = Math.sin(t * 0.3 + f.phase) * 0.35 + Math.sin(t * 0.11 + f.phase * 2) * 0.3;
  const m = Math.min(f.len * 0.5, g.w * 0.35);
  if (hx < g.x + m || hx > g.x + g.w - m || hy < m || hy > g.h - m) {
    const want = Math.atan2(g.h / 2 - hy, g.x + g.w / 2 - hx);
    const d = Math.atan2(Math.sin(want - f.heading), Math.cos(want - f.heading));
    turn += d * 1.6;
  }
  f.heading += turn * dt;
  const v = f.speed * (0.75 + 0.35 * Math.sin(t * 0.5 + f.phase));
  f.spine[0] = [hx + Math.cos(f.heading) * v * dt, hy + Math.sin(f.heading) * v * dt];
  for (let i = 1; i < f.spine.length; i++) {
    const [px, py] = f.spine[i - 1];
    const [cx, cy] = f.spine[i];
    const a = Math.atan2(cy - py, cx - px);
    f.spine[i] = [px + Math.cos(a) * f.seg, py + Math.sin(a) * f.seg];
  }
}

// the spine with the swimming wave applied
export function body(f, t) {
  const n = f.spine.length;
  return f.spine.map(([x, y], i) => {
    const [ax, ay] = f.spine[Math.max(0, i - 1)];
    const [bx, by] = f.spine[Math.min(n - 1, i + 1)];
    const a = Math.atan2(by - ay, bx - ax);
    const u = i / (n - 1);
    const s = Math.sin(t * 3.2 + f.phase - u * 3.5) * f.len * 0.045 * u * u;
    return [x - Math.sin(a) * s, y + Math.cos(a) * s];
  });
}

// One koi in ASCII: the body shaded edge to core with its patches, translucent fins, and a
// faint wake. fade(x) scales its opacity (0 hides it). Set ctx.font to KOI_FONT first.
export function drawKoi(ctx, f, pts, fade) {
  const n = pts.length;
  const pad = f.len * 0.3;
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const bx0 = Math.floor((Math.min(...xs) - pad) / CW), bx1 = Math.ceil((Math.max(...xs) + pad) / CW);
  const by0 = Math.floor((Math.min(...ys) - pad) / CH), by1 = Math.ceil((Math.max(...ys) + pad) / CH);
  for (let cy = by0; cy <= by1; cy++) {
    for (let cx = bx0; cx <= bx1; cx++) {
      const x = cx * CW + CW / 2, y = cy * CH + CH / 2;
      const k = fade(x);
      if (k < 0.05) continue;
      // nearest point on the spine: distance, position along the body, and which side
      let best = Infinity, bu = 0, side = 0;
      for (let i = 0; i < n - 1; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
        const vx = bx - ax, vy = by - ay;
        const s = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
        const ex = x - ax - vx * s, ey = y - ay - vy * s;
        const dd = Math.hypot(ex, ey);
        if (dd < best) {
          best = dd;
          bu = (i + s) / (n - 1);
          side = Math.sign(vx * ey - vy * ex);
        }
      }
      const w = width(f, bu);
      const finW = bu > 0.16 && bu < 0.32 ? w * 1.75 : bu > 0.84 ? w * 1.5 : w;
      const h = ihash(cx, cy);
      let ch, rgb, a;
      if (best <= w) {
        const depth = 1 - best / w;
        const patch = noise(bu * 3.2 + f.spots, side * 0.8 + best * 0.03 + f.spots * 0.3) > 1 - f.kind.amount;
        const c = patch ? f.kind.patch : f.kind.base;
        const shade = 0.5 + 0.5 * depth ** 0.7;
        rgb = [c[0] * shade, c[1] * shade, c[2] * shade];
        ch = BODY[Math.min(BODY.length - 1, Math.floor((depth * 0.85 + h * 0.15) * BODY.length))];
        a = 0.95;
      } else if (best <= finW) {
        rgb = bu > 0.84 ? f.kind.patch : f.kind.base;
        ch = FIN[Math.floor(h * FIN.length)];
        a = 0.5 * (1 - (best - w) / (finW - w));
      } else if (best <= finW + 9 && h < 0.7) {
        rgb = [120, 186, 214];
        ch = WAKE[Math.floor(h * 11) % WAKE.length];
        a = 0.4 * (1 - (best - finW) / 9);
      } else continue;
      ctx.fillStyle = `rgba(${rgb[0] | 0}, ${rgb[1] | 0}, ${rgb[2] | 0}, ${a * k})`;
      ctx.fillText(ch, cx * CW, cy * CH);
    }
  }
}

export default function KoiPond() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const off = document.createElement('canvas');
    const octx = off.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W, H, gw, gh, img, gutters, fish, pads, glows, ink, raf, last = 0, t = rand(0, 500);

    // The page's background as it appears on screen, for the pond to fade into. The pond
    // cancels the page's time-of-day hue shift (globals.css) so the koi keep their colours,
    // so the shift is applied to this colour here instead. Read again every second, which
    // follows theme switches and the drifting hue without restarting the pond.
    const readInk = () => {
      const css = getComputedStyle(document.documentElement);
      const v = css.getPropertyValue('--c-ink').trim().split(/\s+/).map(Number);
      const hue = parseFloat(css.getPropertyValue('--hue')) || 0;
      ink = hueRotate(v.length === 3 && v.every((n) => n >= 0) ? v : [0, 0, 0], (hue * Math.PI) / 180);
    };
    let inkAt = 0;

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
      readInk();
      const col = document.getElementById('main')?.getBoundingClientRect();
      const left = col ? col.left : W / 2;
      const right = col ? col.right : W / 2;
      gutters = [
        { x: 0, w: left, h: H, edge: left },
        { x: right, w: W - right, h: H, edge: right },
      ].filter((g) => g.w >= 48);
      fish = gutters.flatMap((g, gi) => Array.from({ length: g.w < 260 ? 1 : g.w < 520 ? 2 : 3 }, (_, i) => makeFish(g, gi + i * 2)));
      pads = gutters.flatMap((g) =>
        Array.from({ length: 2 + Math.floor(H / 500) }, () => ({ x: g.x + rand(0.15, 0.85) * g.w, y: rand(0, H), r: rand(18, 34), a: rand(0, 6.28), dx: rand(-1.5, 1.5), dy: rand(-1.5, 1.5), lit: rand(0.3, 1) }))
      );
      glows = gutters.map((g) => ({ x: g.x + rand(0.3, 0.7) * g.w, y: rand(0.1, 0.5) * H, r: rand(24, 34), p: rand(0, 6.28) }));
    };

    // 0 at the column's edge, 1 well into the margin: the pond fades into the page there
    const fade = (x) => {
      for (const g of gutters) if (x >= g.x && x < g.x + g.w) return Math.min(1, Math.abs(x - g.edge) / Math.min(120, g.w * 0.5)) ** 1.5;
      return 0;
    };

    const frame = (dt) => {
      t += dt;
      if (t - inkAt > 1) {
        inkAt = t;
        readInk();
      }
      fish.forEach((f) => swim(f, t, dt));
      const bodies = fish.map((f) => body(f, t));
      for (const p of pads) {
        p.x += p.dx * dt;
        p.y += p.dy * dt;
        p.a += 0.02 * dt;
        if (p.y < -p.r * 2) p.y = H + p.r;
        if (p.y > H + p.r * 2) p.y = -p.r;
      }
      // --- the water: continuous colour, then ordered dither
      const d = img.data;
      d.fill(0);
      // a few circles along each fish, offset down and right, for its shadow
      const shadows = bodies.flatMap((pts, fi) =>
        pts.filter((_, i) => i % 2 === 0).map(([x, y], j) => [x + 9, y + 12, width(fish[fi], (j * 2) / (pts.length - 1)) + 4])
      );
      for (const g of gutters) {
        const x0 = Math.floor(g.x / P), x1 = Math.ceil((g.x + g.w) / P);
        for (let py = 0; py < gh; py++) {
          for (let px = x0; px < x1; px++) {
            const x = px * P, y = py * P;
            const k = fade(x);
            const i = (py * gw + px) * 4;
            d[i + 3] = 255;
            if (k < 0.02) {
              d[i] = ink[0];
              d[i + 1] = ink[1];
              d[i + 2] = ink[2];
              continue;
            }
            const l =
              noise(x / 150 + t * 0.015, y / 230 - t * 0.012) * 0.55 +
              noise(x / 40 - t * 0.04, y / 64 + t * 0.03) * 0.28 +
              noise(x / 26 + 9, y / 420 + t * 0.01) * 0.25;
            const tl = noise(x / 210 + 40, y / 190 + t * 0.008);
            // teal in places, checkered where it meets the blue
            const teal = tl > 0.55 || (tl > 0.45 && (px + py) & 1);
            let [r, gr, b] = ramp(teal ? TEAL : NAVY, l * 0.95 - 0.08);
            // the pale reflection
            for (const o of glows) {
              const q = ((x - o.x) ** 2 + (y - o.y - Math.sin(t * 0.2 + o.p) * 8) ** 2) / (o.r * o.r);
              if (q < 4) {
                const a = Math.exp(-q * 1.6) * 0.6;
                r = mix(r, 120, a);
                gr = mix(gr, 134, a);
                b = mix(b, 160, a);
              }
            }
            // lily pads: blurred discs with a notch, lighter where the light catches them
            for (const p of pads) {
              const dx = x - p.x, dy = y - p.y;
              const q = (dx * dx + dy * dy) / (p.r * p.r);
              if (q > 2.2) continue;
              const ang = Math.atan2(dy, dx) - p.a;
              const notch = Math.abs(Math.atan2(Math.sin(ang), Math.cos(ang))) < 0.3 && q > 0.05 ? 0.25 : 1;
              const a = Math.exp(-q * q * 1.4) * 0.92 * notch;
              const lit = p.lit * Math.exp((-((dx + p.r * 0.3) ** 2 + (dy + p.r * 0.3) ** 2) / (p.r * p.r)) * 2);
              r = mix(r, 22 + 40 * lit, a);
              gr = mix(gr, 62 + 110 * lit, a);
              b = mix(b, 30 + 36 * lit, a);
            }
            for (const [sx, sy, sr] of shadows) {
              const q = ((x - sx) ** 2 + (y - sy) ** 2) / (sr * sr);
              if (q < 1) {
                const a = (1 - q) * 0.3;
                r *= 1 - a;
                gr *= 1 - a;
                b *= 1 - a;
              }
            }
            const th = BAYER[(py & 3) * 4 + (px & 3)];
            // dither the water, then fade it into the page colour
            d[i] = mix(ink[0], Math.floor((r * 0.78) / STEP + th) * STEP, k);
            d[i + 1] = mix(ink[1], Math.floor((gr * 0.78) / STEP + th) * STEP, k);
            d[i + 2] = mix(ink[2], Math.floor((b * 0.78) / STEP + th) * STEP, k);
          }
        }
      }
      octx.putImageData(img, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, gw * P, gh * P);

      // --- ASCII: sparse ripples, then the koi and their wakes
      ctx.font = KOI_FONT;
      ctx.textBaseline = 'top';
      for (const g of gutters) {
        for (let cy = 0; cy < H / CH; cy++) {
          for (let cx = Math.floor(g.x / CW); cx < (g.x + g.w) / CW; cx++) {
            const h = ihash(cx, cy);
            if (h > 0.1) continue;
            const r = noise(cx * 0.12 + t * 0.25, cy * 0.2 - t * 0.2);
            if (r < 0.62) continue;
            const k = fade(cx * CW);
            ctx.fillStyle = `rgba(120, 186, 214, ${(r - 0.62) * 1.1 * k})`;
            ctx.fillText(WAKE[Math.floor(h * 80) % WAKE.length], cx * CW, cy * CH);
          }
        }
      }
      bodies.forEach((pts, fi) => drawKoi(ctx, fish[fi], pts, fade));
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
      if (still) {
        for (let i = 0; i < 40; i++) frame(1 / FPS); // let the fish settle into a pose
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    // a theme switch only changes the colour the pond fades into: redraw with it straight
    // away (inside the switch's view transition, so the new snapshot has it), fish in place
    const onTheme = () => {
      readInk();
      if (gutters.length) frame(0);
    };

    // the column's position decides the margins; the font changes the ASCII metrics
    document.fonts?.ready.then(start);
    start();
    window.addEventListener('resize', start);
    window.addEventListener('theme-change', onTheme);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', start);
      window.removeEventListener('theme-change', onTheme);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="pond fixed inset-0 w-screen h-screen pointer-events-none" aria-hidden="true" />;
}
