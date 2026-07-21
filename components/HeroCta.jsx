'use client';

import { motion } from 'framer-motion';

export default function HeroCta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      className="flex gap-3.5 flex-wrap justify-center"
    >
      <a
        href="mailto:dasarimanas049@gmail.com"
        className="font-display text-sm font-bold px-6 py-3 rounded-lg bg-signal text-[#0B1210] hover:brightness-110 no-underline"
      >
        Send an email
      </a>
      <a
        href="..public/Manas_resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="font-display text-sm px-6 py-3 rounded-lg border border-line text-text hover:border-mute no-underline"
      >
        Resume
      </a>
    </motion.div>
  );
}
