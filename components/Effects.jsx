'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-50 bg-gradient-to-r from-signal via-coral to-accent"
    />
  );
}

// Card with a cursor-tracking spotlight, glowing border and a slight 3D tilt.
export function SpotlightCard({ children, className = '', tilt = true }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  function onMove(e) {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    if (tilt && !reduce)
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y / r.height) * 5}deg) rotateY(${
        (x / r.width - 0.5) * 5
      }deg) translateY(-3px)`;
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => (ref.current.style.transform = '')}
      className={`spotlight ${className}`}
    >
      {children}
    </div>
  );
}
