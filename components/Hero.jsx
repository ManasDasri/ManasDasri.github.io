'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import HeroBanner from './HeroBanner';
import Socials from './Socials';

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

export default function Hero() {
  const uptime = useUptime();

  return (
    <section id="hero" className="relative">
      <HeroBanner />

      <div className="px-6 sm:px-9 -mt-10 sm:-mt-12 relative z-10">
        <img
          src="/berserk-pfp.jpg"
          alt="Manas"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-ink object-cover shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)]"
        />
      </div>

      <div className="px-6 sm:px-9 pt-5 pb-16 max-w-2xl">
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
          <span className="text-signal">Manas</span> <span className="text-accent">Dasari</span>
        </h1>
        <p className="font-display text-xs text-mute mb-6">
          5th sem · Amrita School of Engineering · uptime {uptime}
        </p>

        <p className="text-text mb-4">Engineer / Fintech Enthusiast / Artist / Writer.</p>

        <ul className="list-none p-0 m-0 mb-7 flex flex-col gap-2.5">
          <li className="flex gap-2.5 text-mute">
            <span className="text-signal flex-shrink-0">▸</span>
            <span>
              Building <strong className="text-text">Flow</strong> (virtual study rooms) and{' '}
              <strong className="text-text">Atmos</strong> (air quality sensor optimization),
              sketching a bigger concept around a live physics + ML life simulator.
            </span>
          </li>
          <li className="flex gap-2.5 text-mute">
            <span className="text-signal flex-shrink-0">▸</span>
            <span>
              Competing in hackathons run by Kaggle, Hack2skill, WeMakeDevs, and Guidewire —
              sharpening DSA fundamentals daily on LeetCode in Python.
            </span>
          </li>
          <li className="flex gap-2.5 text-mute">
            <span className="text-signal flex-shrink-0">▸</span>
            <span>
              Off the keyboard: coordinating animal welfare events with{' '}
              <strong className="text-text">Barket</strong>, and deep in a KDE Plasma ricing
              phase on Linux.
            </span>
          </li>
        </ul>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-3.5 flex-wrap mb-9"
        >
          
            href="mailto:dasarimanas049@gmail.com"
            className="font-display text-sm font-bold px-6 py-3 rounded-lg bg-signal text-[#0B1210] hover:brightness-110 no-underline"
          >
            Send an email
          </a>
          
            href="/Manas_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-sm px-6 py-3 rounded-lg border border-line text-text hover:border-mute no-underline"
          >
            Resume
          </a>
        </motion.div>

        <Socials />
      </div>
    </section>
  );
}
