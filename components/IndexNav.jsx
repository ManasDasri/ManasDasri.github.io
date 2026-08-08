'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'building', label: 'Building' },
  { id: 'skills', label: 'Skills' },
  { id: 'activity', label: 'Activity' },
  { id: 'proof-of-work', label: 'Proof of Work' },
  { id: 'writing', label: 'Writing' },
];

export default function IndexNav() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className="hidden lg:flex flex-col gap-3 fixed top-1/2 -translate-y-1/2 right-8 xl:right-14 z-20"
      aria-label="Section index"
    >
      <span className="font-display text-xs text-mute tracking-widest mb-1">INDEX</span>
      {SECTIONS.map((s) => (
        
          key={s.id}
          href={`#${s.id}`}
          className={`font-display text-xs no-underline transition-colors ${
            active === s.id ? 'text-signal' : 'text-mute hover:text-text'
          }`}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
