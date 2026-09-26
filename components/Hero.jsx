'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Socials from './Socials';
import Typewriter from './Typewriter';

const ITEM = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } };
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

export default function Hero() {
  const uptime = useUptime();

  return (
    <section id="hero" className="relative px-6 sm:px-9 pt-8 pb-16 sm:pb-20">
      <h1 className="sr-only">Manas Dasari</h1>

      <div className="flex items-center gap-4 mb-8">
        <img
          src="/pfp_main.jpeg"
          alt="Manas"
          className="w-16 h-16 rounded-xl object-cover ring-1 ring-line"
        />
        <div>
          <p className="font-head text-xl sm:text-2xl font-semibold tracking-tight">
            <span className="text-mute">$ whoami</span> <Typewriter words={ROLES} />
          </p>
          <p className="font-mono text-xs text-mute mt-1">
            5th sem, Amrita School of Engineering · coding for {uptime}
          </p>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-start">
        <motion.ul
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } } }}
            className="list-none p-0 m-0 flex flex-col gap-3 text-sm leading-relaxed max-w-[62ch]"
          >
            <motion.li variants={ITEM} className="flex gap-2.5 text-mute">
              <span className="text-signal flex-shrink-0">▸</span>
              <span>
                Building <strong className="text-text">Flow</strong> (virtual study rooms) and{' '}
                <strong className="text-text">Atmos</strong> (air quality sensor optimization),
                sketching a bigger concept around a live physics + ML life simulator.
              </span>
            </motion.li>
            <motion.li variants={ITEM} className="flex gap-2.5 text-mute">
              <span className="text-signal flex-shrink-0">▸</span>
              <span>
                Competing in hackathons run by Kaggle, Hack2skill, WeMakeDevs, and Guidewire —
                sharpening DSA fundamentals daily on LeetCode in Python.
              </span>
            </motion.li>
            <motion.li variants={ITEM} className="flex gap-2.5 text-mute">
              <span className="text-signal flex-shrink-0">▸</span>
              <span>
                Contributing to Open-source Projects, actively contributing to <strong className = "text-text">Exercism/vbnet</strong>
              </span>
            </motion.li>
            <motion.li variants={ITEM} className="flex gap-2.5 text-mute">
              <span className="text-signal flex-shrink-0">▸</span>
              <span>
                Off the keyboard: coordinating animal welfare events with{' '}
                <strong className="text-text">Barket</strong>, and deep in a KDE Plasma ricing
                phase on Linux.
              </span>
            </motion.li>
          </motion.ul>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex md:flex-col gap-3 flex-wrap"
        >
          <a
            href="mailto:dasarimanas049@gmail.com"
            className="font-head text-base font-bold text-center px-6 py-3 rounded-lg bg-signal text-[#1A1206] hover:brightness-110 transition no-underline"
          >
            Send an email
          </a>
          <a
            href="/Manas_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-head text-base font-semibold text-center px-6 py-3 rounded-lg border border-line text-text hover:border-signal hover:text-signal transition-colors no-underline"
          >
            Resume (PDF)
          </a>
        </motion.div>
      </div>

      <div className="mt-10">
        <Socials />
      </div>
    </section>
  );
}
