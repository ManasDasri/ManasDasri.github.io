'use client';

import { motion } from 'framer-motion';
import { about } from '@/lib/data';

export default function About() {
  return (
    <section id="about" className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="font-display text-sm text-signal mb-6">// about</h2>
      <ul className="list-none p-0 m-0">
        {about.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex gap-3 py-2.5 border-b border-line last:border-none"
          >
            <span className="text-signal flex-shrink-0">▸</span>
            <span className="text-text">{item}</span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
