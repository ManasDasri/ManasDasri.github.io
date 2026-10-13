'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import Scramble from './Scramble';
import { BitIndex } from './Bits';

// Notebook layout: the title sits in a sticky left margin, content on the right.
// The content rises in when scrolled to, with the same motion as a page entrance.
export default function Section({ id, title, note, index, children }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  return (
    <section id={id} className="px-6 sm:px-9 py-14 sm:py-20 border-t border-line/60 md:grid md:grid-cols-[170px_1fr] md:gap-10">
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
  );
}
