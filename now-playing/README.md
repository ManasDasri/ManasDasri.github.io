# now-playing

A single Vercel function that tells the portfolio footer what's playing on Spotify.
The portfolio itself is static (GitHub Pages), so the Spotify credentials live here instead.

## Setup (about 10 minutes, once)

1. **Spotify app.** At https://developer.spotify.com/dashboard, create an app.
   Add `http://127.0.0.1:8888/callback` as a Redirect URI and tick "Web API".
   Copy the Client ID and Client Secret.

2. **Refresh token.** From the repo root:

   ```bash
   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node now-playing/get-refresh-token.mjs
   ```

   Open the link it prints, log in, approve. The terminal prints your refresh token once.
   The only scopes requested are `user-read-currently-playing` and `user-read-recently-played`.

3. **Deploy.** In Vercel, import this repo as a new project and set **Root Directory** to `now-playing`.
   Add environment variables:

   | Name | Value |
   |---|---|
   | `SPOTIFY_CLIENT_ID` | from step 1 |
   | `SPOTIFY_CLIENT_SECRET` | from step 1 |
   | `SPOTIFY_REFRESH_TOKEN` | from step 2 |
   | `ALLOWED_ORIGINS` | optional; defaults to `https://algorithmicbit.tech,https://www.algorithmicbit.tech` |

4. **Point the site at it.** Set `nowPlayingEndpoint` in `lib/data.js` to
   `https://<your-project>.vercel.app/api/now-playing`. The widget stays hidden while it's empty.

## Behaviour

- Returns the current track, or the most recently played one when nothing is playing (podcasts fall back too).
- Responses are cached at Vercel's edge for 30 seconds, so visitors don't turn into Spotify API calls.
- Only the allowed origins get a CORS header, so other sites can't embed your listening.
- `503` when unconfigured; the footer hides itself on anything but `200`.

Test: `node now-playing/api.test.mjs` (fakes Spotify, no credentials needed).
