import { notFound } from 'next/navigation';
import { projects } from '@/lib/data';
import Dock from '@/components/Dock';
import Section, { Band } from '@/components/Section';
import Diagram from '@/components/Diagram';
import Footer from '@/components/Footer';
import LiveStatus from '@/components/LiveStatus';
import CommandPalette from '@/components/CommandPalette';
import Gallery from '@/components/Gallery';
import RepoStats from '@/components/RepoStats';
import SproutTerminal from '@/components/SproutTerminal';
import MarginArt from '@/components/MarginArt';
import { getTickerData } from '@/lib/ticker';

const detailed = projects.filter((p) => p.slug);
const hostOf = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const linkClass = 'font-mono text-sm text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal';

export const dynamicParams = false;

export function generateStaticParams() {
  return detailed.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const p = detailed.find((p) => p.slug === params.slug);
  const image = { url: `/og/project-${p.slug}.png`, width: 1200, height: 630, alt: `${p.name}: ${p.tagline ?? p.kind}` };
  return {
    title: `${p.name} · Manas Dasari`,
    description: p.tagline ?? p.description,
    openGraph: { title: p.name, description: p.tagline ?? p.description, url: `/projects/${p.slug}/`, images: [image] },
    twitter: { card: 'summary_large_image', images: [image] },
  };
}

export default async function ProjectPage({ params }) {
  const i = detailed.findIndex((p) => p.slug === params.slug);
  if (i < 0) notFound();
  const p = detailed[i];
  const next = detailed[(i + 1) % detailed.length];
  const prev = detailed[(i - 1 + detailed.length) % detailed.length];
  const repo = p.repoUrl ?? (p.repo && `https://github.com/${p.repo}`);
  const stats = p.repo === 'Sprout-DevLabs/sprout' ? (await getTickerData()).sproutStats : null;

  return (
    <>
      <MarginArt scene="garden" />
      <Dock />
      <main id="main" className="max-w-2xl mx-auto border-x border-dashed border-line/70 relative">
        <header className="px-6 sm:px-9 pt-10 pb-14">
          <nav aria-label="Projects" className="rise flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-mute">
            <a href="/projects/" className="hover:text-signal">
              ← all projects
            </a>
            <span className="ml-auto flex gap-4">
              <a href={`/projects/${prev.slug}/`} className="hover:text-signal">‹ {prev.name}</a>
              <a href={`/projects/${next.slug}/`} className="hover:text-signal">{next.name} ›</a>
            </span>
          </nav>
          <div className="rise morph flex items-center gap-5 mt-8 mb-4" style={{ '--i': 1 }}>
            {p.statusUrl ? (
              <LiveStatus url={p.statusUrl} label={p.status} />
            ) : (
              <span className="font-mono text-xs text-mute">{p.status}</span>
            )}
          </div>
          <h1
            className="rise morph font-serif leading-[0.95] text-[clamp(3.5rem,10vw,5.5rem)] w-fit"
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
          {stats && (
            <div className="rise mt-6" style={{ '--i': 6 }}>
              <RepoStats repo={p.repo} stats={stats} />
            </div>
          )}
        </header>

        {p.problem && (
          <dl className="px-6 sm:px-9 pb-14 grid gap-x-8 gap-y-6 sm:grid-cols-2 m-0">
            {[
              ['the problem', p.problem],
              ['what I built', p.built],
            ].map(([k, v]) => (
              <div key={k} className="border-l-2 border-signal/40 pl-4">
                <dt className="font-mono text-[11px] text-mute">{k}</dt>
                <dd className="m-0 mt-1.5 text-sm leading-relaxed text-text/90">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {p.screenshots && (
          <div className="px-6 sm:px-9 pb-14">
            <Gallery shots={p.screenshots} />
          </div>
        )}

        {p.slug === 'sprout' && (
          <Section id="try" title="Try it" note="a simulated sprout session; type help">
            <SproutTerminal />
          </Section>
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

        <Band />
        <a
          href={`/projects/${next.slug}/`}
          className="group block px-6 sm:px-9 py-14 no-underline"
        >
          <span className="font-mono text-xs text-mute">next project</span>
          <span
            className="block w-fit mt-2 font-serif text-5xl leading-none text-text group-hover:text-signal transition-colors"
            style={{ viewTransitionName: `project-${next.slug}` }}
          >
            {next.name}
          </span>
        </a>

        <Footer />
        <CommandPalette />
      </main>
    </>
  );
}
