// GET /api/reddit/:username
// Server-side proxy for Reddit's public "about.json" endpoint.
// Reddit requires a real User-Agent and blocks most browser-side CORS
// requests, so this route fetches on the server and returns a trimmed
// JSON shape for RedditHoverCard.jsx to consume.

export async function GET(request, { params }) {
  const { username } = params;

  try {
    const res = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
      headers: {
        'User-Agent': 'portfolio-site:reddit-hover-card:v1.0 (by /u/anonymous)',
      },
      next: { revalidate: 3600 }, // cache for an hour
    });

    if (!res.ok) {
      console.error(`[reddit route] ${username} -> ${res.status} ${res.statusText}`);
      return Response.json({ error: 'not found', status: res.status }, { status: res.status });
    }

    const json = await res.json();
    const d = json?.data;

    if (!d) {
      console.error(`[reddit route] ${username} -> unexpected payload`, json);
      return Response.json({ error: 'unexpected payload' }, { status: 502 });
    }

    return Response.json({
      username: d.name,
      avatar: d.icon_img ? d.icon_img.split('?')[0] : null,
      karma: (d.total_karma ?? d.link_karma + d.comment_karma) || 0,
      createdUtc: d.created_utc,
      bio: d.subreddit?.public_description || '',
      isMod: !!d.is_mod,
    });
  } catch (err) {
    console.error(`[reddit route] ${username} -> threw`, err);
    return Response.json({ error: 'failed to fetch', message: String(err) }, { status: 500 });
  }
}
