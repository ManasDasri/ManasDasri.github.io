'use client';

import { useEffect, useState } from 'react';

export default function Typewriter({ words }) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const [i, setI] = useState(0);
  const [n, setN] = useState(words[0].length);
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

  if (reduce) return <span>{words[0]}</span>;

  return (
    <span className="inline-grid align-bottom" aria-label={words.join(' / ')}>
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">{words.reduce((a, b) => a.length > b.length ? a : b)}</span>
      <span className="col-start-1 row-start-1">
      <span aria-hidden="true">{words[i].slice(0, n)}</span>
      <span className="caret" aria-hidden="true" />
      </span>
    </span>
  );
}
