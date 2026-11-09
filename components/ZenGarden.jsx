'use client';

import { useEffect, useRef } from 'react';
import { cssColor } from '@/lib/themes';
import { ihash, makeStamper, motionPaused, noise, rand, whenIdle } from './KoiPond';

// The header: a dry garden in ASCII, seen from above. Raked gravel runs in long shallow
// waves and rings round three stones and a still pool; the grooves are drawn as strokes in
// the direction the rake went. The gravel and stones are drawn once; only the pool moves:
// its surface drifts, a leaf falls in now and then, and moving the cursor over the water
// sends out a slow ripple (at most one every couple of seconds, so it stays calm). Paused
// while out of view or the tab is hidden; a still frame for reduced motion.

const CW = 5; // ASCII cell, css px
const CH = 8;
const FPS = 24;
const FONT = `400 ${CH}px "Space Mono", monospace`;
const LINE = ['-', '\\', '|', '/'];
const lineChar = (a) => LINE[((Math.round(a / (Math.PI / 4)) % 4) + 4) % 4];
const SAND = [218, 208, 186];
const STONE = [158, 164, 178];
const MOSS = [104, 156, 98];
const WATER = [52, 108, 150];
const FOAM = [160, 214, 228];
const PAD = [76, 146, 88];
const LOTUS = [244, 164, 182];
const GROOVE = 2 * CH; // the rake's tine spacing
const stamp = typeof document === 'undefined' ? null : makeStamper(FONT, CW, CH);

