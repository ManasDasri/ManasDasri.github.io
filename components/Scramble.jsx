'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

// Text "decodes" from random glyphs. trigger: 'mount' | 'view'.
// The real text stays in the flow (invisible) and the glyphs are overlaid on it,
// so the scramble never changes the element's size or reflows the page.
export default function Scramble({ text, trigger = 'mount', duration = 800, hover = true, className = '' }) {
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
      return () => {
        io.disconnect();
        cancelAnimationFrame(raf.current);
      };
    }
    return () => cancelAnimationFrame(raf.current);
  }, [run, trigger]);

  return (
    <span ref={ref} className={`relative inline-block ${className}`} onMouseEnter={hover ? run : undefined}>
      <span className="sr-only">{text}</span>
      <span className="invisible" aria-hidden="true">{text}</span>
      <span className="absolute inset-0" aria-hidden="true">{out}</span>
    </span>
  );
}
