'use client';

import { useEffect, useState } from 'react';

// No token needed — GitHub's REST search API works unauthenticated for
// public data. Rate limit is lower (10 req/min per IP vs ~30 authenticated),
// which is plenty for portfolio-site traffic. Never put a GitHub token in
// NEXT_PUBLIC_* — it ships straight into your public JS bundle.
const GITHUB_USERNAME = 'ManasDasri';
const INITIAL_COUNT = 2;

const FILTERS = {
  all: 'is:pr',
  merged: 'is:pr is:merged',
  open: 'is:pr is:open',
  closed: 'is:pr is:closed is:unmerged',
};

export default function ProofOfWork() {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const query = `author:${GITHUB_USERNAME} ${FILTERS[filterType]}`;
    fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=created&order=desc&per_page=12`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setPrs(Array.isArray(data.items) ? data.items : []);
        setShowAll(false);
      })
      .catch(() => {
        if (!cancelled) setPrs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterType]);

  const visible = prs.slice(0, showAll ? prs.length : INITIAL_COUNT);

  return (
    <section id="proof-of-work" className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-display text-sm text-signal">// proof of work</h2>

        <div className="flex gap-1 p-1 rounded-lg border border-line bg-paper">
          {Object.keys(FILTERS).map((key) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`font-display text-xs px-3 py-1.5 rounded-md transition-colors ${
                filterType === key ? 'bg-raised text-signal' : 'text-mute hover:text-text'
              }`}
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="font-display text-xs text-mute">loading pull requests…</p>}

      {!loading && visible.length === 0 && (
        <p className="font-display text-xs text-mute">no pull requests found for this filter</p>
      )}

      {!loading && visible.length > 0 && (
        <div className="flex flex-col gap-2">
          {visible.map((pr) => {
            const isMerged = !!pr.pull_request?.merged_at;
            const isOpen = pr.state === 'open';
            const dotColor = isMerged ? 'bg-[#C792EA]' : isOpen ? 'bg-signal' : 'bg-[#FF5F57]';
            const repo = pr.repository_url?.split('/repos/')[1] ?? '';

            return (
              <a
                key={pr.id}
                href={pr.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 p-3 rounded-md border border-transparent hover:border-line hover:bg-raised transition-colors no-underline"
              >
                <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                <div className="min-w-0">
                  <div className="text-sm text-text truncate group-hover:text-signal">{pr.title}</div>
                  <div className="font-display text-xs text-mute mt-0.5">{repo}</div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {!loading && prs.length > INITIAL_COUNT && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="mt-4 w-full font-display text-xs text-mute border border-line rounded-lg py-2.5 hover:text-signal hover:border-signal transition-colors"
        >
          {showAll ? '↑ collapse' : `↓ show ${prs.length - INITIAL_COUNT} more`}
        </button>
      )}
    </section>
  );
}
