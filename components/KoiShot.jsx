'use client';

import { useEffect, useRef } from 'react';
import { body, drawKoi, follow, makeFish } from './KoiPond';

// A project's picture as the bottom of a shallow pool. Under the pointer a koi swims across
// it, curving past the pointer on its way, under the surface: its bow wave and wake bend the
// screenshot the way water does, and it casts a shadow on it. Moving the pointer stirs small
// ripples. When the pointer leaves, the koi carries on out and the water settles, then the
// plain screenshot is back. The water is a wave simulation on a coarse grid; the picture,
// the koi and the light are put together in a WebGL shader. Nothing runs on touch screens or
// with reduced motion, and nothing is set up until the first hover.

const CELL = 4; // css px per water cell
const DAMP = 0.982;

const VERT = `attribute vec2 p; varying vec2 uv; void main(){ uv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5); gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `precision mediump float;
varying vec2 uv;
uniform sampler2D img, koi, hgt;
uniform vec2 cell, fitScale, fitOff;
void main() {
  float l = texture2D(hgt, uv - vec2(cell.x, 0.0)).r, r = texture2D(hgt, uv + vec2(cell.x, 0.0)).r;
  float u = texture2D(hgt, uv - vec2(0.0, cell.y)).r, d = texture2D(hgt, uv + vec2(0.0, cell.y)).r;
  vec2 g = vec2(r - l, d - u);
  vec2 bent = uv + g * 0.09;                       // refraction: the floor seen through a sloped surface
  vec3 c = texture2D(img, (bent - fitOff) * fitScale).rgb;
  vec2 ku = uv + g * 0.05;
  float shadow = texture2D(koi, ku + vec2(-0.018, -0.03)).a;  // the koi's shadow on the floor
  c *= 1.0 - shadow * 0.38;
  vec4 k = texture2D(koi, ku);
  c = mix(c, k.rgb, k.a);
  float lit = dot(normalize(vec3(-g * 7.0, 1.0)), normalize(vec3(-0.45, -0.55, 0.7)));
  c += pow(max(lit, 0.0), 24.0) * 0.28 + (lit - 0.79) * 0.18;  // glints and shade on the slopes
  gl_FragColor = vec4(c, 1.0);
}`;

export default function KoiShot({ children }) {
  const ref = useRef(null);
  const glRef = useRef(null);

  useEffect(() => {
    const frame = ref.current, canvas = glRef.current;
    const card = frame.closest('a') ?? frame;
    const img = frame.querySelector('img');
    if (!img || !matchMedia('(hover: hover)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let gl, prog, tex, W, H, gw, gh, cur, prev, bytes, koiCanvas, kctx, dpr, koi, raf, last = 0, t = 0;
    let hovering = false, pointer = null, lastStir = 0, made = false, failed = false;

    const texture = (unit) => {
      const tx = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return tx;
    };

    const make = () => {
      made = true;
      gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: false });
      if (!gl) return (failed = true);
      const sh = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return (failed = true);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      tex = { img: texture(0), koi: texture(1), hgt: texture(2) };
      ['img', 'koi', 'hgt'].forEach((n, i) => gl.uniform1i(gl.getUniformLocation(prog, n), i));
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex.img);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      koiCanvas = document.createElement('canvas');
      kctx = koiCanvas.getContext('2d');
      size();
    };

    const size = () => {
      const box = frame.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      W = box.width;
      H = box.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      koiCanvas.width = canvas.width;
      koiCanvas.height = canvas.height;
      kctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gw = Math.ceil(W / CELL);
      gh = Math.ceil(H / CELL);
      cur = new Float32Array(gw * gh);
      prev = new Float32Array(gw * gh);
      bytes = new Uint8Array(gw * gh);
      gl.uniform2f(gl.getUniformLocation(prog, 'cell'), 1 / gw, 1 / gh);
      // object-fit: cover, anchored to the top, as the img is
      const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const iw = img.naturalWidth * s, ih = img.naturalHeight * s;
      gl.uniform2f(gl.getUniformLocation(prog, 'fitScale'), W / iw, H / ih);
      gl.uniform2f(gl.getUniformLocation(prog, 'fitOff'), (W - iw) / 2 / W, 0);
    };

    // push the water down (or up) in a small disc round (x, y)
    const stir = (x, y, amount, r = 1.5) => {
      const cx = x / CELL, cy = y / CELL;
      for (let j = Math.max(1, Math.floor(cy - r)); j <= Math.min(gh - 2, Math.ceil(cy + r)); j++)
        for (let i = Math.max(1, Math.floor(cx - r)); i <= Math.min(gw - 2, Math.ceil(cx + r)); i++) {
          const q = 1 - Math.hypot(i - cx, j - cy) / (r + 0.5);
          if (q > 0) cur[j * gw + i] += amount * q;
        }
    };

    // a koi starts just off the far side from the pointer and heads past it, out the other side
    const spawn = (px, py) => {
      const len = Math.min(W * 0.42, 150);
      const side = px < W / 2 ? 1 : -1; // start on the side away from the pointer
      const sx = side > 0 ? W + len * 0.4 : -len * 0.4;
      const sy = H * (0.25 + Math.random() * 0.5);
      const ex = side > 0 ? -len * 1.5 : W + len * 1.5;
      const ey = py + (py - sy) * 1.2;
      const f = makeFish({ x: sx, y: sy, w: 1, h: 1 }, Math.floor(Math.random() * 4), len);
      f.heading = Math.atan2(py - sy, px - sx);
      f.spine = f.spine.map((_, j) => [sx - Math.cos(f.heading) * f.seg * j, sy - Math.sin(f.heading) * f.seg * j]);
      f.via = { x: px, y: py };
      f.out = { x: ex, y: ey };
      f.v = Math.max(70, W * 0.32);
      f.thrust = 0.8;
      koi = f;
    };

    const moveKoi = (dt) => {
      const f = koi;
      const [hx, hy] = f.spine[0];
      // head for the pointer until it's close, then for the way out
      if (f.via && Math.hypot(f.via.x - hx, f.via.y - hy) < f.len * 0.6) f.via = null;
      const goal = f.via ?? f.out;
      const want = Math.atan2(goal.y - hy, goal.x - hx) + Math.sin(t * 2.2) * 0.12;
      const d = Math.atan2(Math.sin(want - f.heading), Math.cos(want - f.heading));
      f.heading += Math.max(-2.4 * dt, Math.min(2.4 * dt, d));
      f.beat += dt * 8;
      f.spine[0] = [hx + Math.cos(f.heading) * f.v * dt, hy + Math.sin(f.heading) * f.v * dt];
      follow(f);
      // the bow wave off the snout, a trough down the flanks, the tail beating the water
      stir(f.spine[0][0], f.spine[0][1], 0.45, 2);
      stir(f.spine[6][0], f.spine[6][1], -0.18, 2.5);
      const tail = body(f)[f.spine.length - 1];
      stir(tail[0], tail[1], Math.sin(f.beat) * 0.3, 2);
      // gone off the far side
      const xs = f.spine.map((p) => p[0]), ys = f.spine.map((p) => p[1]);
      if (!f.via && (Math.min(...xs) > W + 10 || Math.max(...xs) < -10 || Math.min(...ys) > H + 10 || Math.max(...ys) < -10)) koi = null;
    };

    const step = () => {
      let energy = 0;
      for (let j = 1; j < gh - 1; j++)
        for (let i = 1; i < gw - 1; i++) {
          const k = j * gw + i;
          const v = ((cur[k - 1] + cur[k + 1] + cur[k - gw] + cur[k + gw]) * 0.5 - prev[k]) * DAMP;
          prev[k] = v;
          energy += Math.abs(v);
        }
      [cur, prev] = [prev, cur];
      return energy / (gw * gh);
    };

    const render = () => {
      for (let k = 0; k < gw * gh; k++) bytes[k] = Math.max(0, Math.min(255, 128 + cur[k] * 60));
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, tex.hgt);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gw, gh, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, bytes);
      kctx.clearRect(0, 0, W, H);
      if (koi) drawKoi(kctx, koi, body(koi), () => 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, tex.koi);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, koiCanvas);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      if (koi) moveKoi(dt);
      if (hovering && pointer && now - lastStir > 60 && pointer.moved) {
        stir(pointer.x, pointer.y, 0.45, 1.2);
        pointer.moved = false;
        lastStir = now;
      }
      // the water runs at a steady rate, twice a frame, whatever the frame rate
      const energy = step() + step();
      render();
      // keep going while there's a koi, the pointer is here, or the water is still moving
      if (koi || hovering || energy > 0.002) raf = requestAnimationFrame(loop);
      else canvas.classList.remove('on');
    };

    const enter = (e) => {
      if (!made) make();
      if (failed || !img.complete) return;
      hovering = true;
      const box = frame.getBoundingClientRect();
      const px = e.clientX != null ? e.clientX - box.left : W / 2, py = e.clientY != null ? e.clientY - box.top : H / 2;
      if (!koi) spawn(Math.max(0, Math.min(W, px)), Math.max(0, Math.min(H, py)));
      canvas.classList.add('on');
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const move = (e) => {
      const box = frame.getBoundingClientRect();
      pointer = { x: e.clientX - box.left, y: e.clientY - box.top, moved: true };
    };
    const leave = () => {
      hovering = false;
      pointer = null;
    };
    const resize = () => gl && !failed && size();

    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', resize);
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <span ref={ref} className="shot">
      {children}
      <canvas ref={glRef} aria-hidden="true" />
    </span>
  );
}
