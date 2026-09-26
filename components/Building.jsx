'use client';

import { projects } from '@/lib/data';
import { Reveal, SpotlightCard } from './Effects';
import SectionHeading from './SectionHeading';

export default function Building() {
  return (
    <section id="building" className="max-w-3xl mx-auto px-6 py-16">
      <SectionHeading>currently building</SectionHeading>
      <div className="flex flex-col gap-5">
        {projects.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08}>
          <SpotlightCard
            className={`rounded-xl border border-line bg-paper p-7 ${
              p.active ? '' : 'opacity-50 border-dashed'
            }`}
          >
            <div className="flex justify-between items-baseline mb-3">
              <span className={`font-display text-xs flex items-center gap-2 ${p.active ? 'text-signal' : 'text-mute'}`}>
                {p.active ? (
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inset-0 rounded-full bg-signal animate-ping opacity-60" />
                    <span className="relative w-2 h-2 rounded-full bg-signal" />
                  </span>
                ) : (
                  '○'
                )}
                {p.status}
              </span>
              <span className="font-display font-bold text-lg">{p.name}</span>
            </div>
            <p className="text-mute mb-4">{p.description}</p>
            {p.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {p.tags.map((t) => {
                  const Icon = t.icon;
                  return (
                    <span
                      key={t.label}
                      className="font-display text-xs text-accent border border-line rounded px-2.5 py-1 flex items-center gap-1.5"
                    >
                      {Icon && <Icon className="w-3 h-3" aria-hidden="true" />}
                      {t.label}
                    </span>
                  );
                })}
              </div>
            )}
            {p.active && (
              <a href={p.link} target="_blank" rel="noopener noreferrer" className="group font-display text-sm">
                View project{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </a>
            )}
          </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
