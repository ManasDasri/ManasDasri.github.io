'use client';

import { cloneElement } from 'react';
import dynamic from 'next/dynamic';
import Section from './Section';
import GithubStats from './GithubStats';

const GitHubCalendar = dynamic(
  () => import('react-github-calendar').then((mod) => mod.GitHubCalendar),
  { ssr: false, loading: () => <p className="font-display text-xs text-mute">loading activity…</p> }
);

const Tooltip = dynamic(() => import('react-tooltip').then((mod) => mod.Tooltip), { ssr: false });

const GITHUB_USERNAME = 'ManasDasri';

const CALENDAR_THEME = {
  dark: [
    '#1A1E3A',
    '#3A2D66',
    '#7C4DB0',
    '#E0776A',
    '#FFC857',
  ],
};


const MONTHS_TO_SHOW = 8;

function filterToRecentMonths(contributions) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - MONTHS_TO_SHOW);
  return contributions.filter((day) => new Date(day.date) >= cutoff);
}

const LEVELS = [
  ['easy', 'bg-signal'],
  ['medium', 'bg-coral'],
  ['hard', 'bg-accent'],
];

function LeetCodeStats({ stats }) {
  if (!stats?.all) return null;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
      <a href="https://leetcode.com/u/ManasDasari/" target="_blank" rel="noopener noreferrer" className="no-underline">
        <span className="font-head text-3xl font-extrabold tracking-tight text-text">{stats.all}</span>
        <span className="block font-mono text-xs text-mute mt-0.5">LeetCode problems solved</span>
      </a>
      <div className="flex-1 min-w-[200px]">
        <div className="flex h-2 rounded-full overflow-hidden bg-line/50" aria-hidden="true">
          {LEVELS.map(([k, bg]) => (
            <span key={k} className={bg} style={{ width: `${(100 * stats[k]) / stats.all}%` }} />
          ))}
        </div>
        <div className="flex gap-4 mt-2 font-mono text-xs text-mute">
          {LEVELS.map(([k, bg]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-[1px] ${bg}`} aria-hidden="true" />
              {stats[k]} {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GithubActivity({ leetcode }) {
  return (
    <Section id="activity" title="Activity" note="live from GitHub; the calendar uses the same colours as the cells up top">
      <GithubStats />

      <div className="rounded-xl border border-line bg-paper p-5 sm:p-6 flex justify-center overflow-x-auto">
        <GitHubCalendar
          username={GITHUB_USERNAME}
          colorScheme="dark"
          theme={CALENDAR_THEME}
          fontSize={12}
          blockSize={11}
          blockMargin={4}
          transformData={filterToRecentMonths}
          labels={{
            legend: { less: 'Less active', more: 'More active' },
          }}
          renderBlock={(block, activity) =>
            cloneElement(block, {
              'data-tooltip-id': 'github-activity-tooltip',
              'data-tooltip-content': `${activity.count} contribution${
                activity.count === 1 ? '' : 's'
              } on ${activity.date}`,
            })
          }
        />
        <Tooltip
          id="github-activity-tooltip"
          style={{
            backgroundColor: '#161A33',
            color: '#ECE8DF',
            border: '1px solid #2A3060',
            borderRadius: '8px',
            fontSize: '12px',
            padding: '6px 10px',
          }}
        />
      </div>
      <LeetCodeStats stats={leetcode} />
    </Section>
  );
}
