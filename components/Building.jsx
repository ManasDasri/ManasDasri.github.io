'use client';

import { useEffect, useState } from 'react';
import { projects } from '@/lib/data';
import { SpotlightCard } from './Effects';
import Section from './Section';
import Sigil from './Sigil';
import SproutTerminal from './SproutTerminal';

function Project({ project: p }) {
  const [hover, setHover] = useState(false);
  const [version, setVersion] = useState(p.version);
  useEffect(() => {
    if (!p.version) return;
    const controller = new AbortController();
    fetch(`https://api.github.com/repos/${p.repo}/releases/latest`, { signal: controller.signal })
      .then((r) => r.ok ? r.json() : null)
      .then((release) => release?.tag_name && setVersion(release.tag_name))
      .catch(() => {});
    return () => controller.abort();
  }, [p.repo, p.version]);
  const source = p.repoUrl ?? `https://github.com/${p.repo}`;
  const demo = p.link && !p.link.includes('github.com/');
  const linkClass = 'inline-flex min-h-11 items-center font-mono text-xs text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal';
  return (
    <article onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className={p.featured ? 'md:col-span-2' : ''}>
      <SpotlightCard className={`h-full rounded-lg border bg-paper p-5 sm:p-6 ${p.featured ? 'border-signal/40' : 'border-line'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-mute mb-5">
          <span>{p.kind}</span>
          {version ? <a href={`https://github.com/${p.repo}/releases`} className="text-signal underline underline-offset-4" target="_blank" rel="noopener noreferrer">{version}</a> : <span>{p.status}</span>}
        </div>
        <div className="flex items-center gap-4">
          <Sigil pattern={p.pattern} playing={hover} dim={!p.active} />
          <h3 className={`font-head font-extrabold tracking-[-0.04em] leading-tight ${p.featured ? 'text-4xl sm:text-5xl' : 'text-3xl'}`}>
            <a href={`/projects/${p.slug}/`} className="hover:text-signal transition-colors">{p.name}</a>
          </h3>
        </div>
        <p className="font-head text-xl leading-snug mt-4">{p.tagline}</p>
        <p className="font-head text-base text-mute leading-relaxed mt-3 max-w-[65ch]">{p.summary}</p>
        <div className="flex flex-wrap gap-x-5 mt-3">
          <a href={`/projects/${p.slug}/`} className={linkClass}>Explore project</a>
          {demo && <a href={p.link} className={linkClass} target="_blank" rel="noopener noreferrer">{p.featured ? 'Docs & install' : 'Live app'}</a>}
          <a href={source} className={linkClass} target="_blank" rel="noopener noreferrer">Source</a>
        </div>
        <p className="font-head text-sm text-text/90 leading-relaxed border-t border-line pt-4 mt-3">
          {p.evidence.text}{' '}
          <a href={p.evidence.href} className="text-signal underline underline-offset-4" target="_blank" rel="noopener noreferrer">{p.evidence.label}</a>
        </p>
        <p className="font-mono text-[11px] text-mute mt-4 leading-relaxed">{p.tags.map((t) => t.label).join(' · ')}</p>
        {p.featured && (
          <details className="mt-5 border-t border-line pt-4">
            <summary className="font-mono text-xs text-signal py-2">Try the interactive terminal</summary>
            <div className="mt-3"><SproutTerminal /></div>
          </details>
        )}
      </SpotlightCard>
    </article>
  );
}

export default function Building() {
  return (
    <Section id="building" title="Projects" note="Tools, shared spaces and experiments in modelling.">
      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((p) => <Project key={p.name} project={p} />)}
      </div>
    </Section>
  );
}
