'use client';

import { useState } from 'react';
import SegmentedSwitch from './SegmentedSwitch';
import { oss, STARS_AS_OF } from '@/lib/data';

const FILTERS = { all: () => true, merged: (c) => c.state === 'merged', 'in review': (c) => c.state === 'open' };
const stars = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

// GitHub's five-square diffstat: added and removed lines as a share of five squares
function Diffstat({ add, del }) {
  if (add == null) return <span className="diff" aria-hidden="true" />;
  const total = add + del;
  const a = Math.round((add / total) * 5);
  return (
    <span className="diff" title={`${add} lines added, ${del} removed`}>
      <span className="diff-n">
        <ins>+{add}</ins> <del>−{del}</del>
      </span>
      <span className="diff-sq" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} className={i < a ? 'a' : 'd'} />
        ))}
      </span>
    </span>
  );
}

export default function Upstream({ mergedPRs }) {
  const [filter, setFilter] = useState('all');
  const rows = oss.filter(FILTERS[filter]);
  const repos = new Set(oss.map((c) => c.repo)).size;
  return (
    <section id="open-source" className="wrap section">
      <header className="section-head">
        <h2>Open source</h2>
        <p>
          {mergedPRs ? (
            <>
              <a href="https://github.com/search?q=author%3AManasDasri+is%3Apr+is%3Amerged+-user%3AManasDasri+-user%3ASprout-DevLabs+-user%3AFieldLensAI&type=pullrequests" target="_blank" rel="noopener noreferrer">
                {mergedPRs} pull requests
              </a>{' '}
              merged into other people’s projects so far.{' '}
            </>
          ) : null}
          The ones below, across {repos} repositories, are the ones I’d point you to first.
        </p>
      </header>
      <SegmentedSwitch options={Object.keys(FILTERS)} label="Filter pull requests" value={filter} onChange={setFilter} className="oss-filter" />
      <ul className="oss">
        {rows.map((c) => {
          const href = c.href ?? `https://github.com/${c.repo}/pull/${c.pr}`;
          const [owner, name] = c.repo.split('/');
          return (
            <li key={href}>
              <a href={href} target="_blank" rel="noopener noreferrer" className="oss-row">
                <span className="oss-repo">
                  <span className="oss-owner">{owner}/</span>
                  <span className="oss-name">{name}</span>
                  <span className="oss-stars" title={`GitHub stars, ${STARS_AS_OF}`}>★ {stars(c.stars)}</span>
                </span>
                <span className="oss-what">{c.what}</span>
                <span className="oss-side">
                  <span className={`oss-state s-${c.state}`}>{c.pr ? `#${c.pr} ` : `${c.count} PRs `}{c.state === 'open' ? 'in review' : 'merged'}</span>
                  <Diffstat add={c.add} del={c.del} />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
