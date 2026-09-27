'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'building', label: 'Building' },
  { id: 'now', label: 'Now' },
  { id: 'log', label: 'Log' },
  { id: 'skills', label: 'Stack' },
  { id: 'activity', label: 'Activity' },
  { id: 'proof-of-work', label: 'Pull requests' },
  { id: 'writing', label: 'Writing' },
];

// Transparent over the banner; gains a background and the name once you scroll.
// `solid` is for pages without a banner.
export default function TopNav({ solid = false }) {
  const [scrolled, setScrolled] = useState(solid);
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (solid) return;
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      if (window.scrollY < 80) setActive(null); // back on the banner: no section is current
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [solid]);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Main"
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled ? 'bg-ink/85 backdrop-blur-md border-b border-line/60' : 'bg-gradient-to-b from-ink/90 to-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-9 h-12 flex items-center gap-6">
        <a
          href="/#top"
          className={`font-head font-bold tracking-tight text-text whitespace-nowrap transition-opacity duration-300 ${
            scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none max-sm:hidden'
          }`}
        >
          Manas Dasari
        </a>
        <div className="no-scrollbar flex-1 flex gap-5 overflow-x-auto md:justify-end">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`/#${s.id}`}
              aria-current={active === s.id ? 'true' : undefined}
              className={`font-mono text-xs whitespace-nowrap transition-colors ${
                active === s.id ? 'text-signal' : 'text-mute hover:text-text'
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>
        <button
          onClick={() => window.dispatchEvent(new Event('open-palette'))}
          className="font-mono text-xs text-mute border border-line rounded-md px-2 py-1 hover:text-signal hover:border-signal transition-colors"
          aria-label="Open command palette"
        >
          ⌘K
        </button>
      </div>
    </nav>
  );
}
