'use client';

import { cloneElement } from 'react';
import dynamic from 'next/dynamic';
import Section from './Section';

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

export default function GithubActivity() {
  return (
    <Section id="activity" title="Activity" note="last 8 months of commits, same colours as the cells up top">

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
    </Section>
  );
}
