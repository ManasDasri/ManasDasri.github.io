'use client';

import { useState } from 'react';
import { projects } from '@/lib/data';
import { SpotlightCard } from './Effects';
import Section from './Section';
import Sigil from './Sigil';

const hostOf = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

function Project({ p }) {
  const [hover, setHover] = useState(false);
  const body = (
    <div className="flex gap-5">
      <Sigil pattern={p.pattern} playing={hover} dim={!p.active} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
          <h3 className="font-head text-2xl font-bold tracking-tight">{p.name}</h3>
          <span className={`font-mono text-xs flex items-center gap-2 ${p.active ? 'text-signal' : 'text-mute'}`}>
            {p.active && (
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-signal animate-ping opacity-60" />
                <span className="relative w-2 h-2 rounded-full bg-signal" />
              </span>
            )}
            {p.status}
          </span>
        </div>
        <p className="text-mute text-sm leading-relaxed mb-4 max-w-[62ch]">{p.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          {p.tags.map((t) => {
            const Icon = t.icon;
            return (
              <span key={t.label} className="font-mono text-xs text-accent bg-accent/10 rounded px-2 py-1 flex items-center gap-1.5">
                {Icon && <Icon className="w-3 h-3" aria-hidden="true" />}
                {t.label}
              </span>
            );
          })}
          {p.active && (
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto font-mono text-xs text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal"
            >
              {hostOf(p.link)}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {p.active ? (
        <SpotlightCard className="rounded-xl border border-line bg-paper p-6 sm:p-7">{body}</SpotlightCard>
      ) : (
        <div className="rounded-xl border border-dashed border-line p-6 sm:p-7 opacity-60">{body}</div>
      )}
    </div>
  );
}

export default function Building() {
  return (
    <Section id="building" title="Building" note="hover a project to run its pattern">
      <div className="flex flex-col gap-4">
        {projects.map((p) => (
          <Project key={p.name} p={p} />
        ))}
      </div>
    </Section>
  );
}
