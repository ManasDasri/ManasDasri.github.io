'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function Typewriter({ words }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const word = words[i];
    if (!deleting && n === word.length) {
      const t = setTimeout(() => setDeleting(true), 1600);
      return () => clearTimeout(t);
    }
    if (deleting && n === 0) {
      setDeleting(false);
      setI((i + 1) % words.length);
      return;
    }
    const t = setTimeout(() => setN(n + (deleting ? -1 : 1)), deleting ? 35 : 70);
    return () => clearTimeout(t);
  }, [n, deleting, i, words, reduce]);

  if (reduce) return <span>{words.join(' / ')}</span>;

  return (
    <span aria-label={words.join(' / ')}>
      <span aria-hidden="true">{words[i].slice(0, n)}</span>
      <span className="caret" aria-hidden="true" />
    </span>
  );
}
