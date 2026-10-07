'use client';

import { useEffect, useRef } from 'react';

// First load of a visit: a field of LED dots switches on in a diagonal sweep,
// then the overlay fades (the fade is pure CSS, so it clears even without JS).
const PITCH = 10;
const SWEEP_MS = 650;

export default function Entrance() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || getComputedStyle(canvas.parentElement).display === 'none') return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    const cols = Math.ceil(w / PITCH), rows = Math.ceil(h / PITCH);
    let raf, start;
    const frame = (t) => {
      start ??= t;
      const p = (t - start) / SWEEP_MS;
      ctx.clearRect(0, 0, w, h);
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const d = (x / cols + y / rows) / 2; // 0 top-left → 1 bottom-right
          const lit = Math.max(0, Math.min(1, (p - d) * 6));
          // the wavefront burns bright, then settles to a dim glow behind it
          ctx.fillStyle = lit > 0 ? `rgba(124,245,228,${0.18 + 0.75 * lit * Math.max(0, 1 - Math.max(0, p - d - 0.12) * 3)})` : '#0B2A31';
          ctx.fillRect(x * PITCH, y * PITCH, 3, 3);
        }
      if (p < 1.6) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="entrance" aria-hidden="true">
      <canvas ref={ref} className="w-full h-full" />
    </div>
  );
}
