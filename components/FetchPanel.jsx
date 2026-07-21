'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Set this to whenever you started coding seriously —
// the panel computes "uptime" from this date automatically.
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

export default function FetchPanel() {
  const uptime = useUptime();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-2xl rounded-xl border border-line bg-paper overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-raised border-b border-line">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 font-display text-xs text-mute">manas@bengaluru</span>
      </div>

      <div className="flex gap-6 sm:gap-8 p-6 sm:p-8 font-display text-sm">
        {/*
          Drop your image at /public/berserk-pfp.jpg (or swap the path below).
          This replaces the old ASCII-art block.
        */}
        <img
          src="/berserk-pfp.jpg"
          alt="Manas"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-line object-cover flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="text-base sm:text-lg font-bold mb-1.5">
            <span className="text-signal">manas</span>
            <span className="text-mute">@</span>
            <span className="text-accent">bengaluru</span>
          </div>
          <div className="text-line mb-2">-----------------</div>

          <FetchLine k="role" v="Engineer / Fintech Enthusiast / Artist / Writer" />
          <FetchLine
            k="focus"
            v={
              <>
                building{' '}
                <a href="#building" className="text-signal hover:underline">
                  Flow
                </a>
                , learning markets, writing when the mood strikes
              </>
            }
          />
          <FetchLine k="status" v="5th sem · Amrita School of Engineering" />
          <FetchLine k="shell" v="zsh on KDE Plasma" />
          <FetchLine k="uptime" v={uptime} />
          <FetchLine k="packages" v="Python, JS, Node, Express, Supabase, Docker" />

          <div className="text-line my-2">-----------------</div>

          <div className="flex gap-1.5" aria-hidden="true">
            {['#FF5F57', '#FEBC2E', '#28C840', '#4FD1A5', '#5CC8FF', '#7C8CFF', '#C792EA', '#E7E7E2'].map(
              (c) => (
                <span key={c} className="w-4 h-4 rounded" style={{ background: c }} />
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FetchLine({ k, v }) {
  return (
    <div className="flex gap-2.5 flex-wrap my-1">
      <span className="text-accent flex-shrink-0 min-w-[70px] sm:min-w-[78px]">{k}</span>
      <span className="text-text">{v}</span>
    </div>
  );
}
