'use client';

import { createContext, useContext, useRef } from 'react';
import { useInView } from 'framer-motion';

// Inside a TabbedSection tab, a Section is just its content: the tab group owns the title.
export const InTab = createContext(false);

// The break between sections: a hatched strip across the whole window, over the pond.
export function Band({ className = '' }) {
  return <div className={`band ${className}`} aria-hidden="true" />;
}

// The title and note sit above the content; the content rises in when scrolled to, with
// the same motion as a page entrance.
export default function Section({ id, title, note, children }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  if (useContext(InTab)) return children;
  return (
    <>
      <Band />
      <section id={id} className="px-6 sm:px-9 py-12 sm:py-16">
        <header className="mb-8">
          <h2 className="font-serif text-4xl text-text leading-none">{title}</h2>
          {note && <p className="font-mono text-xs text-mute leading-relaxed mt-3">{note}</p>}
        </header>
        <div ref={ref} className={`reveal min-w-0 ${seen ? 'in' : ''}`}>
          {children}
        </div>
      </section>
    </>
  );
}