export default function ZenGarden() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const bg = document.createElement('canvas');
    const bctx = bg.getContext('2d');
    let W, H, stones, pool, pads, ring, raf, last = 0, t = 0;
    let ripples = [], leaves = [], nextLeaf = 3, nextRipple = 0;
    let still = motionPaused(), inView = true, ready = false;

    // How far (x, y) is outside an obstacle's edge: negative inside. Edges are irregular,
    // from noise round the outline; stones are squashed a little, as if seen at an angle.
    const outline = (o, x, y) => {
      const dx = (x - o.x) / o.rx, dy = (y - o.y) / o.ry;
      const a = Math.atan2(dy, dx);
      const edge = 1 + o.rough * (noise(Math.cos(a) * 1.6 + o.seed, Math.sin(a) * 1.6 + o.seed * 3) - 0.5);
      return (Math.hypot(dx, dy) - edge) * Math.min(o.rx, o.ry);
    };

    const setup = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const box = canvas.getBoundingClientRect();
      W = box.width;
      H = box.height;
      for (const c of [canvas, bg]) {
        c.width = W * dpr;
        c.height = H * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // three stones grouped on the left, a pool on the right; the name sits bottom left,
      // where the gravel is plain
      const u = Math.min(W, H * 2.2);
      stones = [
        { x: W * 0.17, y: H * 0.3, rx: u * 0.07, ry: u * 0.058, rough: 0.28, seed: 3 },
        { x: W * 0.275, y: H * 0.45, rx: u * 0.04, ry: u * 0.034, rough: 0.3, seed: 11 },
        { x: W * 0.48, y: H * 0.22, rx: u * 0.03, ry: u * 0.026, rough: 0.32, seed: 23 },
      ];
      pool = { x: W * 0.76, y: H * 0.4, rx: Math.min(W * 0.17, u * 0.2), ry: H * 0.27, rough: 0.22, seed: 41, pool: true };
      ring = GROOVE * 3; // three rings // how far the rings round each obstacle reach
      pads = [
        { x: pool.x - pool.rx * 0.42, y: pool.y - pool.ry * 0.25, r: 15, a: 0.6, lotus: true },
        { x: pool.x + pool.rx * 0.35, y: pool.y + pool.ry * 0.3, r: 12, a: 2.4 },
        { x: pool.x + pool.rx * 0.1, y: pool.y - pool.ry * 0.5, r: 9, a: 4.1 },
      ];
      ripples = [];
      leaves = [];
      drawGravel();
    };

    // the still part, drawn once: gravel, the stones, and the pebbles round the pool
    const drawGravel = () => {
      bctx.clearRect(0, 0, W, H);
      const obstacles = [...stones, pool];
      for (let cy = 0; cy * CH < H; cy++) {
        for (let cx = 0; cx * CW < W; cx++) {
          const x = cx * CW + CW / 2, y = cy * CH + CH / 2;
          const h = ihash(cx, cy);
          let near = null, d = Infinity;
          for (const o of obstacles) {
            const od = outline(o, x, y);
            if (od < d) (d = od), (near = o);
          }
          if (near.pool && d < 0) continue; // the water, drawn each frame
          if (d < 0) {
            drawStone(near, x, y, d, h, cx, cy);
            continue;
          }
          // a little bare ground where the gravel meets a stone
          if (!near.pool && d < 3) continue;
          if (near.pool && d < CW * 1.2) {
            // pebbles edging the pool
            if (h < 0.75) stamp(bctx, h < 0.4 ? 'o' : '0', STONE.map((v) => v * (0.55 + h * 0.4)), 0.8, cx * CW, cy * CH);
            continue;
          }
          let phase, along;
          if (d < ring) {
            // rings round the obstacle: follow its outline
            phase = d + GROOVE * 0.25;
            const gx = outline(near, x + 1, y) - outline(near, x - 1, y);
            const gy = outline(near, x, y + 1) - outline(near, x, y - 1);
            along = Math.atan2(gy, gx) + Math.PI / 2;
          } else {
            // the open gravel: long shallow waves across the garden
            const k = 2 * Math.PI / (W * 0.55);
            phase = y + Math.sin(x * k + 1) * GROOVE * 0.45;
            along = Math.atan(Math.cos(x * k + 1) * GROOVE * 0.45 * k);
          }
          // the stones' shadows fall on the gravel, down and to the right
          const shadow = stones.some((o) => outline(o, x - o.rx * 0.35, y - o.ry * 0.45) < 0) ? 0.45 : 1;
          const f = (((phase / GROOVE) % 1) + 1) % 1;
          if (f < 0.36) {
            // a groove: a stroke along the rake's path, a little uneven
            stamp(bctx, lineChar(along), SAND, (0.2 + h * 0.1) * shadow, cx * CW, cy * CH);
          } else if (h < 0.2) {
            // the ridge between grooves: loose grains
            stamp(bctx, h < 0.07 ? ',' : '.', SAND, 0.16 * shadow, cx * CW, cy * CH);
          }
        }
      }
    };

    // a stone: lit from the upper left, darker and mossy toward its foot
    const drawStone = (s, x, y, d, h, cx, cy) => {
      // a rounded boulder: its surface normal from where the point sits in the outline
      const depth = Math.min(1, -d / (Math.min(s.rx, s.ry) * 0.9));
      const nx = (x - s.x) / s.rx, ny = (y - s.y) / s.ry;
      const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, (1 - depth) ** 2)));
      const lit = Math.max(0, -nx * 0.5 - ny * 0.6 + nz * 0.65);
      const grain = noise(x / 5 + s.seed, y / 4);
      const shade = Math.max(0, Math.min(1, 0.12 + 0.85 * lit + (grain - 0.5) * 0.3));
      const moss = depth < 0.4 && ny > 0.1 && noise(x / 8 + s.seed * 2, y / 6) > 0.5;
      const ch = moss ? (h < 0.5 ? '*' : ':') : '.:-=+*x#%&8'[Math.min(10, Math.floor(shade * 11))];
      const c = moss ? MOSS : STONE;
      stamp(bctx, ch, c.map((v) => v * (0.35 + shade * 0.75)), 0.95, cx * CW, cy * CH);
    };

    // the pool, each frame: a slowly drifting surface, the pads on it, ripples and leaves
    const drawPool = () => {
      const x0 = Math.floor((pool.x - pool.rx * 1.2) / CW), x1 = Math.ceil((pool.x + pool.rx * 1.2) / CW);
      const y0 = Math.max(0, Math.floor((pool.y - pool.ry * 1.2) / CH)), y1 = Math.ceil((pool.y + pool.ry * 1.2) / CH);
      for (let cy = y0; cy <= y1 && cy * CH < H; cy++) {
        for (let cx = x0; cx <= x1; cx++) {
          const x = cx * CW + CW / 2, y = cy * CH + CH / 2;
          const d = outline(pool, x, y);
          if (d >= 0) continue;
          const h = ihash(cx, cy);
          // lily pads: discs with a notch cut to the centre
          const pad = pads.find((p) => (x - p.x) ** 2 + ((y - p.y) * 1.3) ** 2 < p.r * p.r);
          if (pad) {
            const ang = Math.atan2(y - pad.y, x - pad.x) - pad.a;
            if (Math.abs(Math.atan2(Math.sin(ang), Math.cos(ang))) > 0.35) {
              const flower = pad.lotus && (x - pad.x) ** 2 + (y - pad.y) ** 2 < 40;
              stamp(ctx, flower ? '*' : h < 0.5 ? '@' : '%', flower ? LOTUS : PAD.map((v) => v * (0.8 + h * 0.3)), 0.9, cx * CW, cy * CH);
              continue;
            }
          }
          const edge = Math.min(1, -d / 14);
          let l = noise(x / 46 + t * 0.05, y / 18 - t * 0.03) * 0.7 + noise(x / 15 - t * 0.09, y / 9) * 0.3;
          let ch = l > 0.62 ? '~' : l > 0.48 ? '-' : l > 0.4 ? '.' : ' ';
          // ripples: a bright ring travelling out, fading as it grows
          for (const r of ripples) {
            const rr = Math.hypot(x - r.x, (y - r.y) * 1.35);
            const on = 1 - Math.abs(rr - r.age * 18) / 4;
            if (on > 0) {
              l += on * r.a * (1 - r.age / r.life);
              ch = lineChar(Math.atan2(y - r.y, x - r.x) + Math.PI / 2);
            }
          }
          if (ch === ' ') continue;
          const c = WATER.map((v, i) => v + (FOAM[i] - v) * Math.min(1, Math.max(0, (l - 0.4) * 1.6)));
          stamp(ctx, ch, c, (0.35 + l * 0.6) * (0.4 + 0.6 * edge), cx * CW, cy * CH);
        }
      }
    };

    // now and then a leaf falls, swaying, in the accent colour; if it lands on the water it
    // ripples and floats a while, on the gravel it just rests and fades
    const leafColour = () => (cssColor('signal').match(/\d+/g) || [240, 122, 74]).map(Number);
    const dropLeaf = () => {
      const tx = rand(0.35, 0.95) * W, ty = rand(0.15, 0.7) * H;
      leaves.push({ x0: tx + rand(-60, 60), tx, ty, t0: t, fall: rand(5, 7), rgb: leafColour(), seed: rand(0, 6) });
    };
    const drawLeaves = () => {
      leaves = leaves.filter((l) => t - l.t0 < l.fall + 6);
      for (const l of leaves) {
        const p = Math.min(1, (t - l.t0) / l.fall);
        let x = l.x0 + (l.tx - l.x0) * p + Math.sin((t - l.t0) * 1.6 + l.seed) * 14 * (1 - p);
        const y = -10 + (l.ty + 10) * p;
        if (p === 1 && !l.landed) {
          l.landed = true;
          l.wet = outline(pool, l.tx, l.ty) < 0;
          if (l.wet) ripples.push({ x: l.tx, y: l.ty, age: 0, life: 4, a: 0.7 });
        }
        if (l.wet) x += Math.sin((t - l.t0) * 0.3) * 3; // drifting on the water
        const a = p < 1 ? 0.95 : 0.95 * (1 - (t - l.t0 - l.fall) / 6);
        stamp(ctx, p < 1 && Math.sin((t - l.t0) * 3 + l.seed) > 0 ? '<' : '*', l.rgb, Math.max(0, a), x - CW / 2, y - CH / 2);
      }
    };

    const frame = (dt) => {
      t += dt;
      ripples = ripples.filter((r) => (r.age += dt) < r.life);
      if (t > nextLeaf) {
        dropLeaf();
        nextLeaf = t + rand(9, 16);
      }
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.drawImage(bg, 0, 0, W, H);
      drawPool();
      drawLeaves();
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      frame(dt);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (!ready) return;
      if (still || !inView || document.hidden) return frame(0);
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    // the cursor over the water: a slow ripple, not a splash
    const onMove = (e) => {
      if (still || t < nextRipple) return;
      const box = canvas.getBoundingClientRect();
      const x = e.clientX - box.left, y = e.clientY - box.top;
      if (x < 0 || y < 0 || x > W || y > H || outline(pool, x, y) > -6) return;
      ripples.push({ x, y, age: 0, life: 3.5, a: 0.45 });
      nextRipple = t + 2.2;
    };

    const restart = () => {
      setup();
      run();
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      run();
    });
    io.observe(canvas);
    const onMotion = () => {
      still = motionPaused();
      run();
    };
    setup();
    const cancelIdle = whenIdle(() => {
      ready = true;
      run();
    });
    // glyphs drawn before the web font arrived used a fallback
    document.fonts?.ready.then(() => ready && restart());
    window.addEventListener('resize', restart);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('motion-change', onMotion);
    document.addEventListener('visibilitychange', run);
    return () => {
      cancelIdle();
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', restart);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('motion-change', onMotion);
      document.removeEventListener('visibilitychange', run);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none [mask-image:linear-gradient(#000_50%,transparent)]"
    />
  );
}
