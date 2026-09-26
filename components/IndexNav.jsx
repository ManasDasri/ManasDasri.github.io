'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'building', label: 'Building' },
  { id: 'now', label: 'Now' },
  { id: 'skills', label: 'Skills' },
  { id: 'activity', label: 'Activity' },
  { id: 'proof-of-work', label: 'Proof of Work' },
  { id: 'writing', label: 'Writing' },
];

export default function IndexNav() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const [shown, setShown] = useState(false);

  // stay out of the way of the hero banner
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      className={`hidden lg:flex flex-col gap-3 fixed top-1/2 -translate-y-1/2 right-8 xl:right-14 z-20 transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-label="Section index"
    >
      <span className="font-display text-xs text-mute tracking-widest mb-1">INDEX</span>
      {SECTIONS.map((s) => (
        <a
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
