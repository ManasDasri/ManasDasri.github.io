'use client';

import { useEffect, useRef } from 'react';
import { getWeather } from '@/lib/weather';

// The background: a koi pond in the margins either side of the content column. The water
// is a pixel layer, ordered-dithered to a few levels (with blurred lily pads, a pale
// reflection and the fishes' shadows), with ripples spreading through it: off the koi as
// they cruise, behind the cursor, from food and from rain while it rains in Bengaluru. The
// koi and their wakes are dense ASCII on top. Toward the column it fades
// into the page's own background colour, so there's no seam. Only the margins are computed,
// since the column covers the rest. Paused while the tab is hidden; a still frame for
// reduced motion.

const P = 4; // css px per water pixel
const CW = 4; // ASCII cell, css px
const CH = 6;
const FPS = 30;
const KOI_FONT = `700 ${CH}px "Space Mono", monospace`;
export const STEP = 20; // colour quantisation step for the dither
const BODY = '=+*xX#%&8'; // flank to back: denser where the body is thicker
const WAKE = "~-=+:!'`";
const WAKE_RGB = [120, 186, 214];
const EYE = [18, 16, 22];
export const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

export const rand = (a, b) => a + Math.random() * (b - a);
export const ihash = (x, y) => {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
// smooth value noise in [0, 1]
export function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = ihash(xi, yi), b = ihash(xi + 1, yi), c = ihash(xi, yi + 1), d = ihash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export const mix = (a, b, t) => a + (b - a) * t;

// Whether to hold the animations still: the visitor's system asks for less motion, or they
// paused them from the dock (stored, and announced with a 'motion-change' event).
export function motionPaused() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  try {
    return localStorage.getItem('motion') === 'paused';
  } catch {
    return false;
  }
}

export function toggleMotion() {
  try {
    localStorage.setItem('motion', motionPaused() ? 'playing' : 'paused');
  } catch {}
  window.dispatchEvent(new Event('motion-change'));
}

// Runs fn once the browser is idle after the page loads, so the canvases don't compete with
// it. Returns a function that cancels it.
export function whenIdle(fn) {
  if (window.requestIdleCallback) {
    const id = requestIdleCallback(fn, { timeout: 2000 });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 300);
  return () => clearTimeout(id);
}

// Ripples: rings of light and shade spreading from where something broke the surface, a few
// crests deep, widening and fading as they go, the way they do on still water. Each wave is
// { x, y, t0, speed (px/s), life (s), amp, len (crest spacing, px) }. Returns how much
// brighter (or, in a trough, darker) the water at (x, y) is.
export function rippleAt(waves, x, y, t) {
  let s = 0;
  for (const w of waves) {
    const age = t - w.t0;
    const spread = 3 + age * 5;
    const d = Math.hypot(x - w.x, y - w.y) - age * w.speed;
    if (d > spread * 2.2 || d < -spread * 2.6) continue;
    s += Math.exp(-((d / spread) ** 2)) * w.amp * (1 - age / w.life) ** 2 * Math.cos((d / w.len) * Math.PI * 2);
  }
  return s;
}

// fillText is slow when called thousands of times a frame, so each character in each colour
// is drawn once into an atlas canvas and copied from there with drawImage. Colours are
// rounded to 16 levels a channel so the atlas stays small; it starts over if it fills.
export function makeStamper(font, cw, ch) {
  const atlas = document.createElement('canvas');
  const actx = atlas.getContext('2d');
  const slots = new Map();
  let dpr = 0, sw, sh, cols, next;
  const reset = (d) => {
    dpr = d;
    sw = Math.ceil((cw + 2) * dpr);
    sh = Math.ceil((ch + 3) * dpr);
    atlas.width = 2048;
    atlas.height = 2048;
    cols = Math.floor(2048 / sw);
    next = 0;
    slots.clear();
  };
  // glyphs drawn before the web font arrived used a fallback: draw them again
  document.fonts?.ready.then(() => (dpr = 0));
  return (ctx, c, rgb, alpha, x, y) => {
    const d = ctx.getTransform().a;
    if (d !== dpr) reset(d);
    const r = rgb[0] & 0xf0, g = rgb[1] & 0xf0, b = rgb[2] & 0xf0;
    const key = c + (r << 16 | g << 8 | b);
    let i = slots.get(key);
    if (i === undefined) {
      if (next >= cols * Math.floor(2048 / sh)) reset(d);
      i = next++;
      slots.set(key, i);
      actx.setTransform(dpr, 0, 0, dpr, (i % cols) * sw, Math.floor(i / cols) * sh);
      actx.font = font;
      actx.textBaseline = 'top';
      actx.fillStyle = `rgb(${r | 8}, ${g | 8}, ${b | 8})`;
      actx.fillText(c, 1, 1);
    }
    ctx.globalAlpha = alpha;
    ctx.drawImage(atlas, (i % cols) * sw, Math.floor(i / cols) * sh, sw, sh, x - 1, y - 1, sw / dpr, sh / dpr);
  };
}
const stampKoi = typeof document === 'undefined' ? null : makeStamper(KOI_FONT, CW, CH);

