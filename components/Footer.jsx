import { execSync } from 'node:child_process';
import Scramble from './Scramble';
import LedTicker from './LedTicker';
import { getTickerData } from '@/lib/ticker';
import NowPlaying from './NowPlaying';
import { socials } from '@/lib/data';
import { SOCIAL_ICONS } from '@/lib/socialIcons';

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

export default async function Footer() {
  const ticker = await getTickerData();
  const sha = buildCommit();
  const built = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

  return (
    <footer className="px-6 sm:px-9 pt-24 pb-28 xl:pb-12 border-t border-line/60">
      <div className="text-center">
        <p className="font-head text-2xl sm:text-3xl font-semibold tracking-tight max-w-xl mx-auto mb-4 text-balance">
          <Scramble text="“You have power over your mind - not outside events.”" trigger="view" duration={1400} hover={false} />
        </p>
        <p className="font-mono text-xs text-mute">Marcus Aurelius</p>
        <div className="mt-12 empty:hidden">
          <NowPlaying />
        </div>
      </div>

      <div className="mt-16">
        <LedTicker data={ticker} />
      </div>

      <div className="mt-10 pt-6 border-t border-line/60 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
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
          <a href="#top" className="text-text/80 hover:text-signal">back to top ↑</a>
        </p>
      </div>
    </footer>
  );
}
