import { execSync } from 'node:child_process';
import { Band } from './Section';
import ViewCount from './ViewCount';
import { projects, socials } from '@/lib/data';
import { SOCIAL_ICONS } from '@/lib/socialIcons';

const forme = projects.find((p) => p.slug === 'forme');

const REPO = 'https://github.com/ManasDasri/ManasDasri.github.io';

// Rendered at build time: CI provides GITHUB_SHA; local builds ask git.
function buildCommit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
}

export default function Footer() {
  const sha = buildCommit();
  const built = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

  return (
    <>
    <Band />
    <footer className="px-6 sm:px-9 pt-14 pb-28 dock:pb-12">
      <p className="font-serif text-2xl sm:text-3xl text-text/90 leading-snug max-w-md text-balance m-0">
        “You have power over your mind — not outside events.”
      </p>
      <p className="font-mono text-xs text-mute mt-2">Marcus Aurelius</p>

      <nav aria-label="Pages" className="flex flex-wrap gap-x-5 gap-y-2 mt-10 font-mono text-xs">
        {['projects', 'writing', 'reading'].map((p) => (
          <a key={p} href={`/${p}/`} className="text-text/80 hover:text-signal">{p}</a>
        ))}
        <a href="/recruiter/" className="text-text/80 hover:text-signal">recruiter view</a>
      </nav>

      {/* a small ad for Forme, my component library; the tab switcher and the counting numbers
          here (components/SegmentedSwitch.jsx, NumberTicker.jsx) are ported from it */}
      <a
        href={forme.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-8 flex items-center gap-4 max-w-xl rounded-xl border border-line bg-paper p-2.5 pr-4 no-underline transition-colors hover:border-signal/50"
      >
        <img
          src={forme.screenshots[0].src}
          alt=""
          loading="lazy"
          className="w-24 sm:w-32 shrink-0 aspect-[16/10] rounded-md border border-line object-cover object-top"
        />
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-mute">also by me</span>
          <span className="block font-serif text-lg leading-tight text-text transition-colors group-hover:text-signal">
            Forme <span className="text-mute font-normal">· {forme.tagline}</span>
          </span>
          <span className="block mt-1 font-mono text-[11px] leading-relaxed text-mute">
            52 free React components, installed as source with one command. This site&rsquo;s tab switcher and counting numbers are from it.
          </span>
        </span>
        <span className="hidden sm:block shrink-0 font-mono text-xs text-signal transition-transform group-hover:translate-x-1" aria-hidden="true">
          browse →
        </span>
      </a>

      <div className="mt-6 pt-6 border-t border-line/60 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <ul className="list-none p-0 m-0 flex gap-1" aria-label="Elsewhere">
          {socials.map((s) => {
            const Icon = SOCIAL_ICONS[s.label];
            return (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-mute hover:text-signal hover:bg-paper transition-colors"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
        <p className="font-mono text-xs text-mute m-0 flex flex-wrap gap-x-4 gap-y-1">
          <span>
            built {built}
            {sha && (
              <>
                {' '}from{' '}
                <a href={`${REPO}/commit/${sha}`} target="_blank" rel="noopener noreferrer" className="text-text/80 hover:text-signal underline decoration-line underline-offset-4">
                  {sha.slice(0, 7)}
                </a>
              </>
            )}
          </span>
          <ViewCount />
          <a href="/feed.xml" className="text-text/80 hover:text-signal">rss feed</a>
          <a href="#top" className="text-text/80 hover:text-signal">back to top ↑</a>
        </p>
      </div>
    </footer>
    </>
  );
}
