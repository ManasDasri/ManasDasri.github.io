// Runs at build time (the site is a static export). LeetCode's GraphQL API
// doesn't allow browser requests, so stats refresh on each deploy; the deploy
// workflow also rebuilds daily. Returns null if LeetCode is unreachable.
export async function getLeetCodeStats(username) {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json', referer: 'https://leetcode.com' },
      body: JSON.stringify({
        query: 'query($u: String!) { matchedUser(username: $u) { submitStatsGlobal { acSubmissionNum { difficulty count } } } }',
        variables: { u: username },
      }),
    });
    const rows = (await res.json()).data.matchedUser.submitStatsGlobal.acSubmissionNum;
    return Object.fromEntries(rows.map((r) => [r.difficulty.toLowerCase(), r.count]));
  } catch {
    return null;
  }
}