// The pond's light through the day in Bengaluru: [IST hour, brightness, reflection colour,
// reflection strength]. A pale moon at night, pink at dawn, plain sky by day, orange at dusk.
const LIGHT = [
  [0, 0.62, [150, 166, 204], 0.8],
  [5, 0.62, [150, 166, 204], 0.8],
  [7, 0.88, [222, 152, 150], 0.6],
  [12, 1, [120, 134, 160], 0.5],
  [16.5, 1, [120, 134, 160], 0.5],
  [18.2, 0.86, [238, 140, 88], 0.7],
  [19.6, 0.7, [150, 166, 204], 0.75],
  [24, 0.62, [150, 166, 204], 0.8],
];
export function lightNow() {
  const h = (Date.now() / 3600000 + 5.5) % 24; // IST has no daylight saving
  const i = LIGHT.findIndex((s, j) => h >= s[0] && h < LIGHT[j + 1][0]);
  const [h0, b0, c0, a0] = LIGHT[i], [h1, b1, c1, a1] = LIGHT[i + 1];
  const f = (h - h0) / (h1 - h0);
  return { bright: mix(b0, b1, f), glow: c0.map((c, k) => mix(c, c1[k], f)), glowA: mix(a0, a1, f) };
}

// water colour ramps, dark to light: deep blue, and the teal it shifts to in places
export const NAVY = [[3, 6, 16], [10, 18, 46], [20, 36, 82], [34, 58, 120], [58, 92, 158]];
export const TEAL = [[3, 10, 14], [10, 32, 40], [18, 58, 64], [32, 88, 90], [60, 124, 120]];
const GREEN = [[3, 9, 6], [10, 30, 20], [22, 58, 36], [42, 92, 56], [72, 126, 82]];
const SKY = [[4, 8, 20], [16, 30, 64], [34, 60, 112], [62, 98, 160], [104, 140, 196]];
export const ramp = (r, l) => {
  const s = Math.max(0, Math.min(0.999, l)) * (r.length - 1);
  const i = Math.floor(s), f = s - i;
  return [mix(r[i][0], r[i + 1][0], f), mix(r[i][1], r[i + 1][1], f), mix(r[i][2], r[i + 1][2], f)];
};

// Four koi, each a different variety, in the colours they really come in. Patterns are
// drawn in the body's own coordinates, so a patch wraps over the back and moves with it.
const SHIRO = [244, 240, 230]; // white ground
const HI = [226, 66, 36]; // the red of kohaku
const SUMI = [76, 78, 94]; // black, lifted a little so it reads against the water
const GOLD = [240, 178, 52];
const KOI = [
  { base: SHIRO, hi: 0.5 }, // kohaku: red on white
  { base: SHIRO, hi: 0.44, sumi: 0.2 }, // taisho sanke: kohaku with black on the back
  { base: SUMI, hi: 0.42, white: 0.42 }, // showa: black ground, red and white over it
  { base: GOLD, metal: 1 }, // yamabuki ogon: plain metallic gold
];

export function makeFish(g, i, len = Math.max(110, Math.min(240, g.w * 0.9))) {
  const x = g.x + rand(0.3, 0.7) * g.w;
  const y = (g.y ?? 0) + rand(0.15, 0.85) * g.h;
  const heading = rand(0, Math.PI * 2);
  const K = 18;
  const seg = len / K;
  return {
    g,
    kind: KOI[i % KOI.length],
    len,
    seg,
    heading,
    turn: 0, // turn rate, rad/s: it eases toward what the fish wants, never snaps
    v: 12, // speed, px/s
    thrust: 0.5, // how hard the tail is beating, 0 to 1
    beat: rand(0, 6), // tail-beat phase
    goal: null,
    goalUntil: 0,
    phase: rand(0, 100),
    spots: rand(0, 50),
    spine: Array.from({ length: K }, (_, j) => [x - Math.cos(heading) * seg * j, y - Math.sin(heading) * seg * j]),
  };
}

