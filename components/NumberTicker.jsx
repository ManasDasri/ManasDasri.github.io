'use client';

import { useEffect, useRef, useState } from 'react';

// Forme's number ticker (github.com/ManasDasri/forme, src/registry/number-ticker): counts up
// to its value when it scrolls into view. Screen readers get the final number only.
export default function NumberTicker({ value, duration = 1600, className = '' }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()));
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!seen) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setDisplay(value);
    const began = performance.now();
    let frame = 0;
    const tick = (now) => {
      const k = Math.min(1, (now - began) / duration);
      setDisplay(k < 1 ? Math.round(value * (1 - (1 - k) ** 4)) : value);
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seen, value, duration]);
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      <span aria-hidden="true">{display.toLocaleString('en-US')}</span>
      <span className="sr-only">{value.toLocaleString('en-US')}</span>
    </span>
  );
}
