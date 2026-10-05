'use client';

import { useEffect, useState } from 'react';

// Projects I've landed code in that I don't own, live from GitHub search.
// Only merged and still-open PRs count; closed-unmerged ones are left out.
const USER = 'ManasDasri';
const OWN = ['ManasDasri', 'Sprout-DevLabs', 'FieldLensAI']; // my own accounts and orgs

export default function OpenSource() {
  const [repos, setRepos] = useState(null);

  useEffect(() => {
    const q = `author:${USER} is:pr ${OWN.map((o) => `-user:${o}`).join(' ')}`;
    fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(({ items }) => {
        const byRepo = {};
        for (const pr of items) {
          const name = pr.repository_url.split('/repos/')[1];
          const r = (byRepo[name] ??= { name, merged: 0, open: 0 });
          if (pr.pull_request?.merged_at) r.merged++;
          else if (pr.state === 'open') r.open++;
        }
        setRepos(Object.values(byRepo).filter((r) => r.merged || r.open).sort((a, b) => b.merged - a.merged || b.open - a.open));
      })
      .catch(() => setRepos([]));
  }, []);

  if (!repos?.length) return null;

  return (
    <div className="mb-8">
      <h3 className="font-mono text-xs text-mute mb-3">contributed to</h3>
      <ul className="list-none p-0 m-0 grid gap-3 sm:grid-cols-2">
        {repos.map((r) => {
          const [owner, name] = r.name.split('/');
          return (
            <li key={r.name}>
              <a
                href={`https://github.com/${r.name}/pulls?q=is%3Apr+author%3A${USER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-line bg-paper p-3 no-underline hover:border-signal/50 transition-colors"
              >
                <img src={`https://github.com/${owner}.png?size=64`} alt="" width="32" height="32" className="w-8 h-8 rounded-md bg-raised" loading="lazy" />
                <span className="min-w-0">
                  <span className="block text-sm text-text truncate group-hover:text-signal transition-colors">
                    <span className="text-mute">{owner}/</span>
                    {name}
                  </span>
                  <span className="block font-mono text-xs text-mute">
                    {[r.merged && `${r.merged} merged`, r.open && `${r.open} in review`].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
