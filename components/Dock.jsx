'use client';

import { useEffect, useRef, useState } from 'react';
import { FiActivity, FiClock, FiCommand, FiCpu, FiDroplet, FiFeather, FiGitPullRequest, FiHome, FiLayers, FiZap } from 'react-icons/fi';
import { THEMES, THEME_ORDER, readTheme } from '@/lib/themes';
import { setTheme, themeName } from './Daylight';

const ITEMS = [
  { id: 'top', label: 'Home', icon: FiHome, mobile: true },
  { id: 'building', label: 'Projects', icon: FiLayers, mobile: true },
  { id: 'proof-of-work', label: 'Contributions', icon: FiGitPullRequest },
  { id: 'writing', label: 'Writing', icon: FiFeather, mobile: true },
  { id: 'now', label: 'About', icon: FiZap, mobile: true },
  { id: 'log', label: 'Log', icon: FiClock },
  { id: 'skills', label: 'Stack', icon: FiCpu },
  { id: 'activity', label: 'Activity', icon: FiActivity },
];

function DockItem({ id, label, icon: Icon, href, onClick, active, mobile, ...props }) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag href={href} onClick={onClick} aria-label={label} aria-current={active ? 'location' : undefined}
      className={`dock-item ${mobile ? 'dock-primary' : 'dock-secondary'}`} {...props}>
      <Icon aria-hidden="true" />
      <span className="dock-label">{label}</span>
    </Tag>
  );
}

function ThemeItem() {
  const [theme, setThemeState] = useState('auto');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const sync = () => setThemeState(readTheme());
    sync();
    window.addEventListener('theme-change', sync);
    return () => window.removeEventListener('theme-change', sync);
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        ref.current?.querySelector('button')?.focus();
      } else if (e.type === 'pointerdown' && !ref.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener('keydown', close);
    window.addEventListener('pointerdown', close);
    return () => {
      window.removeEventListener('keydown', close);
      window.removeEventListener('pointerdown', close);
    };
  }, [open]);
  return (
    <div ref={ref} className="dock-secondary relative">
      <DockItem label={`Theme: ${themeName(theme)}`} icon={FiDroplet} aria-expanded={open} aria-controls="theme-options" onClick={() => setOpen(!open)} />
      {open && (
        <div id="theme-options" role="group" aria-label="Colour theme" className="theme-options">
          {THEME_ORDER.map((key) => {
            const t = THEMES[key === 'auto' ? 'bioluminescent' : key];
            return (
              <button key={key} aria-pressed={theme === key} onClick={() => {
                setTheme(key);
                setOpen(false);
                ref.current?.querySelector('button')?.focus();
              }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised aria-pressed:text-signal">
                <span className="flex overflow-hidden rounded" style={{ filter: 'hue-rotate(calc(var(--hue, 0deg) * -1))' }} aria-hidden="true">
                  {[t.paper, t.signal, t.mature, t.accent].map((c, i) => <span key={i} className="h-4 w-2.5" style={{ background: c }} />)}
                </span>
                {themeName(key)}{theme === key && <span className="ml-auto" aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Dock() {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (location.pathname !== '/') {
      setActive(location.pathname.startsWith('/projects/') ? 'building' : location.pathname.startsWith('/writing/') ? 'writing' : null);
      return;
    }
    const sections = ITEMS.map(({ id }) => document.getElementById(id)).filter(Boolean);
    let frame;
    const update = () => {
      const threshold = window.innerHeight * 0.35;
      const current = sections.filter((el) => el.getBoundingClientRect().top <= threshold)
        .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0];
      setActive(current?.id ?? 'top');
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return (
    <nav aria-label="Sections" className="dock">
      {ITEMS.map((item) => <DockItem key={item.id} {...item} href={`/#${item.id}`} active={active === item.id} />)}
      <span className="dock-divider dock-secondary" aria-hidden="true" />
      <ThemeItem />
      <DockItem label="More" title="Command palette (⌘K)" icon={FiCommand} mobile onClick={() => window.dispatchEvent(new Event('open-palette'))} />
    </nav>
  );
}
