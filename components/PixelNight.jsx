'use client';

import { useEffect, useRef } from 'react';
import { glyph, LED_W, LED_H } from '@/lib/ledFont';

// The header: a rainy night city in pixel art, drawn live. The canvas is rendered at
// low resolution (one art pixel = PX screen pixels) and scaled up with crisp edges.
// A dithered sky, a moon behind drifting clouds, a far skyline with a blinking mast,
// near buildings whose windows flicker on and off, a neon sign, a train crossing on
// an elevated track, a wet street reflecting it all, rain over everything, and a
// dot-matrix clock (Bengaluru time). Runs at ~20fps; pauses in hidden tabs; reduced
// motion gets one still frame with the clock ticking.
const FPS = 20;

const P = {
  sky: ['#0a0e27', '#10173a', '#18224e', '#212d63', '#2b3a78'],
  star: '#cdd6ff',
  moon: '#f3ecd2',
  crater: '#d9d1b3',
  halo: '#25306a',
  cloud: '#1a2250',
  cloudEdge: '#232d62',
  far: '#131937',
  farWindow: '#3a4882',
  near: '#0b0f26',
  nearEdge: '#151b3d',
  warm: ['#ffcf7a', '#ffb45e', '#ffe2a6'],
  cool: '#9ed6ff',
  mast: '#ff3a5c',
  neonPink: '#ff4fa3',
  neonTeal: '#3ff0dc',
  track: '#1b2146',
  train: '#272d55',
  trainWindow: '#ffe7a3',
  street: '#080b1e',
  lane: '#27306a',
  rain: 'rgba(170, 195, 255, 0.35)',
  splash: 'rgba(190, 210, 255, 0.7)',
  clock: '#f6ecd2',
};

