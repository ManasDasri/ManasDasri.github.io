'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { FiActivity, FiClock, FiCommand, FiCpu, FiFeather, FiGitPullRequest, FiHome, FiLayers, FiZap } from 'react-icons/fi';

const ITEMS = [
  { id: 'top', label: 'Top', icon: FiHome },
  { id: 'building', label: 'Building', icon: FiLayers },
  { id: 'now', label: 'Now', icon: FiZap },
  { id: 'log', label: 'Log', icon: FiClock },
  { id: 'skills', label: 'Stack', icon: FiCpu },
  { id: 'activity', label: 'Activity', icon: FiActivity },
  { id: 'proof-of-work', label: 'Pull requests', icon: FiGitPullRequest },
  { id: 'writing', label: 'Writing', icon: FiFeather },
];

// Vertical on the left where there's room beside the content column, a
// floating bar at the bottom everywhere else. Base icon size shrinks on phones.
function useLayout() {
  const [layout, setLayout] = useState({ vertical: false, base: 40 });
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1280px)');
    const narrow = window.matchMedia('(max-width: 480px)');
    const update = () => setLayout({ vertical: wide.matches, base: narrow.matches ? 32 : 40 });
    update();
    wide.addEventListener('change', update);
    narrow.addEventListener('change', update);
    return () => {
      wide.removeEventListener('change', update);
      narrow.removeEventListener('change', update);
    };
  }, []);
  return layout;
}

// Grows as the pointer gets closer along the dock's axis, like the macOS dock.
function DockItem({ label, icon: Icon, href, onClick, active, mouse, vertical, base }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const distance = useTransform(mouse, (m) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || m === Infinity) return Infinity;
    return vertical ? m - (r.top + r.height / 2) : m - (r.left + r.width / 2);
  });
  const target = useTransform(distance, [-140, 0, 140], [base, base * 1.6, base]);
  const size = useSpring(target, { mass: 0.1, stiffness: 180, damping: 14 });
  const Tag = href ? motion.a : motion.button;

  return (
    <Tag
      ref={ref}
      href={href}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'true' : undefined}
      style={{ width: reduce ? base : size, height: reduce ? base : size }}
      className={`group relative flex items-center justify-center rounded-xl border transition-colors ${
        active ? 'bg-raised border-signal/50 text-signal' : 'bg-paper border-line text-mute hover:text-text'
      }`}
    >
      <Icon className="w-[44%] h-[44%]" aria-hidden="true" />
      <span
        className={`pointer-events-none absolute whitespace-nowrap rounded-md bg-paper border border-line px-2 py-1 font-mono text-xs text-text opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity ${
          vertical ? 'left-full ml-3' : 'bottom-full mb-3'
        }`}
      >
        {label}
      </span>
      {active && (
        <span
          className={`absolute w-1 h-1 rounded-full bg-signal ${
            vertical ? '-left-[7px] top-1/2 -translate-y-1/2' : '-bottom-[6px] left-1/2 -translate-x-1/2'
          }`}
          aria-hidden="true"
        />
      )}
    </Tag>
  );
}

export default function Dock() {
  const { vertical, base } = useLayout();
  const mouse = useMotionValue(Infinity);
  const [active, setActive] = useState('top');

  useEffect(() => {
    const els = ITEMS.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setActive(window.scrollY < 80 ? 'top' : e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => window.scrollY < 80 && setActive('top');
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const common = { mouse, vertical, base };

  return (
    <nav
      aria-label="Sections"
      style={{ viewTransitionName: 'dock' }}
      onMouseMove={(e) => mouse.set(vertical ? e.clientY : e.clientX)}
      onMouseLeave={() => mouse.set(Infinity)}
      className={`fixed z-40 flex gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-ink/75 backdrop-blur-md border border-line/80 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] ${
        vertical
          ? 'left-5 top-1/2 -translate-y-1/2 flex-col items-start'
          : 'bottom-3 left-1/2 -translate-x-1/2 items-end max-w-[calc(100vw-16px)]'
      }`}
    >
      {ITEMS.map((item) => (
        <DockItem key={item.id} {...item} {...common} href={`/#${item.id}`} active={active === item.id} />
      ))}
      <span className={`bg-line self-center ${vertical ? 'h-px w-6 my-0.5' : 'w-px h-6 mx-0.5'}`} aria-hidden="true" />
      <DockItem
        {...common}
        label="Command palette (⌘K)"
        icon={FiCommand}
        onClick={() => window.dispatchEvent(new Event('open-palette'))}
      />
    </nav>
  );
}