// half-width of the body at u (0 snout, 1 the root of the tail): a blunt rounded head,
// widest a third of the way back, tapering to a narrow tail stalk. Seen from above a koi is
// about five times as long as it is wide.
export function width(f, u) {
  const W = f.len * 0.105;
  if (u < 0.32) {
    const s = u / 0.32;
    const cap = u < 0.06 ? Math.sqrt(1 - ((0.06 - u) / 0.06) ** 2) : 1; // the round snout
    return W * (0.6 + 0.4 * Math.sin((s * Math.PI) / 2)) * (0.45 + 0.55 * cap);
  }
  return W * (1 - 0.8 * ((u - 0.32) / 0.68) ** 1.6);
}

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const MAX_BEND = 0.11; // rad between neighbouring segments: the body curves, it never folds

// How a koi swims: it cruises toward a spot in its margin, picking a new one now and then,
// in slow wide arcs (its turning circle grows with its length), alternating a few tail
// beats with a long glide, and veers away from other koi. Food in the water overrides the
// wandering: it turns harder and hurries.
export function swim(f, t, dt, others = []) {
  const { g } = f;
  const [hx, hy] = f.spine[0];
  if (!f.food && (!f.goal || t > f.goalUntil || Math.hypot(f.goal.x - hx, f.goal.y - hy) < f.len * 0.5)) {
    // somewhere in the margin at least a body length away
    let gx, gy, tries = 0;
    do {
      gx = g.x + rand(0.15, 0.85) * g.w;
      gy = (g.y ?? 0) + rand(0.1, 0.9) * g.h;
    } while (Math.hypot(gx - hx, gy - hy) < f.len && ++tries < 8);
    f.goal = { x: gx, y: gy };
    f.goalUntil = t + rand(10, 22);
  }
  const target = f.food ?? f.goal;
  let want = Math.atan2(target.y - hy, target.x - hx) + (f.food ? 0 : Math.sin(t * 0.23 + f.phase) * 0.25);
  // keep clear of the other koi: veer away from the middle of any that's close
  for (const o of others) {
    if (o === f) continue;
    const [ox, oy] = o.spine[o.spine.length >> 1];
    const d = Math.hypot(hx - ox, hy - oy);
    const near = 1 - d / (f.len * 0.75);
    if (near > 0) want += wrap(Math.atan2(hy - oy, hx - ox) - want) * Math.min(1, near * 1.5);
  }
  const maxTurn = f.v / (f.len * (f.food ? 0.28 : f.turning ?? 0.45));
  const desired = Math.max(-maxTurn, Math.min(maxTurn, wrap(want - f.heading) * 0.9));
  f.turn += (desired - f.turn) * Math.min(1, dt * 1.2);
  f.heading = wrap(f.heading + f.turn * dt);
  // a few beats, then a glide; turning hard costs speed
  const pulse = Math.max(0, Math.sin(t * 0.55 + f.phase));
  f.thrust = f.food ? 1 : 0.15 + 0.85 * pulse ** 2;
  const vWant = (f.food ? 34 : 9 + 16 * f.thrust) * (1 - 0.35 * Math.min(1, Math.abs(f.turn) / maxTurn));
  f.v += (vWant - f.v) * Math.min(1, dt * 0.8);
  f.beat += dt * (2 + 5 * f.thrust);
  if (f.food && Math.hypot(f.food.x - hx, f.food.y - hy) < 10) {
    f.food.eaten = true;
    f.food = null;
  }
  f.spine[0] = [hx + Math.cos(f.heading) * f.v * dt, hy + Math.sin(f.heading) * f.v * dt];
  // the body follows the head, each segment bending at most MAX_BEND from the one before
  const bend = f.bend ?? MAX_BEND; // the post about the pond turns these down to show why
  let ref = f.heading + Math.PI;
  for (let i = 1; i < f.spine.length; i++) {
    const [px, py] = f.spine[i - 1];
    const [cx, cy] = f.spine[i];
    const a = ref + Math.max(-bend, Math.min(bend, wrap(Math.atan2(cy - py, cx - px) - ref)));
    f.spine[i] = [px + Math.cos(a) * f.seg, py + Math.sin(a) * f.seg];
    ref = a;
  }
}

// the spine with the tail beat applied: a wave running back along the body, strongest at
// the tail and while it's beating hard
export function body(f) {
  const n = f.spine.length;
  const amp = f.len * 0.04 * (0.25 + 0.75 * f.thrust);
  return f.spine.map(([x, y], i) => {
    const [ax, ay] = f.spine[Math.max(0, i - 1)];
    const [bx, by] = f.spine[Math.min(n - 1, i + 1)];
    const a = Math.atan2(by - ay, bx - ax);
    const u = i / (n - 1);
    const s = Math.sin(f.beat - u * 4) * amp * u ** 1.6;
    return [x - Math.sin(a) * s, y + Math.cos(a) * s];
  });
}

