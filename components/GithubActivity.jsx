'use client';

import { cloneElement } from 'react';
import dynamic from 'next/dynamic';

const GitHubCalendar = dynamic(
  () => import('react-github-calendar').then((mod) => mod.GitHubCalendar),
  { ssr: false, loading: () => <p className="font-display text-xs text-mute">loading activity…</p> }
);

const Tooltip = dynamic(() => import('react-tooltip').then((mod) => mod.Tooltip), { ssr: false });

const GITHUB_USERNAME = 'ManasDasri';

const CALENDAR_THEME = {
  dark: ['#1B1F26', '#123328', '#1B5C43', '#2C9268', '#4FD1A5'],
};

// How far back to show. Change the number to widen/narrow the window —
// this is what keeps the graph "fixed" instead of scrolling through a full year.
const MONTHS_TO_SHOW = 4;

function filterToRecentMonths(contributions) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - MONTHS_TO_SHOW);
  return contributions.filter((day) => new Date(day.date) >= cutoff);
}

export default function GithubActivity() {
  return (
    <section id="activity" className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="font-display text-sm text-signal mb-6">// github activity</h2>

      <div className="rounded-xl border border-line bg-paper p-6 sm:p-7 flex justify-center">
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
            backgroundColor: '#1B1F26',
            color: '#E7E7E2',
            border: '1px solid #2A2F3A',
            borderRadius: '8px',
            fontSize: '12px',
            padding: '6px 10px',
          }}
        />
      </div>
    </section>
  );
}
