'use client';

import { useEffect, useRef } from 'react';
import { cssColor } from '@/lib/themes';
import { BAYER, NAVY, STEP, TEAL, ihash, lightNow, makeStamper, mix, motionPaused, noise, ramp, rand, rippleAt, whenIdle } from './KoiPond';

// The header: a dry garden seen from above, drawn like the pond below it, as light on a
// surface, dithered to a few levels. The gravel is a height field: raked into long shallow
// waves across the garden and into rings round each stone and the pool, so every groove has
// a lit side and a shaded side, with grit on top. The stones are rounded granite, mossy at the
// foot, and cast soft shadows on the gravel. The light follows the time of day in Bengaluru,
// as the pond's does. The garden is drawn once; only the pool moves: its water drifts, a leaf
// falls in now and then, and the cursor over it sends out a slow ripple (at most one every
// couple of seconds, so it stays calm). Paused while out of view or the tab is hidden.

const P = 3; // css px per pixel
const FPS = 24;
const GROOVE = 9; // the rake's tine spacing, css px
const LIGHT = [-0.55, -0.62, 0.56]; // from the upper left
const GRAVEL = [128, 126, 120]; // kept dim, so the page's text stays the brightest thing
const GRANITE = [92, 92, 100];
const MOSS = [[18, 34, 22], [34, 62, 36], [58, 92, 52]];
const PAD = [52, 110, 60];
const LOTUS = [244, 168, 186];
const stamp = typeof document === 'undefined' ? null : makeStamper(`700 8px "Space Mono", monospace`, 5, 8);

