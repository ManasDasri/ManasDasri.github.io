'use client';

import { useEffect, useRef } from 'react';
import { body, drawKoi, makeFish, swim } from './KoiPond';

// For the 404: one koi circling a small dark pool, as if looking for the page.
export default function LostKoi() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const S = 300;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = canvas.height = S * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // it wanders toward spots in the middle of the pool, so it turns before reaching the edge
    const koi = makeFish({ x: 100, y: 100, w: S - 200, h: S - 200 }, 0, 110);
    let raf, last = performance.now(), t = 0;
    const draw = () => {
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, S, S);
      drawKoi(ctx, koi, body(koi), () => 1);
    };
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      swim(koi, t, dt);
      draw();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (let i = 0; i < 60; i++) swim(koi, (t += 1 / 30), 1 / 30);
      draw();
    } else raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative w-[300px] h-[300px] max-w-full aspect-square rounded-full bg-paper border border-dashed border-line overflow-hidden" aria-hidden="true">
      <canvas ref={ref} className="w-full h-full" />
    </div>
  );
}
