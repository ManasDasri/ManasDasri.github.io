'use client';

import { useEffect, useState } from 'react';

// Live numbers from the public GitHub API (no token; 60 requests/hour per visitor IP).
const USER = 'ManasDasri';

export default function GithubStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const get = (url) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject()));
    Promise.all([
      get(`https://api.github.com/users/${USER}`),
      get(`https://api.github.com/search/issues?q=${encodeURIComponent(`author:${USER} is:pr is:merged`)}&per_page=1`),
    ])
      .then(([user, merged]) =>
        setStats([
          [merged.total_count, 'pull requests merged'],
          [user.public_repos, 'public repositories'],
          [user.followers, 'followers'],
        ])
      )
      .catch(() => {});
  }, []);

  // rate-limited or offline: show nothing rather than zeros
  if (!stats) return null;

  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-4 mb-6">
      {stats.map(([n, label]) => (
        <div key={label}>
          <dt className="sr-only">{label}</dt>
          <dd className="m-0">
            <span className="font-head text-3xl font-extrabold tracking-tight text-text">{n}</span>
            <span className="block font-mono text-xs text-mute mt-0.5">{label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
