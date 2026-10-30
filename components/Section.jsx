'use client';

import { createContext, useContext, useRef } from 'react';
import { useInView } from 'framer-motion';
import Scramble from './Scramble';
import { BitIndex } from './Bits';

// Inside a TabbedSection tab, a Section is just its content: the tab group owns the title.
export const InTab = createContext(false);

// The break between sections: a hatched strip across the whole window, over the pond.
export function Band({ className = '' }) {
  return <div className={`band ${className}`} aria-hidden="true" />;
}

// The title and note sit above the content; the content rises in when scrolled to, with
// the same motion as a page entrance.
export default function Section({ id, title, note, index, children }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  if (useContext(InTab)) return children;
  return (
    <>
      <Band />
      <section id={id} className="px-6 sm:px-9 py-12 sm:py-16">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <div>
            {index && <BitIndex value={index} />}
            <h2 className="shimmer font-head text-2xl sm:text-3xl font-bold text-text tracking-tight w-fit">
              <Scramble text={title} trigger="view" />
            </h2>
          </div>
          {note && <p className="font-mono text-xs text-mute leading-relaxed max-w-[44ch] sm:text-right">{note}</p>}
        </header>
        <div ref={ref} className={`reveal min-w-0 ${seen ? 'in' : ''}`}>
          {children}
        </div>
      </section>
    </>
  );
}
