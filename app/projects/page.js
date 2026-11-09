import RippleShot from '@/components/RippleShot';
import { SiGithub } from 'react-icons/si';
import { FiGlobe } from 'react-icons/fi';
import { byRank, projects } from '@/lib/data';
import PageShell from '@/components/PageShell';

export const metadata = {
  title: 'Projects · Manas Dasari',
  description: 'Everything I’ve built: ML research, developer tools, real-time apps, quant research and an applied AI studio.',
  alternates: { canonical: '/projects/' },
};

const iconLink = 'w-8 h-8 flex items-center justify-center rounded-md text-mute hover:text-signal hover:bg-paper transition-colors';

// Every project as a card, the featured ones first, then newest first: a picture (or, for one
// with nothing to show yet, the GitHub mark on a dotted tile), what it is, what it does, a line of evidence where
// there is one, and links to the site and the source.
export default function Projects() {
  const list = [...projects].sort(byRank);
  return (
    <PageShell scene="bamboo" title="Projects">
      <ul className="list-none m-0 p-0 grid gap-x-6 gap-y-12 sm:grid-cols-2">
        {list.map((p) => {
          const site = p.link && !p.link.includes('github.com') ? p.link : null;
          const repo = p.repoUrl ?? (p.repo ? `https://github.com/${p.repo}` : p.link?.includes('github.com') ? p.link : null);
          const href = p.slug ? `/projects/${p.slug}/` : repo;
          const out = p.slug ? {} : { target: '_blank', rel: 'noopener noreferrer' };
          return (
            <li key={p.name} className="flex flex-col">
              <a href={href} {...out} className="group block no-underline" aria-label={p.name}>
                <RippleShot>
                  {p.screenshots?.length ? (
                    <img src={p.screenshots[0].src} alt="" loading="lazy" />
                  ) : (
                    // nothing to show yet: the GitHub mark on a dotted tile, since the source is what there is
                    <span className="flex w-full h-full items-center justify-center bg-[radial-gradient(rgb(var(--c-text)/0.14)_1.2px,transparent_1.2px)] [background-size:12px_12px]">
                      <SiGithub className="w-14 h-14 text-text/70 transition-colors group-hover:text-signal" aria-hidden="true" />
                    </span>
                  )}
                </RippleShot>
              </a>
              <div className="flex items-start justify-between gap-3 mt-3">
                <span className="font-mono text-[11px] text-mute pt-1">
                  {p.kind}
                  {p.badge ? ` · ${p.badge}` : ''}
                </span>
                <span className="flex items-center -mr-2">
                  {site && (
                    <a href={site} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} website`} className={iconLink}>
                      <FiGlobe className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )}
                  {repo && (
                    <a href={repo} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on GitHub`} className={iconLink}>
                      <SiGithub className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )}
                </span>
              </div>
              <a
                href={href}
                {...out}
                className="w-fit font-serif text-3xl leading-tight text-text no-underline hover:text-signal transition-colors"
                style={p.slug ? { viewTransitionName: `project-${p.slug}` } : undefined}
              >
                {p.name}
              </a>
              <p className="text-sm text-text/75 leading-relaxed mt-2 mb-0 line-clamp-3">{p.description}</p>
              {p.proof && <p className="font-mono text-[11px] leading-relaxed text-signal/90 mt-2 mb-0">{p.proof}</p>}
              <p className="font-mono text-[11px] text-mute mt-3 mb-0">{p.tags.map((t) => t.label).join(' · ')}</p>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
