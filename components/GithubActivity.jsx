'use client';

import { cloneElement } from 'react';
import dynamic from 'next/dynamic';
import Section from './Section';
import GithubStats from './GithubStats';

const loading = () => <p className="font-display text-xs text-mute">loading activity…</p>;
const GitHubCalendar = dynamic(() => import('react-github-calendar').then((m) => m.GitHubCalendar), { ssr: false, loading });
const ActivityCalendar = dynamic(() => import('react-activity-calendar').then((m) => m.ActivityCalendar), { ssr: false, loading });
const Tooltip = dynamic(() => import('react-tooltip').then((mod) => mod.Tooltip), { ssr: false });

const GITHUB_USERNAME = 'ManasDasri';
const MONTHS_TO_SHOW = 8;

// Both grids share the look of the cells up top.
const CALENDAR = {
  colorScheme: 'dark',
  theme: { dark: ['#0B2A31', '#12505A', '#1F8C8C', '#2BB3B1', '#7CF5E4'] },
  fontSize: 12,
  blockSize: 11,
  blockMargin: 4,
  labels: { legend: { less: 'Less active', more: 'More active' } },
};

const withTooltip = (noun) => (block, activity) =>
  cloneElement(block, {
    'data-tooltip-id': 'activity-tooltip',
    'data-tooltip-content': `${activity.count} ${noun}${activity.count === 1 ? '' : 's'} on ${activity.date}`,
  });

function filterToRecentMonths(contributions) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - MONTHS_TO_SHOW);
  return contributions.filter((day) => new Date(day.date) >= cutoff);
}

const LEVELS = [
  ['easy', 'bg-signal'],
  ['medium', 'bg-mature'],
  ['hard', 'bg-old'],
];

function Stat({ n, label, href }) {
  const body = (
    <>
      <span className="font-head text-3xl font-extrabold tracking-tight text-text">{n}</span>
      <span className="block font-mono text-xs text-mute mt-0.5">{label}</span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="no-underline">
      {body}
    </a>
  ) : (
    <div>{body}</div>
  );
}

const panel = 'rounded-xl border border-line bg-paper p-5 sm:p-6';
const grid = 'flex justify-center overflow-x-auto mt-6';

function LeetCodePanel({ stats }) {
  if (!stats?.all && stats?.all !== 0) return null;
  return (
    <div className={`${panel} mt-5`}>
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <h3 className="sr-only">LeetCode</h3>
        <Stat n={stats.all} label="LeetCode problems solved" href="https://leetcode.com/u/ManasDasari/" />
        <Stat n={stats.activeDays} label="days with submissions" />
        <div className="flex-1 min-w-[200px]">
          <div className="flex h-2 rounded-full overflow-hidden bg-line/50" aria-hidden="true">
            {LEVELS.map(([k, bg]) => (
              <span key={k} className={bg} style={{ width: `${(100 * stats[k]) / Math.max(stats.all, 1)}%` }} />
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
      <div className={grid}>
        <ActivityCalendar
          {...CALENDAR}
          data={stats.days}
          labels={{ ...CALENDAR.labels, totalCount: '{{count}} submissions in the last 8 months' }}
          renderBlock={withTooltip('submission')}
        />
      </div>
    </div>
  );
}

export default function GithubActivity({ leetcode }) {
  return (
    <Section id="activity" title="Activity" note="GitHub live; LeetCode as of the last daily build">
      <div className={panel}>
        <h3 className="sr-only">GitHub</h3>
        <GithubStats />
        <div className={grid}>
          <GitHubCalendar
            {...CALENDAR}
            username={GITHUB_USERNAME}
            transformData={filterToRecentMonths}
            renderBlock={withTooltip('contribution')}
          />
        </div>
      </div>
      <LeetCodePanel stats={leetcode} />
      <Tooltip
        id="activity-tooltip"
        style={{
          backgroundColor: '#0A222A',
          color: '#E6F4F1',
          border: '1px solid #16404A',
          borderRadius: '8px',
          fontSize: '12px',
          padding: '6px 10px',
        }}
      />
    </Section>
  );
}
