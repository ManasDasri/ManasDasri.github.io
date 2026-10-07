'use client';

import { useEffect, useState } from 'react';
import { THEMES, THEME_ORDER, daylight, hueFor, readTheme } from '@/lib/daylight';

// Applies the palette: the visitor's pinned theme, or (default) the time of day
// in Bengaluru. The head script already set it before paint; this keeps it
// current and reacts to theme changes.
export function setTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch {}
  window.dispatchEvent(new Event('theme-change'));
}

export const nextTheme = (theme) => THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];

export default function Daylight() {
  useEffect(() => {
    const html = document.documentElement;
    const apply = () => {
      const theme = readTheme();
      html.style.setProperty('--hue', `${hueFor(theme).toFixed(1)}deg`);
      html.dataset.theme = theme;
      html.dataset.phase = theme === 'auto' ? daylight().phase : theme;
    };
    apply();
    // only animate changes made after load, so pages never fade in
    requestAnimationFrame(() => html.classList.add('palette-ready'));
    const t = setInterval(apply, 60000);
    window.addEventListener('theme-change', apply);
    return () => {
      clearInterval(t);
      window.removeEventListener('theme-change', apply);
    };
  }, []);
  return null;
}

// "palette · dusk (auto, IST 18:20)" or "palette · ember (pinned)" for the footer
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
  const auto = state.theme === 'auto';
  return (
    <button
      onClick={() => setTheme(nextTheme(state.theme))}
      className="hover:text-signal"
      title="Change theme. Auto follows the time of day in Bengaluru."
    >
      palette · {auto ? `${state.phase} (auto, IST ${state.time})` : `${state.theme} (pinned)`}
    </button>
  );
}

export { THEMES };
