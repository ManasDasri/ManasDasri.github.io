'use client';

import { motion } from 'framer-motion';
import { projects } from '@/lib/data';

export default function Building() {
  return (
    <section id="building" className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="font-display text-sm text-signal mb-6">// currently building</h2>
      <div className="flex flex-col gap-5">
        {projects.map((p) => (
          <motion.div
            key={p.name}
            whileHover={p.active ? { y: -4 } : {}}
            transition={{ duration: 0.25 }}
            className={`rounded-xl border border-line bg-paper p-7 ${
              p.active ? '' : 'opacity-50'
            }`}
          >
            <div className="flex justify-between items-baseline mb-3">
              <span className={`font-display text-xs ${p.active ? 'text-signal' : 'text-mute'}`}>
                {p.active ? '●' : '○'} {p.status}
              </span>
              <span className="font-display font-bold text-lg">{p.name}</span>
            </div>
            <p className="text-mute mb-4">{p.description}</p>
            {p.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="font-display text-xs text-accent border border-line rounded px-2.5 py-1"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {p.active && (
              <a href={p.link} target="_blank" rel="noopener noreferrer" className="font-display text-sm">
                View project →
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
