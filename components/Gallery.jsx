'use client';

import { useEffect, useRef, useState } from 'react';

// A project's screenshots: the first spans the width, the rest sit two by two. Clicking
// one opens it full size in a native <dialog> (Esc closes, arrow keys step through).
export default function Gallery({ shots }) {
  const dialog = useRef(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const d = dialog.current;
    if (open == null) {
      if (d.open) d.close();
      return; // an effect may only return a clean-up function (or nothing)
    }
    if (!d.open) d.showModal();
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % shots.length);
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + shots.length) % shots.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, shots.length]);

  const shot = open == null ? null : shots[open];
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {shots.map((s, k) => (
          <figure key={s.src} className={`m-0 ${k === 0 ? 'sm:col-span-2' : ''}`}>
            <button type="button" onClick={() => setOpen(k)} className="block w-full cursor-zoom-in rounded-lg focus-visible:outline-offset-4" aria-label={`Enlarge: ${s.alt}`}>
              <img src={s.src} alt={s.alt} loading="lazy" className="w-full rounded-lg border border-line hover:border-signal/50 transition-colors" />
            </button>
            <figcaption className="font-mono text-xs text-mute mt-2">{s.alt}</figcaption>
          </figure>
        ))}
      </div>
      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && setOpen(null)}
        className="m-auto max-w-[min(1200px,94vw)] w-full bg-transparent p-0 backdrop:bg-ink/85 backdrop:backdrop-blur-sm"
      >
        {shot && (
          <figure className="m-0">
            <img src={shot.src} alt={shot.alt} className="w-full rounded-lg border border-line" />
            <figcaption className="flex items-center gap-4 mt-3 font-mono text-xs text-text/80">
              <span className="flex-1">{shot.alt}</span>
              {shots.length > 1 && <span className="text-mute">{open + 1} / {shots.length} · ← →</span>}
              <button type="button" onClick={() => setOpen(null)} className="text-mute hover:text-signal border border-line rounded px-2 py-0.5">
                close · esc
              </button>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
