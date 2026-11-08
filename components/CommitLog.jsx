'use client';

import { useEffect, useState } from 'react';
import { motionPaused } from './KoiPond';

// The banner: my real recent commits as a `git log --graph`, scrolling slowly upward. Each
// lane is a repo, open from its newest commit here to its oldest; a row is one commit and
// links to it on GitHub. Hover pauses it; it stands still when motion is reduced or paused.
const LANES = ['text-signal', 'text-accent', 'text-mature', 'text-old', 'text-text', 'text-mute'];
const MAX_LANES = LANES.length;

function graph(commits) {
  // a repo's lane spans from its first row to its last; free lanes are reused
  const first = {}, last = {};
  commits.forEach((c, i) => {
    first[c.repo] ??= i;
    last[c.repo] = i;
  });
  const lanes = []; // repo per lane, or null
  const laneOf = {};
  return commits.map((c, i) => {
    if (first[c.repo] === i) {
      let l = lanes.indexOf(null);
      if (l < 0) l = lanes.length < MAX_LANES ? lanes.length : MAX_LANES - 1;
      lanes[l] = c.repo;
      laneOf[c.repo] = l;
    }
    const me = laneOf[c.repo];
    const cells = lanes.map((r, l) => (l === me ? '*' : r ? '|' : ' '));
    const row = { ...c, lane: me, cells };
    if (last[c.repo] === i && lanes[me] === c.repo) lanes[me] = null;
    while (lanes.length && lanes[lanes.length - 1] === null) lanes.pop();
    return row;
  });
}

const ago = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  for (const [n, u] of [[86400 * 30, 'mo'], [86400 * 7, 'w'], [86400, 'd'], [3600, 'h'], [60, 'm']]) if (s >= n) return `${Math.floor(s / n)}${u}`;
  return 'now';
};

function Rows({ rows, hidden }) {
  return (
    <ol className="list-none m-0 p-0" aria-hidden={hidden || undefined}>
      {rows.map((r) => (
        <li key={r.sha} className="h-5 leading-5 whitespace-nowrap">
          <a href={r.url} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined} className="group flex gap-3 no-underline text-mute hover:text-text">
            <span className="inline-flex w-[7.5ch] flex-shrink-0" aria-hidden="true">
              {r.cells.map((ch, l) => (
                <span key={l} className={`w-[1.25ch] ${ch === '*' ? LANES[l] + ' font-bold' : LANES[l] + ' opacity-50'}`}>{ch}</span>
              ))}
            </span>
            <span className="text-accent/80">{r.sha}</span>
            <span className={`${LANES[r.lane]} max-sm:hidden`}>{r.repo.split('/')[1]}</span>
            <span className="truncate text-text/70 group-hover:text-text">{r.message}</span>
            <span className="ml-auto pl-3 text-mute/70">{ago(r.date)}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function CommitLog({ commits }) {
  const [still, setStill] = useState(true);
  useEffect(() => {
    const update = () => setStill(motionPaused());
    update();
    window.addEventListener('motion-change', update);
    return () => window.removeEventListener('motion-change', update);
  }, []);
  if (!commits?.length) return null;
  const rows = graph(commits);

  return (
    <div className="absolute inset-x-0 top-0 bottom-[132px] sm:bottom-[150px] px-6 sm:px-9 pt-4 font-mono text-[11px] flex flex-col">
      <p className="m-0 mb-2 text-mute flex-shrink-0">
        <span className="text-signal">$</span> git log --graph <span className="text-mute/60 max-sm:hidden"># my latest commits, live from GitHub</span>
      </p>
      <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(transparent,#000_12%,#000_72%,transparent)]">
        {/* two copies, so the loop is seamless; the second is hidden from assistive tech */}
        <div
          className="commit-scroll hover:[animation-play-state:paused]"
          style={{ animationDuration: `${rows.length * 2.4}s`, animationPlayState: still ? 'paused' : undefined }}
        >
          <Rows rows={rows} />
          <Rows rows={rows} hidden />
        </div>
      </div>
    </div>
  );
}
