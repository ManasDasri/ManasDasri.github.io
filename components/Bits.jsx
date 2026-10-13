'use client';

import { useEffect, useState } from 'react';

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

// Loading: one bit grows into a full byte, then starts again.
const SEQUENCE = ['0', '1', '01', '101', '101101', '████████'];

export function BitLoader({ label }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