// A stroke character along angle a (screen space, y down): fin rays, the dorsal fin and the
// barbels are drawn as lines running the way they really run.
const LINE = ['-', '\\', '|', '/'];
const lineChar = (a) => LINE[((Math.round(a / (Math.PI / 4)) % 4) + 4) % 4];
// light from the upper left, above the water; H is the half-vector for the highlight
const LX = -0.42, LY = -0.56, LZ = 0.71;
const HN = Math.hypot(LX, LY, LZ + 1);
const HX = LX / HN, HY = LY / HN, HZ = (LZ + 1) / HN;

// the skin's colour at u along the body and nn across it (-1 to 1, flank to flank)
function skin(f, u, nn) {
  const k = f.kind;
  if (k.metal) return k.base;
  const X = u * 4.6 + f.spots, Y = nn * 0.85 + f.spots * 0.37;
  const q = noise(X, Y) * 0.72 + noise(X * 2.6 + 9, Y * 2.6) * 0.28;
  // no red on the tip of the snout, little down the tail stalk
  const red = q > 1 - k.hi + (u < 0.05 ? 1 : 0) + Math.max(0, u - 0.8) * 2.5;
  if (k.white) return red ? HI : noise(X * 1.4 + 31, Y * 1.2 + 5) > 1 - k.white ? SHIRO : SUMI;
  // sanke's black: small patches on the back, never on the head
  if (k.sumi && u > 0.24 && Math.abs(nn) < 0.8 && noise(X * 3 + 77, Y * 2.4 + 13) > 1 - k.sumi) return SUMI;
  return red ? HI : k.base;
}

// fins: r is how far out (0 at the root, 1 at the edge). Showa has black at the root of its
// pectoral fins, sanke black stripes across them.
function finSkin(k, r) {
  if (k.metal) return [250, 214, 128];
  if (k.white) return r < 0.38 ? SUMI : SHIRO;
  if (k.sumi && Math.sin(r * 15) > 0.7) return SUMI;
  return SHIRO;
}

