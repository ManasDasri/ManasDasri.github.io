'use client';

import { useEffect, useRef } from 'react';
import { motionPaused } from './KoiPond';

// The banner's loop: a 27-second black-and-white drive past a city skyline at night, muted. It plays only while it's on
// screen, and stands on its first frame when motion is reduced or paused from the dock.
export default function VideoBanner() {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    let visible = true;
    const sync = () => (visible && !document.hidden && !motionPaused() ? v.play().catch(() => {}) : v.pause());
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(v);
    window.addEventListener('motion-change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      io.disconnect();
      window.removeEventListener('motion-change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover"
      src="/banner/loop.mp4"
      poster="/banner/poster.jpg"
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}