export default function ZenGarden() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const off = document.createElement('canvas');
    const octx = off.getContext('2d');
    let W, H, gw, gh, img, still0, stones, pool, pads, raf, last = 0, t = 0, light;
    let waves = [], leaves = [], nextLeaf = 4, nextRipple = 0;
    let still = motionPaused(), inView = true, ready = false;

    // How far (x, y) is outside an outline: negative inside. Edges are irregular, from noise
    // round the outline.
    const outline = (o, x, y) => {
      const dx = (x - o.x) / o.rx, dy = (y - o.y) / o.ry;
      const a = Math.atan2(dy, dx);
      const edge = 1 + o.rough * (noise(Math.cos(a) * 1.4 + o.seed, Math.sin(a) * 1.4 + o.seed * 3) - 0.5);
      return (Math.hypot(dx, dy) - edge) * Math.min(o.rx, o.ry);
    };
    const nearest = (x, y) => {
      let best = null, d = Infinity;
      for (const o of [...stones, pool]) {
        const od = outline(o, x, y);
        if (od < d) (d = od), (best = o);
      }
      return [best, d];
    };

    // the gravel's height at (x, y): grooves following the rake, plus grit
    const RING = GROOVE * 4; // four rings round each stone and the pool
    const gravel = (x, y) => {
      const d = nearest(x, y)[1];
      let phase;
      if (d < RING) phase = d;
      else {
        const k = (2 * Math.PI) / (W * 0.6);
        phase = y + Math.sin(x * k + 0.7) * GROOVE * 0.6;
      }
      return 0.5 + 0.5 * Math.cos((phase / GROOVE) * Math.PI * 2) + (ihash(Math.floor(x), Math.floor(y)) - 0.5) * 0.35;
    };

    const put = (i, c, px, py) => {
      const th = BAYER[(py & 3) * 4 + (px & 3)];
      for (let k = 0; k < 3; k++) img.data[i + k] = Math.max(0, Math.min(255, Math.floor(c[k] / STEP + th) * STEP));
      img.data[i + 3] = 255;
    };

    // the still part, drawn once and kept in still0: gravel, moss, stones, shadows
    const drawGarden = () => {
      const b = light.bright;
      for (let py = 0; py < gh; py++) {
        for (let px = 0; px < gw; px++) {
          const x = px * P + P / 2, y = py * P + P / 2;
          const i = (py * gw + px) * 4;
          const [o, d] = nearest(x, y);
          if (o === pool && d < 0) continue; // the water, drawn each frame
          let c;
          if (d < 0) {
            // granite: a rounded boulder, lit from the upper left, speckled
            const depth = Math.min(1, -d / (Math.min(o.rx, o.ry) * 0.85));
            const nx = ((x - o.x) / o.rx) * (1 - depth * 0.5), ny = ((y - o.y) / o.ry) * (1 - depth * 0.5);
            const nz = Math.sqrt(Math.max(0.05, 1 - nx * nx - ny * ny));
            const lit = Math.max(0, (nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) / Math.hypot(nx, ny, nz));
            const speck = ihash(px * 7 + 3, py * 5 + 1) < 0.12 ? 1.35 : ihash(px, py) < 0.1 ? 0.7 : 1;
            const vein = noise(x / 14 + o.seed, y / 9) * 0.25 + 0.88;
            const s = (0.18 + 0.95 * lit) * speck * vein;
            c = GRANITE.map((v) => v * s * 1.3);
            // moss creeping up from the foot, thicker on the shaded side
            const m = noise(x / 7 + o.seed * 2, y / 6) + (1 - depth) * 0.5 + ny * 0.25 - 0.85 + o.moss * 0.2;
            if (m > 0.4) c = ramp(MOSS, 0.25 + lit * 0.9 + (ihash(px, py) - 0.5) * 0.3);
          } else if (o === pool && d < 6) {
            // pebbles edging the pool
            c = GRANITE.map((v) => v * (0.5 + noise(x / 3.5, y / 3.5) * 0.9));
          } else {
            // gravel: lit from the slope of the height field
            const hx = gravel(x + 1.5, y) - gravel(x - 1.5, y);
            const hy = gravel(x, y + 1.5) - gravel(x, y - 1.5);
            const nx = -hx * 0.9, ny = -hy * 0.9;
            const lit = (nx * LIGHT[0] + ny * LIGHT[1] + LIGHT[2]) / Math.hypot(nx, ny, 1);
            let s = 0.42 + 0.62 * lit;
            // the stones' shadows: soft, down and to the right
            for (const st of stones) {
              const sd = outline(st, x - st.rx * 0.5, y - st.ry * 0.55);
              if (sd < 10) s *= 0.45 + 0.55 * Math.min(1, Math.max(0, sd / 10));
            }
            if (o !== pool && d < 3 + noise(x / 9, y / 9) * 8) {
              // moss beds hugging the stones
              c = ramp(MOSS, 0.2 + s * 0.6 + (ihash(px, py) - 0.5) * 0.35);
            } else {
              const tone = 0.9 + noise(x / 60, y / 40) * 0.2;
              c = GRAVEL.map((v) => v * s * tone);
            }
          }
          put(i, c.map((v) => v * b), px, py);
        }
      }
      still0 = new Uint8ClampedArray(img.data);
    };

    const setup = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const box = canvas.getBoundingClientRect();
      W = box.width;
      H = box.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gw = Math.ceil(W / P);
      gh = Math.ceil(H / P);
      off.width = gw;
      off.height = gh;
      img = octx.createImageData(gw, gh);
      light = lightNow();
      // three stones grouped on the left, a pool on the right; the name sits bottom left,
      // on open gravel
      const u = Math.min(W, H * 2.2);
      stones = [
        { x: W * 0.16, y: H * 0.3, rx: u * 0.07, ry: u * 0.055, rough: 0.3, seed: 3, moss: 1 },
        { x: W * 0.265, y: H * 0.46, rx: u * 0.04, ry: u * 0.032, rough: 0.35, seed: 11, moss: 0.6 },
        { x: W * 0.47, y: H * 0.2, rx: u * 0.03, ry: u * 0.025, rough: 0.35, seed: 23, moss: 0.3 },
      ];
      pool = { x: W * 0.77, y: H * 0.4, rx: Math.min(W * 0.16, u * 0.19), ry: H * 0.26, rough: 0.2, seed: 41 };
      pads = [
        { x: pool.x - pool.rx * 0.4, y: pool.y - pool.ry * 0.2, r: 13, a: 0.6, lotus: true },
        { x: pool.x + pool.rx * 0.38, y: pool.y + pool.ry * 0.32, r: 10, a: 2.4 },
        { x: pool.x + pool.rx * 0.12, y: pool.y - pool.ry * 0.52, r: 7, a: 4.1 },
      ];
      waves = [];
      leaves = [];
      drawGarden();
    };

    // the pool: drifting water like the pond's, the pads on it, ripples
    const drawPool = () => {
      img.data.set(still0);
      const x0 = Math.max(0, Math.floor((pool.x - pool.rx * 1.3) / P)), x1 = Math.min(gw, Math.ceil((pool.x + pool.rx * 1.3) / P));
      const y0 = Math.max(0, Math.floor((pool.y - pool.ry * 1.3) / P)), y1 = Math.min(gh, Math.ceil((pool.y + pool.ry * 1.3) / P));
      for (let py = y0; py < y1; py++) {
        for (let px = x0; px < x1; px++) {
          const x = px * P + P / 2, y = py * P + P / 2;
          const d = outline(pool, x, y);
          if (d >= 0) continue;
          let c;
          const pad = pads.find((p) => (x - p.x) ** 2 + (y - p.y) ** 2 < p.r * p.r);
          const ang = pad && Math.atan2(y - pad.y, x - pad.x) - pad.a;
          if (pad && Math.abs(Math.atan2(Math.sin(ang), Math.cos(ang))) > 0.3) {
            // a lily pad with its notch and veins; a lotus on one
            const rr = Math.hypot(x - pad.x, y - pad.y) / pad.r;
            const vein = Math.abs(Math.sin(ang * 4)) < 0.15 ? 0.8 : 1;
            c = pad.lotus && rr < 0.42 ? LOTUS.map((v) => v * (0.75 + (1 - rr) * 0.5)) : PAD.map((v) => v * (1.25 - rr * 0.45) * vein);
          } else {
            const wx = x + (noise(x / 60 + t * 0.05, y / 60) - 0.5) * 30;
            const wy = y + (noise(x / 60 + 17, y / 60 - t * 0.04) - 0.5) * 30;
            const l = noise(wx / 70 + t * 0.012, wy / 50) * 0.6 + noise(wx / 22 - t * 0.03, wy / 30 + t * 0.02) * 0.4;
            c = ramp(noise(wx / 50 + 40, wy / 60) > 0.7 ? TEAL : NAVY, l * 0.9 + 0.05);
            // darker at the edge, where the pebbles shade it; the sky reflected in it
            c = c.map((v) => v * (0.55 + 0.45 * Math.min(1, -d / 16)));
            const glow = Math.exp(-(((x - pool.x + pool.rx * 0.3) / (pool.rx * 0.5)) ** 2 + ((y - pool.y + pool.ry * 0.25) / (pool.ry * 0.4)) ** 2));
            c = c.map((v, k) => mix(v, light.glow[k], glow * light.glowA * 0.55));
          }
          if (waves.length) {
            const wv = rippleAt(waves, x, y, t);
            const g = Math.max(0, wv - 0.3) * 150;
            c = c.map((v) => v * (1 + wv * 0.9) + g);
          }
          put((py * gw + px) * 4, c.map((v) => v * light.bright), px, py);
        }
      }
      octx.putImageData(img, 0, 0);
    };

    // now and then a leaf falls, swaying, in the accent colour; on the water it ripples and
    // floats a while, on the gravel it rests and fades
    const dropLeaf = () => {
      const onWater = Math.random() < 0.6;
      const tx = onWater ? pool.x + rand(-0.5, 0.5) * pool.rx : rand(0.35, 0.6) * W;
      const ty = onWater ? pool.y + rand(-0.5, 0.5) * pool.ry : rand(0.15, 0.6) * H;
      const rgb = (cssColor('signal').match(/\d+/g) || [240, 122, 74]).map(Number);
      leaves.push({ x0: tx + rand(-50, 50), tx, ty, t0: t, fall: rand(5, 7), rgb, seed: rand(0, 6) });
    };
    const drawLeaves = () => {
      leaves = leaves.filter((l) => t - l.t0 < l.fall + 8);
      for (const l of leaves) {
        const p = Math.min(1, (t - l.t0) / l.fall);
        let x = l.x0 + (l.tx - l.x0) * p + Math.sin((t - l.t0) * 1.5 + l.seed) * 12 * (1 - p);
        const y = -8 + (l.ty + 8) * p;
        if (p === 1 && !l.landed) {
          l.landed = true;
          l.wet = outline(pool, l.tx, l.ty) < 0;
          if (l.wet) waves.push({ x: l.tx, y: l.ty, t0: t, speed: 16, life: 4, amp: 0.55, len: 7 });
        }
        if (l.wet) x += Math.sin((t - l.t0 - l.fall) * 0.25) * 4;
        const a = p < 1 ? 0.95 : 0.95 * Math.max(0, 1 - (t - l.t0 - l.fall) / 8);
        stamp(ctx, p < 1 && Math.sin((t - l.t0) * 3 + l.seed) > 0 ? '<' : '*', l.rgb, a, x - 2.5, y - 4);
      }
    };

    const frame = (dt) => {
      t += dt;
      waves = waves.filter((w) => t - w.t0 < w.life);
      if (t > nextLeaf) {
        dropLeaf();
        nextLeaf = t + rand(10, 18);
      }
      drawPool();
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, gw * P, gh * P);
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
      if (still || !ready || t < nextRipple) return;
      const box = canvas.getBoundingClientRect();
      const x = e.clientX - box.left, y = e.clientY - box.top;
      if (x < 0 || y < 0 || x > W || y > H || outline(pool, x, y) > -6) return;
      waves.push({ x, y, t0: t, speed: 14, life: 3.5, amp: 0.4, len: 7 });
      nextRipple = t + 2;
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
    const cancelIdle = whenIdle(() => {
      setup();
      ready = true;
      run();
    });
    // the light follows the clock: redraw the garden every few minutes
    const clock = setInterval(() => ready && restart(), 5 * 60 * 1000);
    window.addEventListener('resize', restart);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('motion-change', onMotion);
    document.addEventListener('visibilitychange', run);
    return () => {
      cancelIdle();
      clearInterval(clock);
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
      className="absolute inset-0 w-full h-full pointer-events-none [mask-image:linear-gradient(#000_40%,transparent)]"
    />
  );
}
