'use client';

import { useState } from 'react';
import { projects } from '@/lib/data';
import Section from './Section';
import Sigil from './Sigil';
import RepoStats from './RepoStats';

// Selected work as a plain list: each row is the project's sigil, name and
// line, with its status and year. Hovering a row runs its sigil's pattern.

const year = (p) => p.started?.slice(0, 4);

function Row({ p }) {
  const [hover, setHover] = useState(false);
  const href = p.slug ? `/projects/${p.slug}/` : p.link;
  const external = !p.slug;
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3 -mx-3 px-3 rounded-md no-underline hover:bg-paper transition-colors"
      >
        <Sigil pattern={p.pattern} playing={hover} dim={!p.active} name={p.slug && `sigil-${p.slug}`} />
        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span
              className="font-head text-xl font-bold tracking-tight text-text border-b border-dashed border-line group-hover:text-signal group-hover:border-signal/60 transition-colors"
              style={p.slug ? { viewTransitionName: `project-${p.slug}` } : undefined}
            >
              {p.name}
            </span>
            {p.badge && <span className="font-mono text-[11px] text-accent border border-accent/40 rounded px-1.5 py-px">{p.badge}</span>}
            {external && <span className="font-mono text-xs text-mute" aria-label="(opens GitHub)">↗</span>}
          </span>
          <span className="block text-sm text-mute mt-1 truncate">{p.tagline}</span>
        </span>
        <span className="text-right font-mono text-xs leading-relaxed">
          <span className="block text-text/80 tabular-nums">{year(p)}</span>
          <span className="block text-mute max-sm:hidden">{p.status}</span>
        </span>
      </a>
    </li>
  );
}

export default function Building({ stats }) {
  // the featured project leads; the rest are newest first
  const list = [...projects].sort((a, b) => (b.featured ?? 0) - (a.featured ?? 0) || (b.started ?? '').localeCompare(a.started ?? ''));
  const sprout = projects.find((p) => p.repo === 'Sprout-DevLabs/sprout');
  return (
    <Section id="building" index={1} title="Selected work" note="hover one to run its pattern">
      <ul className="list-none p-0 m-0 flex flex-col">
        {list.map((p) => (
          <Row key={p.name} p={p} />
        ))}
      </ul>
      {sprout && stats && (
        <div className="mt-6 pt-4 border-t border-dashed border-line flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="font-mono text-xs text-mute">Sprout on GitHub</span>
          <RepoStats repo={sprout.repo} stats={stats} />
        </div>
      )}
    </Section>
  );
}
