'use client';

import { createContext, useContext, useRef } from 'react';
import { useInView } from 'framer-motion';
import Scramble from './Scramble';
import { BitIndex } from './Bits';

// Inside a TabbedSection tab, a Section is just its content: the tab group owns the title.
export const InTab = createContext(false);

// The break between sections: a hatched strip across the whole window, over the pond.
export function Band() {
  return <div className="band" aria-hidden="true" />;
}

// Notebook layout: the title sits in a sticky left margin, content on the right.
// The content rises in when scrolled to, with the same motion as a page entrance.
export default function Section({ id, title, note, index, children }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  if (useContext(InTab)) return children;
  return (
    <>
    <Band />
    <section id={id} className="px-6 sm:px-9 py-12 sm:py-16 md:grid md:grid-cols-[170px_1fr] md:gap-10">
      <div className="mb-7 md:mb-0">
        <div className="md:sticky md:top-12">
          {index && <BitIndex value={index} />}
          <h2 className="shimmer font-head text-xl font-bold text-text tracking-tight w-fit">
            <Scramble text={title} trigger="view" />
          </h2>
          {note && <p className="font-mono text-xs text-mute mt-1.5 leading-relaxed">{note}</p>}
        </div>
      </div>
      <div ref={ref} className={`reveal min-w-0 ${seen ? 'in' : ''}`}>
        {children}
      </div>
    </section>
    </>
  );
}
