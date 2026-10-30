'use client';

import { useEffect, useRef } from 'react';

// The background: a koi pond in the margins either side of the content column. The water
// is a dithered pixel layer (with lily pads, drifting petals and the fishes' shadows), and
// the koi and the ripples are drawn on top in ASCII. Only the margins are computed, since
// the column covers the rest. Paused while the tab is hidden; a still frame for reduced motion.

const P = 4; // css px per water pixel
const CW = 6; // ASCII cell, css px
const CH = 9;
const FPS = 30;
const RAMP = '.:;-=+*xzoIX#%&0@';
const RIPPLE = "~-=*!|:'v+";

const KINDS = [
  // kohaku: white with red patches
  { base: [236, 232, 222], patch: [232, 78, 48], patchAt: 0.15 },
  // ogon: gold
  { base: [232, 176, 64], patch: [250, 206, 110], patchAt: 0.7 },
  // orange
  { base: [242, 112, 44], patch: [252, 170, 90], patchAt: 0.55 },
  // showa: dark with red and white
  { base: [58, 56, 66], patch: [226, 84, 52], patchAt: 0.05 },
];

const rand = (a, b) => a + Math.random() * (b - a);
const hash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

function makeFish(g, kind) {
  const len = Math.max(80, Math.min(190, g.w * 0.7));
  const x = g.x + rand(0.3, 0.7) * g.w;
  const y = rand(0.15, 0.85) * g.h;
  const heading = rand(0, Math.PI * 2);
  const K = 16;
  const seg = len / K;
  return {
    g,
    kind: KINDS[kind % KINDS.length],
    len,
    seg,
    heading,
    speed: rand(14, 26),
    phase: rand(0, 100),
    spots: rand(0, 10),
    spine: Array.from({ length: K }, (_, i) => [x - Math.cos(heading) * seg * i, y - Math.sin(heading) * seg * i]),
  };
}

// half-width of the body at u (0 head, 1 tail tip)
function width(f, u) {
  const w = f.len * 0.13;
  if (u < 0.22) return w * (0.55 + 2 * u);
  if (u > 0.86) return w * (0.25 + (u - 0.86) * 9); // tail fin fans out
  return w * Math.pow((1 - u) / 0.78, 0.8) * 0.98 + w * 0.1;
}

function swim(f, t, dt) {
  const { g } = f;
  const [hx, hy] = f.spine[0];
  // wander, then turn back towards the middle of its margin when near an edge
  let turn = Math.sin(t * 0.4 + f.phase) * 0.5 + Math.sin(t * 0.13 + f.phase * 2) * 0.4;
  const m = Math.min(f.len * 0.6, g.w * 0.3);
  if (hx < g.x + m || hx > g.x + g.w - m || hy < m || hy > g.h - m) {
    const want = Math.atan2(g.h / 2 - hy, g.x + g.w / 2 - hx);
    let d = want - f.heading;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    turn += d * 2.2;
  }
  f.heading += turn * dt;
  const v = f.speed * (0.8 + 0.3 * Math.sin(t * 0.7 + f.phase));
  f.spine[0] = [hx + Math.cos(f.heading) * v * dt, hy + Math.sin(f.heading) * v * dt];
  // the body follows the head like a rope, with a swimming wiggle toward the tail
  for (let i = 1; i < f.spine.length; i++) {
    const [px, py] = f.spine[i - 1];
    const [cx, cy] = f.spine[i];
    const a = Math.atan2(cy - py, cx - px);
    f.spine[i] = [px + Math.cos(a) * f.seg, py + Math.sin(a) * f.seg];
  }
}

// spine with the swimming wave applied, for drawing
function body(f, t) {
  const n = f.spine.length;
  return f.spine.map(([x, y], i) => {
    const [ax, ay] = f.spine[Math.max(0, i - 1)];
    const [bx, by] = f.spine[Math.min(n - 1, i + 1)];
    const a = Math.atan2(by - ay, bx - ax);
    const u = i / (n - 1);
    const s = Math.sin(t * 5 + f.phase - u * 4) * f.len * 0.05 * u * u;
    return [x - Math.sin(a) * s, y + Math.cos(a) * s];
  });
}

