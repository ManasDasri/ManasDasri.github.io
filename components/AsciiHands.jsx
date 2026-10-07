'use client';

import { useEffect, useState } from 'react';
import { HANDS } from '@/lib/asciiHands';

// A human hand and a robot hand reaching for each other (after Michelangelo's
// Creation of Adam), with a spark flickering in the gap. Hover and they lean in.
const COLOUR = { h: 'text-accent', r: 'text-signal' };
const SPARKS = ['.', '+', '*', '+', '·', '*'];

function Part({ chars, owners }) {
  // group runs of the same owner into one span
  const runs = [];
  for (let i = 0; i < chars.length; i++) {
    const last = runs[runs.length - 1];
    if (last && last.o === owners[i]) last.t += chars[i];
    else runs.push({ o: owners[i], t: chars[i] });
  }
  return runs.map((r, i) => (
    <span key={i} className={COLOUR[r.o]}>
      {r.t}
    </span>
  ));
}

export default function AsciiHands() {
  const [spark, setSpark] = useState('*');
  const [near, setNear] = useState(false);
  const [sx, sy] = HANDS.spark;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setSpark(SPARKS[(Math.random() * SPARKS.length) | 0]), 160);
    return () => clearInterval(t);
  }, []);

  const lean = 'transition-transform duration-500 ease-out inline-block';
  return (
    <pre
      role="img"
      aria-label="ASCII art: a human hand and a robot hand reaching toward each other, a spark between their fingertips"
      onPointerEnter={() => setNear(true)}
      onPointerLeave={() => setNear(false)}
      className="mx-auto w-fit font-mono leading-[1.1] m-0 select-none"
      // 180 columns at 0.6em each: shrink to fit narrow screens, cap at 7px
      style={{ fontSize: 'min(7px, calc((100vw - 64px) / 108))' }}
    >
      {HANDS.chars.map((line, y) => {
        const row = line.padEnd(HANDS.cols);
        const own = HANDS.owners[y].padEnd(HANDS.cols);
        return (
          <div key={y} className="whitespace-pre">
            <span className={lean} style={{ transform: near ? 'translateX(1.2em)' : 'none' }}>
              <Part chars={row.slice(0, sx)} owners={own.slice(0, sx)} />
            </span>
            <span className={y === sy ? `${near ? 'text-text scale-150' : 'text-signal/80'} inline-block transition-transform` : ''}>
              {y === sy ? spark : row[sx]}
            </span>
            <span className={lean} style={{ transform: near ? 'translateX(-1.2em)' : 'none' }}>
              <Part chars={row.slice(sx + 1)} owners={own.slice(sx + 1)} />
            </span>
          </div>
        );
      })}
    </pre>
  );
}
