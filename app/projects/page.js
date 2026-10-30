import { SiGithub } from 'react-icons/si';
import { FiGlobe } from 'react-icons/fi';
import { projects } from '@/lib/data';
import Dock from '@/components/Dock';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import MarginArt from '@/components/MarginArt';

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
    <>
      <MarginArt scene="bamboo" />
      <Dock />
      <main id="main" className="max-w-2xl mx-auto border-x border-dashed border-line/70 relative">
        <header className="px-6 sm:px-9 pt-10 pb-10">
          <a href="/" className="rise font-mono text-xs text-mute hover:text-signal">← home</a>
          <h1 className="rise font-serif text-[clamp(3.5rem,10vw,5rem)] leading-none mt-8" style={{ '--i': 1 }}>Projects</h1>
          <h2 className="rise font-serif text-3xl text-text/90 mt-8" style={{ '--i': 2 }}>Selected</h2>
        </header>
        <ul className="list-none m-0 px-6 sm:px-9 pb-16">
          {list.map((p, i) => {
            const site = p.link && !p.link.includes('github.com') ? p.link : null;
            const repo = p.repoUrl ?? (p.repo ? `https://github.com/${p.repo}` : p.link?.includes('github.com') ? p.link : null);
            return (
              <li key={p.name} className="rise border-t border-line py-7" style={{ '--i': 3 + i }}>
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
        <Footer />
        <CommandPalette />
      </main>
    </>
  );
}
