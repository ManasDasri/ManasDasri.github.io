'use client';

import { useEffect, useRef, useState } from 'react';

// The site's mark: a bit. Filled squares are 1s, hollow ones 0s.
function Row({ bits, size = 7 }) {
  return (
    <span className="inline-flex gap-[3px] align-middle" aria-hidden="true">
      {[...bits].map((b, i) => (
        <span
          key={i}
          style={{ width: size, height: size }}
          className={`rounded-[1px] ${b === '1' ? 'bg-signal' : b === '█' ? 'bg-signal/80' : 'border border-line'}`}
        />
      ))}
    </span>
  );
}

// A section's index in binary; the bits grow in one at a time when it scrolls into view.
export function BitIndex({ value, width = 4 }) {
  const ref = useRef(null);
  const target = value.toString(2).padStart(width, '0');
  const [shown, setShown] = useState('');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setShown(target);
    let t;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const grow = (n) => {
        setShown(target.slice(0, n));
        if (n < target.length) t = setTimeout(() => grow(n + 1), 90);
      };
      grow(1);
    });
    io.observe(ref.current);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [target]);

  return (
    <span ref={ref} className="flex items-center gap-2 mb-2 min-h-[11px]" title={`section ${value} · 0b${target}`}>
      <Row bits={shown.padEnd(target.length, ' ')} />
      <span className="font-mono text-[10px] text-mute/70">0b{shown || '0'}</span>
    </span>
  );
}

// Loading: one bit grows into a full byte, then starts again.
const SEQUENCE = ['0', '1', '01', '101', '101101', '████████'];

export function BitLoader({ label }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % SEQUENCE.length), 220);
    return () => clearInterval(t);
  }, []);
  return (
    <span role="status" className="inline-flex items-center gap-3">
      <Row bits={SEQUENCE[i]} />
      {label && <span className="font-mono text-xs text-mute">{label}</span>}
    </span>
  );
}
