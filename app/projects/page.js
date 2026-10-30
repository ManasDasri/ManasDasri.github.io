import { SiGithub } from 'react-icons/si';
import { FiGlobe } from 'react-icons/fi';
import { projects } from '@/lib/data';
import PageShell from '@/components/PageShell';

export const metadata = {
  title: 'Projects · Manas Dasari',
  description: 'Everything I’ve built: developer tools, real-time apps, quant research and an applied AI studio.',
  alternates: { canonical: '/projects/' },
};

const iconLink = 'w-8 h-8 flex items-center justify-center rounded-md text-mute hover:text-signal hover:bg-paper transition-colors';

// Every project, newest first with the featured one leading: its name (to its page), what it
// is, what it's made with, and links to the site and the source.
export default function Projects() {
  const list = [...projects].sort((a, b) => (b.featured ?? 0) - (a.featured ?? 0) || (b.started ?? '').localeCompare(a.started ?? ''));
  return (
    <PageShell scene="bamboo" title="Projects">
      <h2 className="font-serif text-3xl text-text/90 mb-8">Selected</h2>
      <ul className="list-none m-0 p-0">
        {list.map((p) => {
          const site = p.link && !p.link.includes('github.com') ? p.link : null;
          const repo = p.repoUrl ?? (p.repo ? `https://github.com/${p.repo}` : p.link?.includes('github.com') ? p.link : null);
          return (
            <li key={p.name} className="border-t border-line py-7">
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                <a
                  href={p.slug ? `/projects/${p.slug}/` : repo}
                  {...(p.slug ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  className="font-serif text-4xl leading-none text-text no-underline border-b border-dashed border-mute/50 hover:text-signal hover:border-signal transition-colors"
                  style={p.slug ? { viewTransitionName: `project-${p.slug}` } : undefined}
                >
                  {p.name}
                </a>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-mute">{p.tags.slice(0, 2).map((t) => t.label).join(' · ')}</span>
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
                </div>
              </div>
              <p className="text-mute leading-relaxed mt-3 max-w-[54ch] line-clamp-2">{p.description}</p>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
