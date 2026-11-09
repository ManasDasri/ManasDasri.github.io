'use client';

import { useEffect, useRef, useState } from 'react';
import { DOCS } from '@/lib/docs';

// A link that opens a document in the site's viewer (components/DocViewer.jsx). Its letters
// lift away one after another as the sheet grows out of it, and when the sheet floats back
// they drop in again, decoding from noise to the word.
const NOISE = '#%&@*+=-:/<>';

export default function DocLink({ doc, className = '', children }) {
  const ref = useRef(null);
  const word = String(children);
  const [text, setText] = useState(word);
  const [phase, setPhase] = useState('');

  useEffect(() => {
    let raf;
    const decode = () => {
      const began = performance.now();
      const tick = (now) => {
        const t = now - began;
        // each letter settles 55ms after the one before it; until then it's noise
        setText([...word].map((c, i) => (c === ' ' || t > 140 + i * 55 ? c : NOISE[Math.floor(Math.random() * NOISE.length)])).join(''));
        if (t < 160 + word.length * 55) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const on = (e) => {
      if (e.detail.from !== ref.current) return;
      if (e.detail.state === 'opening') setPhase('away');
      if (e.detail.state === 'closed') {
        setPhase('back');
        decode();
      }
    };
    window.addEventListener('doc-state', on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('doc-state', on);
    };
  }, [word]);

  return (
    <a ref={ref} href={DOCS[doc].file} data-doc={doc} className={`${className} doc-word${phase ? ` doc-word-${phase}` : ''}`} aria-label={word}>
      {[...text].map((c, i) => (
        <span key={i} className="doc-ch" style={{ '--i': i }} aria-hidden="true">
          {c}
        </span>
      ))}
    </a>
  );
}
