'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

// Text "decodes" from random glyphs. trigger: 'mount' | 'view'. Re-runs on hover.
export default function Scramble({ text, trigger = 'mount', duration = 800, className = '' }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const [out, setOut] = useState(text);

  const run = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const frame = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const shown = Math.floor(p * text.length);
      setOut(
        [...text]
          .map((c, i) => (i < shown || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join('')
      );
      if (p < 1) raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
  }, [text, duration]);

  useEffect(() => {
    if (trigger === 'mount') run();
    else {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          run();
          io.disconnect();
        }
      });
      io.observe(ref.current);
      return () => io.disconnect();
    }
    return () => cancelAnimationFrame(raf.current);
  }, [run, trigger]);

  return (
    <span ref={ref} className={className} onMouseEnter={run} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}
