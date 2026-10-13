'use client';

import { useEffect, useState } from 'react';
import { projects } from '@/lib/data';
import { SpotlightCard } from './Effects';
import Section from './Section';
import Sigil from './Sigil';
import SproutTerminal from './SproutTerminal';
import LiveStatus from './LiveStatus';

// Projects are catalogued like specimens: numbered by when each one began,
// with a spec table (type, origin, material, status) and plate crop marks.

const hostOf = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const origin = (yyyymm) => yyyymm?.replace('-', '.');
const specimenNo = Object.fromEntries(
  [...projects].sort((a, b) => (a.started ?? '').localeCompare(b.started ?? '')).map((p, i) => [p.name, String(i + 1).padStart(3, '0')])
);

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

const linkClass = 'font-mono text-xs text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal';
const ctaClass =
  'inline-flex items-center gap-1.5 font-mono text-xs text-signal border border-signal/40 rounded-md px-3 py-1.5 no-underline hover:bg-signal hover:text-ink transition-colors';

// A card's preview: the project's own features, printed like a terminal session.
// Projects without a feature list print their tagline and kind instead.
function Preview({ p, hover }) {
  const cmd = (p.slug ?? p.name.toLowerCase().replace(/\s+/g, '-'));
  const lines = p.features?.slice(0, 3) ?? [p.tagline, p.kind && `kind: ${p.kind.toLowerCase()}`].filter(Boolean);
  return (
    <div className="mb-5 rounded-md border border-line bg-ink overflow-hidden" aria-hidden="true">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-line">
        <span className="w-2 h-2 rounded-full bg-accent/70" />
        <span className="w-2 h-2 rounded-full bg-mature/70" />
        <span className="w-2 h-2 rounded-full bg-signal/70" />
        <span className="ml-2 font-mono text-[10px] text-mute">~/projects/{cmd}</span>
      </div>
      <div className="px-3 py-2.5 font-mono text-[11px] leading-relaxed">
        <p className="m-0 text-signal">
          $ {cmd} {p.features ? '--features' : '--about'}
        </p>
        {lines.map((l) => (
          <p key={l} className="m-0 text-text/75 truncate">
            <span className="text-mature">›</span> {l}
          </p>
        ))}
        <p className="m-0 text-signal">
          $ <span className={hover ? 'caret' : 'inline-block w-[0.55em]'} />
        </p>
      </div>
    </div>
  );
}

// corner marks, like the trim marks on a printed plate
function Crop() {
  const mark = 'absolute w-3 h-3 border-signal/50 pointer-events-none';
  return (
    <span aria-hidden="true">
      <span className={`${mark} -top-px -left-px border-t border-l`} />
      <span className={`${mark} -top-px -right-px border-t border-r`} />
      <span className={`${mark} -bottom-px -left-px border-b border-l`} />
      <span className={`${mark} -bottom-px -right-px border-b border-r`} />
    </span>
  );
}

function PlateHeader({ p, extra }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] text-mute pb-3 mb-5 border-b border-dashed border-line">
      <span className="text-signal">SPECIMEN {specimenNo[p.name]}</span>
      <span aria-hidden="true">·</span>
      <span>{p.name.toUpperCase()}</span>
      <span className="ml-auto flex items-center gap-3">
        {extra}
        {p.started && <span title="origin">{origin(p.started)}</span>}
      </span>
    </div>
  );
}

function Spec({ p }) {
  const rows = [
    ['type', p.kind],
    ['origin', p.started && origin(p.started)],
    ['material', p.tags.map((t) => t.label).join(' · ')],
  ].filter(([, v]) => v);
  return (
    <dl className="grid grid-cols-[76px_1fr] gap-x-4 gap-y-1.5 content-start self-start text-sm m-0">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="font-mono text-[11px] text-mute pt-0.5">{k}</dt>
          <dd className="m-0 text-text/90">{v}</dd>
        </div>
      ))}
      <div className="contents">
        <dt className="font-mono text-[11px] text-mute pt-0.5">status</dt>
        <dd className="m-0">
          {p.statusUrl ? <LiveStatus url={p.statusUrl} label={p.status} /> : <span className="font-mono text-xs text-mute">{p.status}</span>}
        </dd>
      </div>
    </dl>
  );
}

