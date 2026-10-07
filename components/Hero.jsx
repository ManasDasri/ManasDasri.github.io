'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Socials from './Socials';
import Typewriter from './Typewriter';

const ROLES = ['Engineer', 'Fintech Enthusiast', 'Artist', 'Writer'];

const CODING_START_DATE = new Date('2026-01-01');

function useUptime() {
  const [uptime, setUptime] = useState('calculating…');
  useEffect(() => {
    const totalDays = Math.floor((Date.now() - CODING_START_DATE.getTime()) / 86400000);
    const years = Math.floor(totalDays / 365);
    const days = totalDays % 365;
    setUptime(years > 0 ? `${years}y ${days}d` : `${days}d`);
  }, []);
  return uptime;
}

const rise = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] },
});

export default function Hero() {
  const uptime = useUptime();

  return (
    <section id="hero" className="relative px-6 sm:px-9 pt-6 pb-16 sm:pb-20">
      <motion.div {...rise(0.15)} className="flex items-center gap-4 mb-8">
        <img src="/pfp_main.jpeg" alt="" className="w-14 h-14 rounded-xl object-cover ring-1 ring-line" />
        <div>
          <p className="font-head text-xl sm:text-2xl font-semibold tracking-tight">
            <span className="text-mute">$ whoami</span> <Typewriter words={ROLES} />
          </p>
          <p className="font-mono text-xs text-mute mt-1">
            5th sem CSE, Amrita School of Engineering · coding for {uptime}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <motion.p {...rise(0.3)} className="text-text/90 leading-relaxed max-w-[58ch]">
          I build developer tools and real-time web apps, and I like problems where software
          meets finance. Right now that means shipping{' '}
          <a href="#building" className="text-signal font-bold">Sprout</a>, a codebase mapper for
          developers and AI agents, alongside <strong>Flow</strong> and <strong>Atmos</strong>.
        </motion.p>

        <motion.div {...rise(0.45)} className="flex md:flex-col gap-3 flex-wrap">
          <a
            href="mailto:dasarimanas049@gmail.com"
            className="font-head text-base font-bold text-center px-6 py-3 rounded-lg bg-signal text-ink hover:brightness-110 transition no-underline"
          >
            Send an email
          </a>
          <a
            href="/Manas_resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-head text-base font-semibold text-center px-6 py-3 rounded-lg border border-line text-text hover:border-signal hover:text-signal transition-colors no-underline"
          >
            Resume (PDF)
          </a>
        </motion.div>
      </div>

      <motion.div {...rise(0.6)} className="mt-10">
        <Socials />
      </motion.div>
    </section>
  );
}
