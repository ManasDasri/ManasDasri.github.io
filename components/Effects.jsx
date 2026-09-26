'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';

// Soft glow that follows the cursor across the whole page (mouse only, via CSS).
export function CursorGlow() {
  useEffect(() => {
    const onMove = (e) => {
      document.documentElement.style.setProperty('--cx', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cy', `${e.clientY}px`);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return <div className="cursor-glow" aria-hidden="true" />;
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-50 bg-gradient-to-r from-signal to-accent"
    />
  );
}

export function Reveal({ children, delay = 0 }) {
  const reduce = useReducedMotion();
  if (reduce) return children;
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

// Card with a cursor-tracking spotlight, glowing border and a slight 3D tilt.
export function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  function onMove(e) {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    if (!reduce)
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