function Featured({ p }) {
  const [hover, setHover] = useState(false);
  const version = useLatestRelease(p.repo, p.version);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <SpotlightCard tilt={false} className="relative rounded-md border border-signal/30 bg-paper p-6 sm:p-8">
        <Crop />
        <PlateHeader
          p={p}
          extra={
            <a href={`https://github.com/${p.repo}/releases`} target="_blank" rel="noopener noreferrer" className="text-ink bg-signal rounded px-1.5 py-0.5 no-underline hover:brightness-110">
              {version}
            </a>
          }
        />
        <div className="grid gap-6 md:grid-cols-[1fr_minmax(0,260px)] mb-6">
          <div className="flex gap-5">
            <Sigil pattern={p.pattern} playing={hover} name={`sigil-${p.slug}`} />
            <div className="min-w-0">
              <h3 className="shimmer font-head text-4xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[0.9] w-fit" style={{ viewTransitionName: `project-${p.slug}` }}>
                {p.name}
              </h3>
              <p className="font-head text-lg text-text mt-1">{p.tagline}</p>
              <p className="text-mute text-sm leading-relaxed mt-3 max-w-[60ch]">{p.description}</p>
            </div>
          </div>
          <Spec p={p} />
        </div>
        <SproutTerminal />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-6 pt-4 border-t border-dashed border-line">
          <a href={`/projects/${p.slug}/`} className={ctaClass}>view project <span aria-hidden="true">→</span></a>
          <a href={p.link} target="_blank" rel="noopener noreferrer" className={linkClass}>website and docs</a>
          <a href={`https://github.com/${p.repo}`} target="_blank" rel="noopener noreferrer" className={linkClass}>source on GitHub</a>
        </div>
      </SpotlightCard>
    </div>
  );
}

function Specimen({ p, wide }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className={wide ? 'md:col-span-2' : ''}>
      <SpotlightCard className="relative h-full flex flex-col rounded-md border border-line bg-paper p-6">
        <Crop />
        <PlateHeader p={p} />
        <div className="flex items-center gap-4 mb-3">
          <Sigil pattern={p.pattern} playing={hover} dim={!p.active} name={p.slug && `sigil-${p.slug}`} />
          <div className="min-w-0">
            <h3 className="shimmer font-head text-3xl font-extrabold tracking-[-0.04em] leading-[0.9] w-fit" style={p.slug ? { viewTransitionName: `project-${p.slug}` } : undefined}>
              {p.name}
            </h3>
            {p.badge && (
              <span className="inline-block mt-1.5 font-mono text-[10px] text-accent border border-accent/40 rounded px-1.5 py-0.5">
                {p.badge}
              </span>
            )}
            {p.tagline && <p className="text-sm text-text/80 mt-0.5">{p.tagline}</p>}
          </div>
        </div>
        <p className="text-mute text-sm leading-relaxed mb-5">{p.description}</p>
        <Preview p={p} hover={hover} />
        <div className="mt-auto">
          <Spec p={p} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-5 pt-4 border-t border-dashed border-line">
            {p.slug ? (
              <a href={`/projects/${p.slug}/`} className={ctaClass}>
                view project <span aria-hidden="true">→</span>
              </a>
            ) : (
              <a href={p.link} target="_blank" rel="noopener noreferrer" className={ctaClass}>
                view on {hostOf(p.link).split('/')[0]} <span aria-hidden="true">↗</span>
              </a>
            )}
            {p.slug && p.active && (
              <a href={p.link} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {hostOf(p.link)}
              </a>
            )}
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}

export default function Building() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  return (
    <Section id="building" index={1} title="Building" note="catalogued by when each one began; hover a specimen to run its pattern">
      <div className="flex flex-col gap-5">
        {featured.map((p) => (
          <Featured key={p.name} p={p} />
        ))}
        <div className="grid gap-5 md:grid-cols-2">
          {rest.map((p, i) => (
            <Specimen key={p.name} p={p} wide={rest.length % 2 === 1 && i === rest.length - 1} />
          ))}
        </div>
      </div>
    </Section>
  );
}
