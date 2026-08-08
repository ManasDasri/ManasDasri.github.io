'use client';

import { cloneElement } from 'react';
import dynamic from 'next/dynamic';

// The calendar fetches contribution data client-side and its internal
// markup differs slightly between the server render and first client
// paint, which throws a hydration mismatch. Forcing it to render only
// on the client (ssr: false) avoids that entirely.
const GitHubCalendar = dynamic(
  () => import('react-github-calendar').then((mod) => mod.GitHubCalendar),
  { ssr: false, loading: () => <p className="font-display text-xs text-mute">loading activity…</p> }
);

const Tooltip = dynamic(() => import('react-tooltip').then((mod) => mod.Tooltip), { ssr: false });

// Uses the GITHUB_USERNAME from your socials data — change here if it ever diverges.
const GITHUB_USERNAME = 'ManasDasri';

// Signal-green shading to match the rest of the site, from empty → most active.
const CALENDAR_THEME = {
  dark: ['#1B1F26', '#123328', '#1B5C43', '#2C9268', '#4FD1A5'],
};

export default function GithubActivity() {
  return (
    <section id="activity" className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="font-display text-sm text-signal mb-6">// github activity</h2>

      <div className="rounded-xl border border-line bg-paper p-6 sm:p-7 overflow-x-auto">
        <GitHubCalendar
          username={GITHUB_USERNAME}
          colorScheme="dark"
          theme={CALENDAR_THEME}
          fontSize={12}
          blockSize={11}
          blockMargin={4}
          style={{ width: '100%' }}
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