// 4×4 ordered dither: which of two neighbouring sky shades a pixel takes
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function PixelNight() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const still = document.createElement('canvas');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, horizon = 0, scene = null, raf = 0, last = 0, frameNo = 0;

    // build the city for this size: everything that doesn't move goes into `still`
    function layout() {
      const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
      const PX = cssW < 640 ? 3 : 4;
      W = Math.ceil(cssW / PX);
      H = Math.ceil(cssH / PX);
      canvas.width = still.width = W;
      canvas.height = still.height = H;
      horizon = Math.round(H * 0.66);
      const r = rng(21), s = still.getContext('2d');
      const px = (c, x, y, w = 1, h = 1) => ((s.fillStyle = c), s.fillRect(x, y, w, h));

      // sky: five bands, dithered into each other
      for (let y = 0; y < horizon; y++) {
        const t = (y / horizon) * (P.sky.length - 1), band = Math.floor(t), mixT = t - band;
        for (let x = 0; x < W; x++) {
          const useNext = mixT * 16 > BAYER[(y % 4) * 4 + (x % 4)];
          px(P.sky[Math.min(band + (useNext ? 1 : 0), P.sky.length - 1)], x, y);
        }
      }

      // far skyline, with a few dim windows
      const farTop = [];
      for (let x = 0; x < W; ) {
        const bw = 4 + ((r() * 9) | 0), bh = Math.round(H * (0.12 + r() * 0.24));
        px(P.far, x, horizon - bh, bw, bh);
        for (let wy = horizon - bh + 2; wy < horizon - 2; wy += 3)
          for (let wx = x + 1; wx < x + bw - 1; wx += 2) if (r() < 0.12) px(P.farWindow, wx, wy);
        farTop.push([x, bw, horizon - bh]);
        x += bw;
      }
      // the tallest far building carries the blinking mast
      const tallest = farTop.reduce((a, b) => (b[2] < a[2] ? b : a));
      const mast = { x: tallest[0] + (tallest[1] >> 1), y: tallest[2] - 4 };
      px(P.far, mast.x, mast.y + 1, 1, 3);

      // elevated track across the city
      const trackY = horizon - Math.round(H * 0.1);
      px(P.track, 0, trackY, W, 1);
      for (let x = 2; x < W; x += 14) px(P.track, x, trackY, 1, horizon - trackY);

      // near buildings on both sides, leaving the middle open for the moon and the train
      const windows = [];
      let sign = null;
      const nearBlock = (x0, x1) => {
        for (let x = x0; x < x1; ) {
          const bw = Math.min(6 + ((r() * 10) | 0), x1 - x), bh = Math.round(H * (0.32 + r() * 0.3)), top = horizon - bh;
          px(P.near, x, top, bw, bh);
          px(P.nearEdge, x, top, bw, 1);
          for (let wy = top + 2; wy < horizon - 2; wy += 3)
            for (let wx = x + 1; wx < x + bw - 1; wx += 2)
              windows.push({ x: wx, y: wy, on: r() < 0.38, tint: r() < 0.15 ? P.cool : P.warm[(r() * 3) | 0] });
          if (!sign && bw >= 7 && bh > H * 0.4) sign = { x: x + bw - 3, y: top + 3, h: Math.min(12, bh - 8) };
          x += bw + (r() < 0.3 ? 1 : 0);
        }
      };
      nearBlock(0, Math.round(W * 0.3));
      nearBlock(Math.round(W * 0.78), W);

      // the street, with a dashed lane line
      px(P.street, 0, horizon, W, H - horizon);
      for (let x = 0; x < W; x += 8) px(P.lane, x, horizon + Math.round((H - horizon) * 0.55), 4, 1);

      // stars only where the sky is open
      const stars = Array.from({ length: Math.round(W / 9) }, () => ({ x: (r() * W) | 0, y: (r() * horizon * 0.55) | 0, p: r() * 6 }));
      const moon = { x: Math.round(W * 0.62), y: Math.round(H * 0.2), r: Math.max(3, Math.round(H * 0.08)) };
      const clouds = Array.from({ length: 4 }, (_, i) => ({ x: r() * W, y: Math.round(H * (0.12 + i * 0.07)), w: 10 + ((r() * 16) | 0), speed: 0.03 + r() * 0.04 }));
      const rain = Array.from({ length: Math.round((W * H) / 120) }, () => ({ x: r() * W, y: r() * H, v: 1.6 + r() * 1.2 }));
      scene = { windows, sign, mast, trackY, stars, moon, clouds, rain, train: null, nextTrain: 60, splashes: [] };
    }

    const put = (c, x, y, w = 1, h = 1) => ((ctx.fillStyle = c), ctx.fillRect(x | 0, y | 0, w, h));

    function drawMoon() {
      const { x, y, r } = scene.moon;
      for (let dy = -r - 1; dy <= r + 1; dy++)
        for (let dx = -r - 1; dx <= r + 1; dx++) {
          const d = Math.hypot(dx, dy);
          if (d <= r) put((dx === -1 && dy === 1) || (dx === 1 && dy === -1 && r > 3) ? P.crater : P.moon, x + dx, y + dy);
          else if (d <= r + 1.2) put(P.halo, x + dx, y + dy);
        }
    }

    function drawClock() {
      const now = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
      const step = LED_W + 1, x0 = W - now.length * step - 3, y0 = H - LED_H - 3;
      ctx.globalAlpha = 0.55;
      [...now].forEach((ch, i) => {
        const g = glyph(ch);
        for (let y = 0; y < LED_H; y++) for (let x = 0; x < LED_W; x++) if (g[y][x] === '#') put(P.clock, x0 + i * step + x, y0 + y);
      });
      ctx.globalAlpha = 1;
    }

    function draw(t) {
      const sc = scene;
      ctx.drawImage(still, 0, 0);
      for (const s of sc.stars) if (Math.sin(t / 700 + s.p) > -0.2) put(P.star, s.x, s.y);
      drawMoon();
      for (const c of sc.clouds) {
        if (!reduce) c.x = (c.x + c.speed) % (W + c.w);
        put(P.cloud, c.x - c.w, c.y, c.w, 2);
        put(P.cloudEdge, c.x - c.w + 2, c.y - 1, c.w - 4, 1);
      }
      // the mast blinks once a second and a half
      if ((t / 750) % 2 < 1) put(P.mast, sc.mast.x, sc.mast.y);

      // the train: comes along every so often, behind the near buildings
      if (!reduce) {
        if (!sc.train && --sc.nextTrain <= 0) sc.train = { x: -46, dir: 1 };
        if (sc.train) {
          sc.train.x += 0.9;
          const ty = sc.trackY - 3;
          put(P.train, sc.train.x, ty, 44, 3);
          for (let i = 2; i < 44; i += 3) put(P.trainWindow, sc.train.x + i, ty + 1);
          if (sc.train.x > W + 2) (sc.train = null), (sc.nextTrain = 200 + ((Math.random() * 300) | 0));
        }
      }

      // windows: a few switch on or off every so often
      if (!reduce && frameNo % 8 === 0) for (let i = 0; i < 2; i++) {
        const w = sc.windows[(Math.random() * sc.windows.length) | 0];
        if (w) w.on = !w.on;
      }
      const lit = [];
      for (const w of sc.windows) if (w.on) put(w.tint, w.x, w.y), lit.push(w);

      // the neon sign: a pink frame with a flickering teal stripe
      if (sc.sign) {
        const { x, y, h } = sc.sign, flicker = reduce || Math.random() > 0.04;
        put(P.neonPink, x, y, 1, h);
        put(P.neonPink, x + 2, y, 1, h);
        put(P.neonPink, x, y, 3, 1);
        put(P.neonPink, x, y + h - 1, 3, 1);
        if (flicker) for (let i = 2; i < h - 2; i += 2) put(P.neonTeal, x + 1, y + i);
      }

      // the wet street mirrors the lights: short streaks that wobble
      const depth = H - horizon;
      ctx.globalAlpha = 0.28;
      for (const w of lit) {
        const len = Math.min(depth - 1, ((horizon - w.y) >> 1) + 1);
        put(w.tint, w.x + (Math.sin(t / 300 + w.x) > 0.6 ? 1 : 0), horizon + 1 + ((horizon - w.y) >> 2), 1, len >> 1);
      }
      if (sc.sign) put(P.neonPink, sc.sign.x + 1, horizon + 1, 1, Math.min(depth - 2, sc.sign.h));
      ctx.globalAlpha = 1;

      // rain, and the odd splash where it meets the street
      if (!reduce) for (const d of sc.rain) {
        d.y += d.v;
        d.x -= d.v * 0.25;
        if (d.y > H) {
          if (Math.random() < 0.3) sc.splashes.push({ x: d.x, y: horizon + 1 + Math.random() * (depth - 2), life: 3 });
          d.y = -2;
          d.x = Math.random() * (W + 10);
        }
      }
      ctx.fillStyle = P.rain;
      for (const d of sc.rain) ctx.fillRect(d.x | 0, d.y | 0, 1, 2);
      for (const s of sc.splashes) put(P.splash, s.x - 1, s.y, 3, 1), s.life--;
      sc.splashes = sc.splashes.filter((s) => s.life > 0);

      drawClock();
      frameNo++;
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (document.hidden || t - last < 1000 / FPS) return;
      last = t;
      draw(t);
    }

    layout();
    const ro = new ResizeObserver(() => {
      layout();
      draw(performance.now());
    });
    ro.observe(canvas);
    const tick = reduce ? setInterval(() => draw(0), 1000) : 0;
    if (reduce) draw(0);
    else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(tick);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="print-overlay absolute inset-0 w-full h-full [image-rendering:pixelated]" aria-hidden="true" />;
}
