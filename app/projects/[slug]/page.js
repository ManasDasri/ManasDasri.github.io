import { notFound } from 'next/navigation';
import { projects } from '@/lib/data';
import Dock from '@/components/Dock';
import Section from '@/components/Section';
import Sigil from '@/components/Sigil';
import Diagram from '@/components/Diagram';
import Footer from '@/components/Footer';
import LiveStatus from '@/components/LiveStatus';
import CommandPalette from '@/components/CommandPalette';

const detailed = projects.filter((p) => p.slug);
const hostOf = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const linkClass = 'font-mono text-sm text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal';

export const dynamicParams = false;

export function generateStaticParams() {
  return detailed.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const p = detailed.find((p) => p.slug === params.slug);
  return { title: `${p.name} · Manas Dasari`, description: p.tagline ?? p.description };
}

export default function ProjectPage({ params }) {
  const i = detailed.findIndex((p) => p.slug === params.slug);
  if (i < 0) notFound();
  const p = detailed[i];
  const next = detailed[(i + 1) % detailed.length];
  const repo = p.repoUrl ?? (p.repo && `https://github.com/${p.repo}`);

  return (
    <>
      <Dock />
      <main id="main" className="max-w-5xl mx-auto border-x border-line/60 relative">
        <header className="px-6 sm:px-9 pt-10 pb-14">
          <a href="/#building" className="rise font-mono text-xs text-mute hover:text-signal">
            ← all projects
          </a>
          <div className="rise morph flex items-center gap-5 mt-8 mb-4" style={{ '--i': 1 }}>
            <Sigil pattern={p.pattern} playing name={`sigil-${p.slug}`} />
            {p.statusUrl ? (
              <LiveStatus url={p.statusUrl} label={p.status} />
            ) : (
              <span className="font-mono text-xs text-mute">{p.status}</span>
            )}
          </div>
          <h1
            className="rise morph font-head font-extrabold tracking-[-0.04em] leading-[0.9] text-[clamp(3rem,9vw,5.5rem)] w-fit"
            style={{ viewTransitionName: `project-${p.slug}`, '--i': 2 }}
          >
            {p.name}
          </h1>
          {p.tagline && <p className="rise font-head text-xl sm:text-2xl text-text mt-4" style={{ '--i': 3 }}>{p.tagline}</p>}
          <p className="rise text-mute leading-relaxed mt-5 max-w-[68ch]" style={{ '--i': 4 }}>{p.description}</p>
          <div className="rise flex flex-wrap gap-x-6 gap-y-2 mt-6" style={{ '--i': 5 }}>
            {p.link && !p.link.includes('github.com') && (
              <a href={p.link} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {hostOf(p.link)}
              </a>
            )}
            {repo && (
              <a href={repo} target="_blank" rel="noopener noreferrer" className={linkClass}>
                source on GitHub
              </a>
            )}
          </div>
        </header>

        {p.screenshots && (
          <div className="px-6 sm:px-9 pb-14 grid gap-4 sm:grid-cols-2">
            {p.screenshots.map((s, k) => (
              <figure key={s.src} className={`m-0 ${k === 0 ? 'sm:col-span-2' : ''}`}>
                <img src={s.src} alt={s.alt} loading="lazy" className="w-full rounded-lg border border-line" />
                <figcaption className="font-mono text-xs text-mute mt-2">{s.alt}</figcaption>
              </figure>
            ))}
          </div>
        )}

        <Section id="features" title="What it does">
          <ul className="list-none p-0 m-0 flex flex-col gap-3 max-w-[68ch]">
            {p.features.map((f) => (
              <li key={f} className="flex gap-3 text-sm leading-relaxed text-text/90">
                <span className="mt-[7px] w-[7px] h-[7px] rounded-[1px] bg-signal flex-shrink-0" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="architecture" title="How it's built" note="each layer feeds the one below">
          <Diagram layers={p.layers} />
          <div className="flex flex-wrap gap-2 mt-8">
            {p.tags.map((t) => {
              const Icon = t.icon;
              return (
                <span key={t.label} className="font-mono text-xs text-accent bg-accent/10 rounded px-2 py-1 flex items-center gap-1.5">
                  {Icon && <Icon className="w-3 h-3" aria-hidden="true" />}
                  {t.label}
                </span>
              );
            })}
          </div>
        </Section>

        <a
          href={`/projects/${next.slug}/`}
          className="group block px-6 sm:px-9 py-14 border-t border-line/60 no-underline"
        >
          <span className="font-mono text-xs text-mute">next project</span>
          <span className="flex items-center gap-4 mt-2">
            <Sigil pattern={next.pattern} name={`sigil-${next.slug}`} />
            <span
              className="block w-fit font-head text-4xl font-extrabold tracking-[-0.04em] leading-[0.9] text-text group-hover:text-signal transition-colors"
              style={{ viewTransitionName: `project-${next.slug}` }}
            >
              {next.name}
            </span>
          </span>
        </a>

        <Footer />
        <CommandPalette />
      </main>
    </>
  );
}