export default function KoiPond() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const off = document.createElement('canvas');
    const octx = off.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W, H, gw, gh, img, gutters, fish, pads, petals, raf, last = 0, t = rand(0, 50);

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
      const left = col ? col.left : W / 2;
      const right = col ? col.right : W / 2;
      gutters = [
        { x: 0, w: left, h: H, edge: left, side: 'l' },
        { x: right, w: W - right, h: H, edge: right, side: 'r' },
      ].filter((g) => g.w >= 48);
      fish = gutters.flatMap((g, gi) =>
        Array.from({ length: g.w < 160 ? 1 : g.w < 320 ? 2 : 3 }, (_, i) => makeFish(g, gi * 2 + i))
      );
      pads = gutters.flatMap((g) =>
        Array.from({ length: 3 }, () => ({ g, x: g.x + rand(0.1, 0.9) * g.w, y: rand(0.05, 0.95) * H, r: rand(12, Math.min(34, g.w * 0.22)), a: rand(0, 6.28), da: rand(-0.04, 0.04), dx: rand(-2, 2), dy: rand(-2, 2) }))
      );
      petals = gutters.flatMap((g) =>
        Array.from({ length: Math.round((g.w * H) / 9000) }, () => ({ g, x: g.x + Math.random() * g.w, y: Math.random() * H, s: Math.random() < 0.3 ? 3 : 2, p: rand(0, 6.28), v: rand(2, 6) }))
      );
    };

    // darkens toward the column, so the pond fades out under the content
    const fade = (x) => {
      for (const g of gutters) if (x >= g.x && x < g.x + g.w) return Math.min(1, Math.abs(x - g.edge) / Math.min(110, g.w * 0.45)) ** 1.2;
      return 0;
    };

    const frame = (dt) => {
      t += dt;
      fish.forEach((f) => swim(f, t, dt));
      const bodies = fish.map((f) => body(f, t));

      // --- water, lily pads, petals and shadows, in the pixel layer
      const d = img.data;
      d.fill(0);
      for (const g of gutters) {
        const x0 = Math.floor(g.x / P), x1 = Math.ceil((g.x + g.w) / P);
        for (let py = 0; py < gh; py++) {
          for (let px = x0; px < x1; px++) {
            const x = px * P, y = py * P;
            const n =
              Math.sin(x * 0.012 + t * 0.35) * Math.sin(y * 0.016 - t * 0.25) +
              Math.sin((x + y) * 0.008 + t * 0.2) * 0.6 +
              Math.sin(x * 0.03 - y * 0.02 + t * 0.6) * 0.25;
            let b = 0.5 + n * 0.28;
            if ((px + py) & 1) b *= 0.72; // checker dither
            const k = fade(x);
            const teal = 0.5 + 0.5 * Math.sin(x * 0.006 - y * 0.01 + t * 0.1);
            const i = (py * gw + px) * 4;
            d[i] = (10 + 22 * b) * k;
            d[i + 1] = (22 + (44 + 30 * teal) * b) * k;
            d[i + 2] = (48 + 92 * b) * k;
            d[i + 3] = 255;
          }
        }
      }
      const blend = (px, py, rgb, a) => {
        if (px < 0 || py < 0 || px >= gw || py >= gh) return;
        const i = (py * gw + px) * 4;
        if (!d[i + 3]) return;
        const k = fade(px * P);
        for (let c = 0; c < 3; c++) d[i + c] = d[i + c] * (1 - a) + rgb[c] * k * a;
      };
      // shadows under the fish
      bodies.forEach((pts, fi) => {
        const f = fish[fi];
        pts.forEach(([x, y], i) => {
          const r = width(f, i / (pts.length - 1)) / P + 1;
          const cx = (x + 6) / P, cy = (y + 9) / P;
          for (let yy = Math.floor(cy - r); yy <= cy + r; yy++)
            for (let xx = Math.floor(cx - r); xx <= cx + r; xx++)
              if ((xx - cx) ** 2 + (yy - cy) ** 2 <= r * r) blend(xx, yy, [2, 6, 16], 0.08);
        });
      });
      // lily pads: a disc with a notch, soft at the edge
      for (const p of pads) {
        p.x += p.dx * dt;
        p.y += p.dy * dt;
        p.a += p.da * dt;
        if (p.y < -p.r) p.y = H + p.r;
        if (p.y > H + p.r) p.y = -p.r;
        if (p.x < p.g.x - p.r || p.x > p.g.x + p.g.w + p.r) p.dx *= -1;
        const r = p.r / P;
        const cx = p.x / P, cy = p.y / P;
        for (let yy = Math.floor(cy - r); yy <= cy + r; yy++)
          for (let xx = Math.floor(cx - r); xx <= cx + r; xx++) {
            const dist = Math.hypot(xx - cx, yy - cy);
            if (dist > r) continue;
            let ang = Math.atan2(yy - cy, xx - cx) - p.a;
            ang = Math.atan2(Math.sin(ang), Math.cos(ang));
            if (Math.abs(ang) < 0.32 && dist > r * 0.15) continue;
            const edge = Math.min(1, (r - dist) / 3.5);
            const lit = 1 - dist / r;
            blend(xx, yy, [38 + 50 * lit, 104 + 70 * lit, 46 + 30 * lit], 0.7 * edge);
          }
      }
      // petals: small gold squares drifting on the surface
      for (const p of petals) {
        p.y += p.v * dt * 0.4;
        p.x += Math.sin(t * 0.5 + p.p) * dt * 3;
        if (p.y > H) p.y = -4;
        const px = Math.floor(p.x / P), py = Math.floor(p.y / P);
        const shine = 0.75 + 0.25 * Math.sin(t * 1.3 + p.p);
        for (let yy = 0; yy < p.s; yy++) for (let xx = 0; xx < p.s; xx++) blend(px + xx, py + yy, [214 * shine, 168 * shine, 72 * shine], 0.95);
      }
      octx.putImageData(img, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, gw * P, gh * P);

      // --- ripples and koi, in ASCII
      ctx.font = `700 ${CH}px "JetBrains Mono", monospace`;
      ctx.textBaseline = 'top';
      for (const g of gutters) {
        for (let cy = 0; cy < H / CH; cy++) {
          for (let cx = Math.floor(g.x / CW); cx < (g.x + g.w) / CW; cx++) {
            const h = hash(cx, cy);
            if (h > 0.22) continue;
            const r = Math.sin(cx * 0.31 + t * 0.9) * Math.sin(cy * 0.47 - t * 0.6) + Math.sin((cx + cy) * 0.17 + t * 0.5) * 0.7;
            if (r < 0.95) continue;
            const k = fade(cx * CW);
            ctx.fillStyle = `rgba(140, 188, 236, ${(0.18 + (r - 0.95) * 0.5) * k})`;
            ctx.fillText(RIPPLE[Math.floor(h * 45) % RIPPLE.length], cx * CW, cy * CH);
          }
        }
      }
      bodies.forEach((pts, fi) => {
        const f = fish[fi];
        const n = pts.length;
        const pad = f.len * 0.2;
        const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
        const bx0 = Math.floor((Math.min(...xs) - pad) / CW), bx1 = Math.ceil((Math.max(...xs) + pad) / CW);
        const by0 = Math.floor((Math.min(...ys) - pad) / CH), by1 = Math.ceil((Math.max(...ys) + pad) / CH);
        for (let cy = by0; cy <= by1; cy++) {
          for (let cx = bx0; cx <= bx1; cx++) {
            const x = cx * CW + CW / 2, y = cy * CH + CH / 2;
            // nearest point on the spine: distance, position along the body, and which side
            let best = Infinity, bu = 0;
            for (let i = 0; i < n - 1; i++) {
              const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
              const vx = bx - ax, vy = by - ay;
              const s = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
              const dd = Math.hypot(x - ax - vx * s, y - ay - vy * s);
              if (dd < best) {
                best = dd;
                bu = (i + s) / (n - 1);
              }
            }
            let w = width(f, bu);
            // pectoral fins, just behind the head
            if (bu > 0.2 && bu < 0.34) w *= 1.55;
            if (best > w) continue;
            const k = fade(x);
            if (k < 0.05) continue;
            const depth = 1 - best / w;
            const fin = bu > 0.86 || (bu > 0.2 && bu < 0.34 && best > w / 1.55);
            const patch = Math.sin(bu * 11 + f.spots) + Math.sin(bu * 5 - f.spots * 1.7 + best * 0.08) * 0.6 > 1 - f.kind.patchAt * 2;
            const rgb = patch && !fin ? f.kind.patch : f.kind.base;
            const ch = fin ? "~'`"[Math.floor(hash(cx, cy) * 3)] : RAMP[Math.min(RAMP.length - 1, Math.floor(depth * RAMP.length * 1.15))];
            const a = (fin ? 0.55 : 0.75 + depth * 0.25) * k;
            ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
            ctx.fillText(ch, cx * CW, cy * CH);
          }
        }
      });
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

    // the column's position decides the margins; fonts change the ASCII metrics
    document.fonts?.ready.then(start);
    start();
    window.addEventListener('resize', start);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', start);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="pond fixed inset-0 w-screen h-screen pointer-events-none" aria-hidden="true" />;
}
