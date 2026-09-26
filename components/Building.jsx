'use client';

import { useEffect, useState } from 'react';
import { projects } from '@/lib/data';
import { SpotlightCard } from './Effects';
import Section from './Section';
import Sigil from './Sigil';
import SproutTerminal from './SproutTerminal';

const hostOf = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

function useLatestRelease(repo, fallback) {
  const [tag, setTag] = useState(fallback);
  useEffect(() => {
    if (!repo) return;
    fetch(`https://api.github.com/repos/${repo}/releases/latest`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.tag_name && setTag(d.tag_name))
      .catch(() => {});
  }, [repo]);
  return tag;
}

function Tags({ tags }) {
  return tags.map((t) => {
    const Icon = t.icon;
    return (
      <span key={t.label} className="font-mono text-xs text-accent bg-accent/10 rounded px-2 py-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" aria-hidden="true" />}
        {t.label}
      </span>
    );
  });
}

const linkClass = 'font-mono text-xs text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal';

function Featured({ p }) {
  const [hover, setHover] = useState(false);
  const version = useLatestRelease(p.repo, p.version);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <SpotlightCard tilt={false} className="rounded-xl border border-signal/30 bg-paper p-6 sm:p-8">
        <div className="flex gap-5 mb-5">
          <Sigil pattern={p.pattern} playing={hover} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="font-head text-3xl sm:text-4xl font-extrabold tracking-tight">{p.name}</h3>
              <a href={`https://github.com/${p.repo}/releases`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-ink bg-signal rounded px-1.5 py-0.5 no-underline hover:brightness-110">
                {version}
              </a>
              <span className="font-mono text-xs text-signal ml-auto">{p.status}</span>
            </div>
            <p className="font-head text-lg text-text mt-1">{p.tagline}</p>
          </div>
        </div>
        <p className="text-mute text-sm leading-relaxed mb-5 max-w-[68ch]">{p.description}</p>
        <div className="mb-6">
          <SproutTerminal />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tags tags={p.tags} />
          <span className="ml-auto flex flex-wrap gap-4">
            <a href={p.link} target="_blank" rel="noopener noreferrer" className={linkClass}>website and docs</a>
            <a href={`https://github.com/${p.repo}`} target="_blank" rel="noopener noreferrer" className={linkClass}>source on GitHub</a>
          </span>
        </div>
      </SpotlightCard>
    </div>
  );
}

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
          <Tags tags={p.tags} />
          {p.active && (
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-auto ${linkClass}`}
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
        {projects.map((p) => (p.featured ? <Featured key={p.name} p={p} /> : <Project key={p.name} p={p} />))}
      </div>
    </Section>
  );
}
