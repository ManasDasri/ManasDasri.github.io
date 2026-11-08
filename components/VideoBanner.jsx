'use client';

import { useEffect, useRef } from 'react';
import { motionPaused } from './KoiPond';

// The banner's loop: a black hole's glowing disk, 7 seconds, crossfaded end into start so it
// never visibly restarts. Blended with 'screen', so its black drops away and the light sits on
// whatever the theme's background is. Muted. It plays only while it's on
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
      className="absolute inset-0 w-full h-full object-cover mix-blend-screen [mask-image:linear-gradient(#000_45%,transparent)]"
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
