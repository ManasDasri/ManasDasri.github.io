'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SocialHoverCard({ children, name, handle, note, avatar }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  function handleEnter() {
    clearTimeout(timeoutRef.current);
    setOpen(true);
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
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 z-50 rounded-xl border border-line bg-paper shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] p-5 text-left"
          >
            <div className="flex items-center gap-3">
              {avatar ? (
                <img src={avatar} alt={name} className="w-10 h-10 rounded-full border border-line" />
              ) : (
                <div className="w-10 h-10 rounded-full border border-line bg-raised flex items-center justify-center font-display text-xs text-mute">
                  {name?.[0] || '?'}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-body font-semibold text-sm truncate">{name}</div>
                <div className="font-display text-xs text-mute truncate">{handle}</div>
              </div>
            </div>
            {note && <p className="text-xs text-mute mt-3 leading-snug">{note}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
