// Runs at build time (the site is a static export). LeetCode's GraphQL API
// doesn't allow browser requests, so stats refresh on each deploy; the deploy
// workflow also rebuilds daily. Returns null if LeetCode is unreachable.
const MONTHS = 8; // same window as the GitHub calendar

// submission counts → the calendar's 0–4 intensity levels
const level = (n) => (n === 0 ? 0 : n <= 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4);

export async function getLeetCodeStats(username) {
  try {
    // The unique query param makes each build a fresh Data Cache key. Next.js
    // otherwise replays a cached response and the numbers freeze between
    // solves; `cache: 'no-store'` would fix that but turns this route dynamic,
    // and `output: 'export'` then silently emits no index.html at all.
    const res = await fetch(`https://leetcode.com/graphql?build=${Date.now()}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', referer: 'https://leetcode.com' },
      body: JSON.stringify({
        query: `query($u: String!) { matchedUser(username: $u) {
          submitStatsGlobal { acSubmissionNum { difficulty count } }
          userCalendar { submissionCalendar streak totalActiveDays }
        } }`,
        variables: { u: username },
      }),
    });
    const user = (await res.json()).data.matchedUser;
    const solved = Object.fromEntries(user.submitStatsGlobal.acSubmissionNum.map((r) => [r.difficulty.toLowerCase(), r.count]));

    // submissionCalendar is {"<unix seconds>": count}; the component wants every day, zeros included
    const byDay = {};
    for (const [ts, n] of Object.entries(JSON.parse(user.userCalendar.submissionCalendar)))
      byDay[new Date(ts * 1000).toISOString().slice(0, 10)] = n;
    const start = new Date();
    start.setUTCMonth(start.getUTCMonth() - MONTHS);
    const days = [];
    for (let d = start; d <= new Date(); d = new Date(d.getTime() + 86400000)) {
      const date = d.toISOString().slice(0, 10);
      days.push({ date, count: byDay[date] ?? 0, level: level(byDay[date] ?? 0) });
    }

    return { ...solved, days, streak: user.userCalendar.streak, activeDays: user.userCalendar.totalActiveDays };
  } catch {
    return null;
  }
}