// One koi in ASCII, from above. The body is lit from one side, with a highlight along the
// back and the scales' edges as a fine net; the head is smooth skin with a gill cover, two
// eyes and a pair of barbels at the mouth. The pectoral and pelvic fins are translucent fans
// of rays swept back from the body, paddling slowly; the forked tail trails and ripples with
// the beat. fade(x) scales its opacity (0 hides it).
export function drawKoi(ctx, f, pts, fade) {
  const n = pts.length;
  const W0 = f.len * 0.105;
  const at = (u) => {
    const s = u * (n - 1), i = Math.min(n - 2, Math.floor(s)), r = s - i;
    return [mix(pts[i][0], pts[i + 1][0], r), mix(pts[i][1], pts[i + 1][1], r)];
  };
  // the tail fin hangs off the stalk, in its own frame: along D, and across it
  const R = at(0.84), E = pts[n - 1];
  const dl = Math.hypot(E[0] - R[0], E[1] - R[1]) || 1;
  const DX = (E[0] - R[0]) / dl, DY = (E[1] - R[1]) / dl, DA = Math.atan2(DY, DX);
  const LT = f.len * 0.38, SPREAD = W0 * 1.7;
  const tip = [R[0] + DX * LT, R[1] + DY * LT];
  // eyes, either side of the head just behind the snout
  const e0 = at(0.075), e1 = at(0.11);
  const ed = Math.atan2(e1[1] - e0[1], e1[0] - e0[0]);
  const ew = width(f, 0.075) * 0.78;
  const eyes = [1, -1].map((s) => [e0[0] - Math.sin(ed) * ew * s, e0[1] + Math.cos(ed) * ew * s]);
  const eyeR = (W0 * 0.14 + 2) ** 2;
  const flap = Math.sin(f.beat * 0.45 + f.phase); // the fins paddle, slower than the tail

  const pad = W0 * 2.6 + 8;
  const xs = [...pts.map((p) => p[0]), tip[0]], ys = [...pts.map((p) => p[1]), tip[1]];
  const bx0 = Math.floor((Math.min(...xs) - pad) / CW), bx1 = Math.ceil((Math.max(...xs) + pad) / CW);
  const by0 = Math.floor((Math.min(...ys) - pad) / CH), by1 = Math.ceil((Math.max(...ys) + pad) / CH);
  const reach = (W0 * 2.4 + f.seg * 1.5) ** 2;
  const checks = [...pts.filter((_, i) => i % 2 === 0), E, at(0.92).map((v, i) => mix(v, tip[i], 0.6)), tip];

  for (let cy = by0; cy <= by1; cy++) {
    for (let cx = bx0; cx <= bx1; cx++) {
      const x = cx * CW + CW / 2, y = cy * CH + CH / 2;
      const k = fade(x);
      if (k < 0.05) continue;
      // most of the box is open water: skip it cheaply
      if (!checks.some((p) => (x - p[0]) ** 2 + (y - p[1]) ** 2 < reach)) continue;
      // nearest point on the spine: distance, position along the body, signed distance
      // across it, and the spine's direction there
      let best = Infinity, bu = 0, lat = 0, dir = 0;
      for (let i = 0; i < n - 1; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
        const vx = bx - ax, vy = by - ay, vl = Math.hypot(vx, vy) || 1;
        const s = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vl * vl)));
        const ex = x - ax - vx * s, ey = y - ay - vy * s;
        const dd = Math.hypot(ex, ey);
        if (dd < best) {
          best = dd;
          bu = (i + s) / (n - 1);
          lat = (vx * ey - vy * ex) / vl;
          dir = Math.atan2(vy, vx) + Math.PI; // the way the fish faces
        }
      }
      const w = width(f, bu);
      const side = Math.sign(lat) || 1;
      const px = -Math.sin(dir), py = Math.cos(dir); // across the body
      const h = ihash(cx, cy);
      let ch, rgb, a;
      if (eyes.some(([ex, ey]) => (x - ex) ** 2 + (y - ey) ** 2 < eyeR)) {
        ch = '•';
        rgb = EYE;
        a = 1;
      } else if (best <= w) {
        const nn = Math.max(-1, Math.min(1, lat / w));
        const nz = Math.sqrt(1 - nn * nn);
        // the surface normal: the body is a rounded hull, a little flatter than a tube
        const NX = -px * nn * 0.85, NY = -py * nn * 0.85, NL = Math.hypot(NX, NY, nz) || 1;
        const diff = Math.max(0, (NX * LX + NY * LY + nz * LZ) / NL);
        const spec = Math.max(0, (NX * HX + NY * HY + nz * HZ) / NL) ** (f.kind.metal ? 12 : 28);
        // the scales, from the gill cover back: a staggered net whose edges catch less light
        let net = 1;
        if (bu > 0.21 && bu < 0.86) {
          const S = W0 * 0.34, sx = (bu * f.len) / S, row = Math.floor(sx);
          const sy = lat / S + (row & 1) * 0.5;
          if (sx - row > 0.76 || Math.abs(sy - Math.floor(sy) - 0.5) > 0.4) net = 0.86;
        }
        const gill = Math.abs(bu - 0.2) * f.len < 1.8 && Math.abs(nn) < 0.9 ? 0.62 : 1;
        const shade = (0.3 + 0.8 * diff) * net * gill * (Math.abs(nn) > 0.9 ? 0.72 : 1);
        const c = skin(f, bu, nn);
        const gloss = f.kind.metal ? [255, 238, 186] : [255, 255, 255];
        const s = spec * (f.kind.metal ? 0.95 : 0.5);
        rgb = c.map((v, i) => Math.min(255, v * shade + gloss[i] * s));
        // the dorsal fin, folded down the middle of the back: a faint darker seam
        if (bu > 0.3 && bu < 0.68 && Math.abs(lat) < CW * 0.5) rgb = rgb.map((v) => v * 0.82);
        ch = BODY[Math.min(BODY.length - 1, Math.floor((0.15 + 0.85 * nz) * BODY.length))];
        a = 0.97;
      } else {
        const o = best - w; // how far out from the body's edge
        const ub = bu - o / f.len; // fins sweep back as they reach out
        const pect = (ub - 0.2) / 0.15, pelv = (ub - 0.52) / 0.1;
        let r = -1, ang = 0, q = 0, rim = 0;
        const pr = W0 * (1.05 + 0.15 * flap) * Math.sin(Math.PI * Math.max(0, pect)) ** 0.8;
        const vr = W0 * 0.6 * Math.sin(Math.PI * Math.max(0, pelv)) ** 0.7;
        if (pect >= 0 && pect <= 1 && o < pr) {
          r = o / pr;
          rim = pr - o;
          q = (ub * f.len) / 3;
        } else if (pelv >= 0 && pelv <= 1 && o < vr) {
          r = o / vr;
          rim = vr - o;
          q = (ub * f.len) / 3;
        }
        if (r >= 0) ang = Math.atan2(-py * side - Math.sin(dir) * 0.9, -px * side - Math.cos(dir) * 0.9);
        else {
          // the tail fin: two lobes and a fork, trailing and rippling with the beat
          const rx = x - R[0], ry = y - R[1];
          const ta = rx * DX + ry * DY;
          let tl = -rx * DY + ry * DX;
          if (ta > 0 && ta < LT) {
            const rr = ta / LT;
            tl -= Math.sin(f.beat - rr * 2.5) * W0 * 0.3 * rr;
            const half = W0 * 0.3 + Math.sin(rr * Math.PI * 0.5) * (SPREAD - W0 * 0.3);
            const back = 0.72 + 0.28 * Math.min(1, Math.abs(tl) / SPREAD) ** 1.5; // a shallow fork
            if (Math.abs(tl) < half && rr < back) {
              r = rr;
              rim = Math.min(half - Math.abs(tl), (back - rr) * LT);
              ang = DA + Math.atan2(tl, ta);
              q = Math.atan2(tl, ta) * 9;
            }
          }
        }
        if (r >= 0) {
          // a translucent membrane, rays running through it, and a brighter edge
          const edge = rim < 2.6;
          const stripe = q - Math.floor(q) < 0.4;
          rgb = finSkin(f.kind, r);
          ch = edge ? '.' : stripe ? lineChar(ang) : r > 0.5 ? ':' : ';';
          a = (edge ? 0.6 : stripe ? 0.55 : 0.42) * (1 - Math.min(1, r) * 0.3);
        } else if (o < W0 * 0.5 && bu > 0.45 && h < 0.3) {
          rgb = WAKE_RGB;
          ch = WAKE[Math.floor(h * 13) % WAKE.length];
          a = 0.22 * (1 - o / (W0 * 0.5));
        } else continue;
      }
      stampKoi(ctx, ch, rgb, a * k, cx * CW, cy * CH);
    }
  }
  // a pair of barbels at the corners of the mouth, reaching forward and out
  const [hx, hy] = pts[0];
  const fwd = Math.atan2(hy - pts[1][1], hx - pts[1][0]);
  const mw = width(f, 0.03) * 0.8;
  for (const s of [1, -1]) {
    const bx = hx - Math.sin(fwd) * mw * s, by = hy + Math.cos(fwd) * mw * s;
    const ba = fwd + s * 0.75;
    for (let j = 1; j <= 2; j++) {
      const x = bx + Math.cos(ba) * j * W0 * 0.13, y = by + Math.sin(ba) * j * W0 * 0.13;
      stampKoi(ctx, lineChar(ba), f.kind.metal ? GOLD : SHIRO, 0.4 * fade(x) * (1 - j * 0.25), x - CW / 2, y - CH / 2);
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
    let still = motionPaused();
    let W, H, gw, gh, img, shade, base, frameNo = 0, gutters, fish, pads, glows, light, food = [], waves = [], weather = null, nextDrop = 0, raf, last = 0, t = rand(0, 500);

    // the page's background, for the pond to fade into
    const v = getComputedStyle(document.documentElement).getPropertyValue('--c-ink').trim().split(/\s+/).map(Number);
    const ink = v.length === 3 && v.every((n) => n >= 0) ? v : [0, 0, 0];
    let lightAt = -Infinity;

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
      shade = new Float32Array(gw * gh);
      base = new Float32Array(gw * gh * 3);
      frameNo = 0;
      light = lightNow();
      const col = document.getElementById('main')?.getBoundingClientRect();
      const left = col ? col.left : W / 2;
      const right = col ? col.right : W / 2;
      gutters = [
        { x: 0, w: left, h: H, edge: left },
        { x: right, w: W - right, h: H, edge: right },
      ].filter((g) => g.w >= 48);
      // four koi, one of each variety, shared between the margins; not all the same size
      fish = Array.from({ length: gutters.length ? 4 : 0 }, (_, i) => {
        const g = gutters[i % gutters.length];
        return makeFish(g, i, Math.max(110, Math.min(300, g.w * 0.78)) * rand(0.85, 1.05));
      });
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
      // the light follows the clock; a minute is close enough
      if (t - lightAt > 60) {
        lightAt = t;
        light = lightNow();
      }
      fish.forEach((f) => swim(f, t, dt, fish));
      // a koi cruising just under the surface keeps lifting small rings off its head, more
      // often when it's swimming hard
      waves = waves.filter((w) => t - w.t0 < w.life);
      for (const f of fish) {
        if (t < (f.nextRing ?? 0)) continue;
        const [hx, hy] = f.spine[0];
        waves.push({ x: hx + Math.cos(f.heading) * f.len * 0.04, y: hy + Math.sin(f.heading) * f.len * 0.04, t0: t, speed: 14 + 10 * f.thrust, life: 2.4, amp: 0.2 + 0.25 * f.thrust, len: 7 });
        f.nextRing = t + rand(0.7, 1.4) / (0.6 + f.thrust);
      }
      const bodies = fish.map((f) => body(f));
      for (const p of pads) {
        p.x += p.dx * dt;
        p.y += p.dy * dt;
        p.a += 0.02 * dt;
        if (p.y < -p.r * 2) p.y = H + p.r;
        if (p.y > H + p.r * 2) p.y = -p.r;
      }
      // --- the water: continuous colour, then ordered dither
      // a fresh buffer is filled whole; after that a sixth of its rows are redone each frame
      const full = frameNo++ === 0;
      const d = img.data;
      d.fill(0);
      // fish shadows, offset down and right: a few soft circles along each body, drawn into a
      // darkening buffer once rather than tested for every water pixel
      shade.fill(0);
      bodies.forEach((pts, fi) =>
        pts.forEach(([x, y], j) => {
          if (j % 2) return;
          const sr = (width(fish[fi], j / (pts.length - 1)) + 4) / P;
          const sx = (x + 9) / P, sy = (y + 12) / P;
          for (let py = Math.max(0, Math.floor(sy - sr)); py <= Math.min(gh - 1, sy + sr); py++)
            for (let px = Math.max(0, Math.floor(sx - sr)); px <= Math.min(gw - 1, sx + sr); px++) {
              const q = ((px - sx) ** 2 + (py - sy) ** 2) / (sr * sr);
              if (q < 1) shade[py * gw + px] = Math.max(shade[py * gw + px], (1 - q) * 0.3);
            }
        })
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
            // the water's own colour changes slowly, so each row is worked out every sixth frame
            // (a sixth of them each frame) and kept; shadows and the dither are every frame
            const j = (py * gw + px) * 3;
            if (full || py % 6 === frameNo % 6) {
              // the water flows: sample the noise through a slowly drifting warp
              const wx = x + (noise(x / 110 + t * 0.06, y / 110) - 0.5) * 70;
              const wy = y + (noise(x / 110 + 31, y / 110 - t * 0.05) - 0.5) * 70;
              const l =
                noise(wx / 150 + t * 0.015, wy / 230 - t * 0.012) * 0.55 +
                noise(wx / 40 - t * 0.04, wy / 64 + t * 0.03) * 0.28 +
                noise(wx / 26 + 9, wy / 420 + t * 0.01) * 0.25;
              // colour scattered through the blue in patches: green, teal, a lighter sky blue.
              // The dither threshold jitters each patch's edge, so they break up into specks.
              const jit = (BAYER[(py & 3) * 4 + (px & 3)] - 0.5) * 0.34;
              const c1 = noise(wx / 70 + 40, wy / 90 + t * 0.01) + jit;
              const c2 = noise(wx / 45 + 120, wy / 45) + jit;
              const fam = c1 > 0.68 ? GREEN : c1 < 0.3 ? TEAL : c2 > 0.7 ? SKY : NAVY;
              let [r, gr, b] = ramp(fam, (l * 0.95 - 0.08) * light.bright);
              // the pale reflection
              for (const o of glows) {
                const q = ((x - o.x) ** 2 + (y - o.y - Math.sin(t * 0.2 + o.p) * 8) ** 2) / (o.r * o.r);
                if (q < 4) {
                  const a = Math.exp(-q * 1.6) * light.glowA;
                  r = mix(r, light.glow[0], a);
                  gr = mix(gr, light.glow[1], a);
                  b = mix(b, light.glow[2], a);
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
              base[j] = r;
              base[j + 1] = gr;
              base[j + 2] = b;
            }
            let sh = 1 - shade[py * gw + px], glint = 0;
            if (waves.length) {
              const wv = rippleAt(waves, x + P / 2, y + P / 2, t);
              sh *= 1 + wv * 0.9;
              glint = Math.max(0, wv - 0.3) * 140 * light.bright; // the sky caught on a crest
            }
            const r = base[j] * sh + glint, gr = base[j + 1] * sh + glint, b = base[j + 2] * sh + glint;
            const th = BAYER[(py & 3) * 4 + (px & 3)];
            // dither the water, then fade it into the page colour
            d[i] = mix(ink[0], Math.floor((r * 0.96) / STEP + th) * STEP, k);
            d[i + 1] = mix(ink[1], Math.floor((gr * 0.96) / STEP + th) * STEP, k);
            d[i + 2] = mix(ink[2], Math.floor((b * 0.96) / STEP + th) * STEP, k);
          }
        }
      }
      octx.putImageData(img, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, gw * P, gh * P);

      // --- ASCII: the surface, then the koi and their wakes. The surface is a dense, faint
      // texture of ripple characters on a coarser grid, flowing with the water: brighter
      // where the current runs, a few greener ones among the blue.
      for (const g of gutters) {
        for (let cy = 0; cy < H / (CH * 2); cy++) {
          for (let cx = Math.floor(g.x / (CW * 3)); cx < (g.x + g.w) / (CW * 3); cx++) {
            const h = ihash(cx, cy);
            if (h > 0.5) continue;
            const x = cx * CW * 3, y = cy * CH * 2;
            const k = fade(x);
            if (k < 0.05) continue;
            const r = noise(x / 48 + t * 0.2, y / 30 - t * 0.16);
            const a = (0.14 + Math.max(0, r - 0.45) * 1.1) * k;
            stampKoi(ctx, WAKE[Math.floor((h + r) * 40) % WAKE.length], h < 0.08 ? [120, 190, 140] : WAKE_RGB, a, x, y);
          }
        }
      }
      // while it's raining in Bengaluru it rains on the pond: small quick rings, more of them
      // the harder it falls
      if (weather?.rain && t > nextDrop) {
        const g = gutters[Math.floor(Math.random() * gutters.length)];
        waves.push({ x: g.x + Math.random() * g.w, y: Math.random() * H, t0: t, speed: 22, life: 1.2, amp: 0.35, len: 5 });
        nextDrop = t + 0.05 + 0.5 / (1 + (weather.precip ?? 0) * 2);
      }
      bodies.forEach((pts, fi) => drawKoi(ctx, fish[fi], pts, fade));
      // food: a pellet floating where it landed (its splash is a wave, pushed in feed)
      food = food.filter((p) => !p.eaten && t - p.t < 10);
      fish.forEach((f) => f.food && !food.includes(f.food) && (f.food = null));
      for (const p of food) stampKoi(ctx, 'o', [232, 196, 120], 0.95, p.x - 2, p.y - 4);
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
      still = motionPaused();
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
    // click the water in the margins to feed the koi: the nearest one in that margin comes over
    const inPond = (e) => (e.target === document.body || e.target === document.documentElement) && gutters.some((g) => e.clientX >= g.x && e.clientX < g.x + g.w);
    const feed = (e) => {
      if (still || !inPond(e)) return;
      const p = { x: e.clientX, y: e.clientY, t };
      food.push(p);
      waves.push({ x: p.x, y: p.y, t0: t, speed: 30, life: 2.6, amp: 0.7, len: 8 });
      const near = fish
        .filter((f) => !f.food && e.clientX >= f.g.x && e.clientX < f.g.x + f.g.w)
        .sort((a, b) => Math.hypot(a.spine[0][0] - p.x, a.spine[0][1] - p.y) - Math.hypot(b.spine[0][0] - p.x, b.spine[0][1] - p.y))[0];
      if (near) near.food = p;
    };
    // the cursor trailing across the water leaves small rings behind it
    let trail = { x: -99, y: -99, t: 0 };
    const hover = (e) => {
      const over = !still && inPond(e);
      document.body.style.cursor = over ? 'pointer' : '';
      if (!over || t - trail.t < 0.08 || Math.hypot(e.clientX - trail.x, e.clientY - trail.y) < 16 || waves.length > 40) return;
      trail = { x: e.clientX, y: e.clientY, t };
      waves.push({ x: e.clientX, y: e.clientY, t0: t, speed: 24, life: 1.6, amp: 0.3, len: 6 });
    };

    getWeather().then((w) => (weather = w));

    // the column's position decides the margins; the font changes the ASCII metrics, so
    // start again if it arrives later
    let started = false;
    const cancelIdle = whenIdle(() => {
      started = true;
      start();
    });
    document.fonts?.ready.then(() => started && start());
    window.addEventListener('resize', start);
    window.addEventListener('motion-change', start);
    window.addEventListener('pointerdown', feed);
    window.addEventListener('pointermove', hover);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelIdle();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', start);
      window.removeEventListener('motion-change', start);
      window.removeEventListener('pointerdown', feed);
      window.removeEventListener('pointermove', hover);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="pond fixed inset-0 w-screen h-screen pointer-events-none" aria-hidden="true" />;
}
