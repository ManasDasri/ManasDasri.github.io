'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const cache = {};

export default function LeetCodeHoverCard({ username, children }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(cache[username] || null);
  const [status, setStatus] = useState(cache[username] ? 'ready' : 'idle');
  const timeoutRef = useRef(null);

  async function load() {
    if (cache[username]) {
      setData(cache[username]);
      setStatus('ready');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch(`/api/leetcode/${username}`);
      if (!res.ok) throw new Error('not found');
      const json = await res.json();
      cache[username] = json;
      setData(json);
      setStatus('ready');
    } catch (e) {
      setStatus('error');
    }
  }

  function handleEnter() {
    clearTimeout(timeoutRef.current);
    setOpen(true);
    load();
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {children}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 z-50 rounded-xl border border-line bg-paper shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] p-5 text-left"
          >
            {status === 'loading' && (
              <p className="font-display text-xs text-mute">loading profile…</p>
            )}
            {status === 'error' && (
              <p className="font-display text-xs text-mute">couldn&apos;t load profile</p>
            )}
            {status === 'ready' && data && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {data.avatar ? (
                    <img
                      src={data.avatar}
                      alt={data.username}
                      className="w-12 h-12 rounded-full border border-line"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-line bg-raised flex items-center justify-center font-display text-xs text-mute">
                      {data.username?.[0] || '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-body font-semibold text-sm truncate">
                      {data.realName || data.username}
                    </div>
                    <div className="font-display text-xs text-mute truncate">@{data.username}</div>
                  </div>
                </div>

                <div className="flex gap-5 pt-2 border-t border-line font-display text-xs">
                  <span>
                    <strong className="text-text">{data.totalSolved}</strong>{' '}
                    <span className="text-mute">solved</span>
                  </span>
                  {data.ranking && (
                    <span>
                      <strong className="text-text">#{data.ranking.toLocaleString()}</strong>{' '}
                      <span className="text-mute">rank</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
