// GET /api/leetcode/:username
// Server-side proxy for LeetCode's public (undocumented) GraphQL endpoint.
// Done server-side so the browser never has to deal with LeetCode's CORS
// policy, and so a future endpoint change only needs updating in one place.

const QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        userAvatar
        realName
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

export async function GET(request, { params }) {
  const { username } = params;

  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
      next: { revalidate: 3600 }, // cache for an hour
    });

    const json = await res.json();
    const user = json?.data?.matchedUser;

    if (!user) {
      return Response.json({ error: 'not found' }, { status: 404 });
    }

    const totalSolved = user.submitStatsGlobal.acSubmissionNum.find(
      (s) => s.difficulty === 'All'
    )?.count ?? 0;

    return Response.json({
      username: user.username,
      avatar: user.profile.userAvatar,
      realName: user.profile.realName,
      ranking: user.profile.ranking,
      totalSolved,
    });
  } catch (err) {
    return Response.json({ error: 'failed to fetch' }, { status: 500 });
  }
}
