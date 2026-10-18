'use client';

import { useEffect, useState } from 'react';
import { daylight } from '@/lib/daylight';
import { THEMES, THEME_ORDER, applyTheme, readTheme } from '@/lib/themes';

// Applies the colour theme. The head script already set it before paint; this
// keeps 'auto' in step with the clock and reacts to theme changes.
export function setTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch {}
  const swap = () => {
    applyTheme(theme);
    window.dispatchEvent(new Event('theme-change'));
  };
  // the new theme grows out of the centre of the screen as a circle (globals.css,
  // html.theme-wipe); browsers without view transitions, or with reduced motion, just swap
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return swap();
  const html = document.documentElement;
  html.classList.add('theme-wipe');
  document.startViewTransition(swap).finished.finally(() => html.classList.remove('theme-wipe'));
}

export const themeName = (key) => (key === 'auto' ? 'Auto' : THEMES[key].name);
export const nextTheme = (theme) => THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];

export default function Daylight() {
  useEffect(() => {
    const html = document.documentElement;
    const apply = () => applyTheme(readTheme());
    apply();
    // only animate changes made after load, so pages never fade in
    requestAnimationFrame(() => html.classList.add('palette-ready'));
    const t = setInterval(apply, 60000); // 'auto' drifts with the clock
    return () => clearInterval(t);
  }, []);
  return null;
}

// "palette · dusk (auto, IST 18:20)" or "palette · Dracula" for the footer
export function DaylightLabel() {
  const [state, setState] = useState(null);
  useEffect(() => {
    const update = () => setState({ theme: readTheme(), ...daylight() });
    update();
    const t = setInterval(update, 60000);
    window.addEventListener('theme-change', update);
    return () => {
      clearInterval(t);
      window.removeEventListener('theme-change', update);
    };
  }, []);
  if (!state) return null;
  return (
    <button
      onClick={() => setTheme(nextTheme(state.theme))}
      className="hover:text-signal"
      title="Change theme. Auto follows the time of day in Bengaluru."
    >
      palette · {state.theme === 'auto' ? `${state.phase} (auto, IST ${state.time})` : themeName(state.theme)}
    </button>
  );
}
