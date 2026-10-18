'use client';

import { useEffect, useState } from 'react';
import Socials from './Socials';
import Typewriter from './Typewriter';
import { status } from '@/lib/data';

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

export default function Hero({ highlights = [] }) {
  const uptime = useUptime();

  return (
    <section id="hero" className="relative px-6 sm:px-9 pt-6 pb-16 sm:pb-20">
      <div style={{ '--i': 1 }} className="rise flex items-center gap-4 mb-8">
        <img src="/pfp-112.jpg" alt="" className="w-14 h-14 rounded-xl object-cover ring-1 ring-line" />
        <div>
          <p className="font-head text-xl sm:text-2xl font-semibold tracking-tight">
            <span className="text-mute">$ whoami</span> <Typewriter words={ROLES} />
          </p>
          <p className="font-mono text-xs text-mute mt-1">
            5th sem CSE, Amrita School of Engineering · coding for {uptime}
          </p>
          {status && (
            <a
              href="mailto:dasarimanas049@gmail.com"
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-2.5 py-0.5 font-mono text-[11px] text-signal no-underline hover:border-signal/60"
            >
              <span className="relative flex w-1.5 h-1.5" aria-hidden="true">
                <span className="absolute inset-0 rounded-full bg-signal animate-ping opacity-60 motion-reduce:hidden" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-signal" />
              </span>
              {status}
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <p style={{ '--i': 2 }} className="rise text-text/90 leading-relaxed max-w-[58ch]">
          I build developer tools and real-time web apps, and I like problems where software
          meets finance. Right now that means shipping{' '}
          <a href="#building" className="text-signal font-bold">Sprout</a>, a codebase mapper for
          developers and AI agents, alongside <strong>Flow</strong> and <strong>Atmos</strong>.
        </p>

        <div style={{ '--i': 3 }} className="rise flex md:flex-col gap-3 flex-wrap">
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
        </div>
      </div>

      {highlights.length > 0 && (
        <ul style={{ '--i': 4 }} className="rise list-none p-0 m-0 mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs" aria-label="Highlights">
          {highlights.map((h) => (
            <li key={h.value}>
              <a
                href={h.href}
                {...(h.href.startsWith('#') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                className="group no-underline text-mute"
              >
                <span className="text-signal" aria-hidden="true">▸ </span>
                <span className="text-text font-bold group-hover:text-signal transition-colors">{h.value}</span> {h.label}
              </a>
            </li>
          ))}
        </ul>
      )}

      <div style={{ '--i': 5 }} className="rise mt-10">
        <Socials />
      </div>
    </section>
  );
}
