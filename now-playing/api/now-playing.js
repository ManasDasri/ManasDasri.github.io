// GET /api/now-playing → what Spotify is playing, or the last thing played.
// Env: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN,
//      ALLOWED_ORIGINS (optional, comma-separated)
const ALLOWED = (process.env.ALLOWED_ORIGINS ?? 'https://algorithmicbit.tech,https://www.algorithmicbit.tech').split(',');

// access tokens last an hour; keep one per warm function instance
let cached = { token: null, expires: 0 };

async function accessToken() {
  if (cached.token && Date.now() < cached.expires - 60_000) return cached.token;
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const data = await res.json();
  cached = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

// only what the page shows; smallest cover that's still ≥ 64px
const track = (t) => ({
  title: t.name,
  artist: t.artists.map((a) => a.name).join(', '),
  album: t.album.name,
  art: [...t.album.images].reverse().find((i) => i.width >= 64)?.url ?? t.album.images[0]?.url ?? null,
  url: t.external_urls.spotify,
  durationMs: t.duration_ms,
});

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  // shared by every visitor for 30s, so traffic doesn't turn into Spotify calls
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (!process.env.SPOTIFY_REFRESH_TOKEN) return res.status(503).json({ error: 'not configured' });

  try {
    const auth = { headers: { Authorization: `Bearer ${await accessToken()}` } };
    const now = await fetch('https://api.spotify.com/v1/me/player/currently-playing', auth);
    if (now.status === 200) {
      const body = await now.json();
      if (body.item && body.currently_playing_type === 'track')
        return res.status(200).json({ playing: body.is_playing, progressMs: body.progress_ms, ...track(body.item) });
    }
    // nothing playing (204), or a podcast: fall back to the most recent track
    const recent = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', auth);
    const item = recent.ok ? (await recent.json()).items?.[0] : null;
    if (!item) return res.status(204).end();
    return res.status(200).json({ playing: false, playedAt: item.played_at, ...track(item.track) });
  } catch (e) {
    return res.status(502).json({ error: 'spotify unavailable' });
  }
}
