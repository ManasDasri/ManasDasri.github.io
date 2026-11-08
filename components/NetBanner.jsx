'use client';

import { useEffect, useRef } from 'react';
import { makeStamper, motionPaused, whenIdle } from './KoiPond';

// The banner: a small neural network in 3D, drawn in shaded ASCII. Nodes are lit spheres,
// edges are lines shaded by depth, and signals run a forward pass through it, lighting each
// node they reach. It turns slowly on its own; drag to spin it. Rendered into a character
// grid with a depth buffer, so nearer parts cover farther ones.

const CW = 7; // cell, css px
const CH = 12;
const FPS = 30;
const FONT = `400 11px "Space Mono", monospace`;
const RAMP = ' .,-~:;=!*#$@';
const LAYERS = [4, 6, 6, 3];
const NODE_R = 0.17; // world units
const FANOUT = 3; // each node links to its nearest few in the next layer
const LIGHT = (() => {
  const v = [-0.45, -0.6, 0.66], n = Math.hypot(...v);
  return v.map((x) => x / n);
})();

function buildNet() {
  // each layer is a ring of nodes in the y–z plane, the layers spaced along x
  const nodes = [];
  LAYERS.forEach((n, li) => {
    const x = (li / (LAYERS.length - 1) - 0.5) * 3.2;
    const r = n === 1 ? 0 : 0.22 + n * 0.07;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + li * 0.4;
      nodes.push({ x, y: Math.cos(a) * r, z: Math.sin(a) * r, layer: li, act: 0 });
    }
  });
  const edges = [];
  nodes.forEach((a, i) => {
    const next = nodes.map((b, j) => ({ b, j })).filter(({ b }) => b.layer === a.layer + 1);
    next.sort((p, q) => Math.hypot(p.b.y - a.y, p.b.z - a.z) - Math.hypot(q.b.y - a.y, q.b.z - a.z));
    for (const { j } of next.slice(0, FANOUT)) edges.push({ a: i, b: j });
  });
  return { nodes, edges };
}

