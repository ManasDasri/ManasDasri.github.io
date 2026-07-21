'use client';

import dynamic from 'next/dynamic';

// The calendar fetches contribution data client-side and its internal
// markup differs slightly between the server render and first client
// paint, which throws a hydration mismatch. Forcing it to render only
// on the client (ssr: false) avoids that entirely.
const GitHubCalendar = dynamic(
  () => import('react-github-calendar').then((mod) => mod.GitHubCalendar),
  { ssr: false, loading: () => <p className="font-display text-xs text-mute">loading activity…</p> }
);

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
        {/*
          No forced width:100% here — the calendar renders as an SVG sized
          from blockSize/blockMargin, and stretching it to a container width
          that doesn't match its aspect ratio is what was distorting the
          grid (uneven squares, months getting clipped). Letting it render
          at its natural size and scroll horizontally inside the card (on
          narrow screens) keeps every square square and every month visible.
        */}
        <GitHubCalendar
          username={GITHUB_USERNAME}
          colorScheme="dark"
          theme={CALENDAR_THEME}
          fontSize={14}
          blockSize={12}
          blockMargin={4}
          showWeekdayLabels
          labels={{
            legend: { less: 'Less active', more: 'More active' },
          }}
        />
      </div>
    </section>
  );
}
