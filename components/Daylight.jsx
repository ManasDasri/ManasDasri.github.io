'use client';

import { useEffect, useState } from 'react';
import { daylight } from '@/lib/daylight';

// Rotates the whole palette with the time in Bengaluru (see lib/daylight.js).
export default function Daylight() {
  useEffect(() => {
    const apply = () => {
      const { hue, phase } = daylight();
      document.documentElement.style.setProperty('--hue', `${hue.toFixed(1)}deg`);
      document.documentElement.dataset.phase = phase;
    };
    apply();
    const t = setInterval(apply, 60000);
    return () => clearInterval(t);
  }, []);
  return null;
}

// "palette · dusk (IST 18:20)" for the footer
export function DaylightLabel() {
  const [d, setD] = useState(null);
  useEffect(() => {
    const update = () => setD(daylight());
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);
  if (!d) return null;
  return (
    <span title="The site's colours follow the time of day in Bengaluru">
      palette · {d.phase} (IST {d.time})
    </span>
  );
}