export default function NetBanner() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const stamp = makeStamper(FONT, CW, CH);
    const net = buildNet();
    let W, H, cols, rows, zbuf, lum, kind, colours, raf, last = 0, visible = true, ready = false;
    let still = motionPaused();
    let yaw = 0.35, pitch = -0.12, vyaw = 0, vpitch = 0, drag = null;
    let pulses = [], nextFire = 0, t = 0;

    const readColours = () => {
      const css = getComputedStyle(document.documentElement);
      const rgb = (token) => css.getPropertyValue(`--c-${token}`).trim().split(/\s+/).map(Number);
      colours = { edge: rgb('mute'), node: rgb('text'), hot: rgb('signal'), cool: rgb('accent') };
    };

    const setup = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CW);
      rows = Math.ceil(H / CH);
      zbuf = new Float32Array(cols * rows);
      lum = new Float32Array(cols * rows);
      kind = new Uint8Array(cols * rows); // 0 empty, 1 edge, 2 node, 3 lit node or signal
      readColours();
    };

    // world → screen (px) with a little perspective; z grows toward the viewer
    const project = (p) => {
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;
      const y2 = p.y * cp - z1 * sp, z2 = p.y * sp + z1 * cp;
      const scale = Math.min(W / 6.2, H / 3.9) / (1 - z2 * 0.18);
      // up and to the right, clear of the name in the bottom left
      return { x: W * (W < 640 ? 0.5 : 0.62) + x1 * scale, y: H * 0.3 + y2 * scale, z: z2, s: scale };
    };

    const chars = new Array(0);
    const plot = (px, py, z, l, k, ch) => {
      const cx = Math.floor(px / CW), cy = Math.floor(py / CH);
      if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return;
      const i = cy * cols + cx;
      if (kind[i] && z <= zbuf[i]) return;
      zbuf[i] = z;
      lum[i] = l;
      kind[i] = k;
      chars[i] = ch;
    };

    const render = () => {
      kind.fill(0);
      const P = net.nodes.map(project);
      // edges, dimmer the farther back they are
      for (const e of net.edges) {
        const a = P[e.a], b = P[e.b];
        // drawn as a wireframe line: the character follows the line's slope on screen
        const ang = Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
        const t = ((ang % 180) + 180) % 180;
        const ch = t < 22.5 || t >= 157.5 ? '-' : t < 67.5 ? '\\' : t < 112.5 ? '|' : '/';
        const n = Math.ceil(Math.hypot((b.x - a.x) / CW, (b.y - a.y) / CH) * 1.5);
        for (let s = 0; s <= n; s++) {
          const u = s / n, z = a.z + (b.z - a.z) * u;
          plot(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, z - 0.01, 0.25 + 0.35 * (z + 1) / 2, 1, ch);
        }
      }
      // signals in flight: a bright head with a short tail
      for (const p of pulses) {
        const a = P[net.edges[p.e].a], b = P[net.edges[p.e].b];
        for (let k = 0; k < 3; k++) {
          const u = Math.max(0, p.u - k * 0.04), z = a.z + (b.z - a.z) * u;
          plot(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, z + 0.02, 1 - k * 0.3, 3);
        }
      }
      // nodes: spheres lit from the top left, glowing while active
      net.nodes.forEach((node, i) => {
        const c = P[i], r = NODE_R * c.s;
        for (let py = c.y - r; py <= c.y + r; py += CH / 2)
          for (let px = c.x - r; px <= c.x + r; px += CW / 2) {
            const dx = (px - c.x) / r, dy = (py - c.y) / r, d2 = dx * dx + dy * dy;
            if (d2 > 1) continue;
            const nz = Math.sqrt(1 - d2);
            const lit = Math.max(0, dx * LIGHT[0] + dy * LIGHT[1] + nz * LIGHT[2]);
            plot(px, py, c.z + nz * NODE_R, Math.min(1, 0.22 + 0.78 * lit + node.act * 0.4), node.act > 0.15 ? 3 : 2);
          }
      });

      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < kind.length; i++) {
        const k = kind[i];
        if (!k) continue;
        const l = lum[i];
        const ch = k === 1 ? chars[i] : RAMP[Math.max(1, Math.min(RAMP.length - 1, Math.round(l * (RAMP.length - 1))))];
        const col = k === 3 ? colours.hot : k === 2 ? colours.node : colours.edge;
        stamp(ctx, ch, col, k === 1 ? l : 0.35 + 0.65 * l, (i % cols) * CW, Math.floor(i / cols) * CH);
      }
    };

    // a forward pass: inputs fire, each arrival lights its node and fires onward
    const fire = (from) => {
      const out = net.edges.map((e, i) => (e.a === from ? i : -1)).filter((i) => i >= 0);
      for (const e of out) if (Math.random() < 0.45) pulses.push({ e, u: 0 });
    };
    const step = (dt) => {
      t += dt;
      if (!drag) {
        yaw += (0.12 + vyaw) * dt;
        pitch += vpitch * dt;
        vyaw *= 0.95;
        vpitch *= 0.95;
      }
      pitch = Math.max(-1.2, Math.min(1.2, pitch));
      if (t > nextFire) {
        const inputs = net.nodes.map((n, i) => (n.layer === 0 ? i : -1)).filter((i) => i >= 0);
        const i = inputs[Math.floor(Math.random() * inputs.length)];
        net.nodes[i].act = 1;
        fire(i);
        nextFire = t + 0.5 + Math.random() * 0.9;
      }
      for (const p of pulses) {
        p.u += dt * 1.1;
        if (p.u >= 1) {
          const b = net.edges[p.e].b;
          net.nodes[b].act = 1;
          fire(b);
        }
      }
      pulses = pulses.filter((p) => p.u < 1).slice(-60);
      for (const n of net.nodes) n.act *= Math.exp(-dt * 2.2);
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      step(dt);
      render();
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (!ready || still || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    setup();
    render();
    const cancelIdle = whenIdle(() => {
      ready = true;
      run();
    });

    // drag to spin; the spin carries on a little after letting go
    const header = canvas.parentElement;
    const down = (e) => {
      drag = { x: e.clientX, y: e.clientY };
      vyaw = vpitch = 0;
    };
    const move = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag = { x: e.clientX, y: e.clientY };
      yaw += dx * 0.008;
      pitch += dy * 0.008;
      vyaw = dx * 0.4;
      vpitch = dy * 0.4;
      if (still) render();
    };
    const up = () => (drag = null);
    const onResize = () => {
      setup();
      render();
    };
    const onMotion = () => {
      still = motionPaused();
      run();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      run();
    });
    io.observe(canvas);
    header.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('resize', onResize);
    window.addEventListener('motion-change', onMotion);
    document.addEventListener('visibilitychange', run);
    document.fonts?.ready.then(() => render());
    return () => {
      cancelIdle();
      cancelAnimationFrame(raf);
      io.disconnect();
      header.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('motion-change', onMotion);
      document.removeEventListener('visibilitychange', run);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className="absolute inset-0 w-full h-full touch-pan-y" aria-hidden="true" />
      <p className="absolute top-4 left-6 sm:left-9 m-0 font-mono text-[11px] text-mute pointer-events-none select-none max-sm:hidden">
        a small network, mid forward pass · drag to spin it
      </p>
    </>
  );
}
