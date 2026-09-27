// One-time: get a Spotify refresh token for the now-playing function.
//
//   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node now-playing/get-refresh-token.mjs
//
// Opens nothing by itself: it prints a Spotify login link, waits for Spotify to
// redirect back to http://127.0.0.1:8888/callback, then prints the refresh token.
// The token is printed once to your terminal and never written to disk.
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
  process.exit(1);
}

const REDIRECT = 'http://127.0.0.1:8888/callback';
const state = randomBytes(16).toString('hex');
const login = new URL('https://accounts.spotify.com/authorize');
login.search = new URLSearchParams({
  client_id: id,
  response_type: 'code',
  redirect_uri: REDIRECT,
  scope: 'user-read-currently-playing user-read-recently-played',
  state,
});

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== '/callback') return res.writeHead(404).end();
  if (url.searchParams.get('state') !== state) return res.writeHead(400).end('State mismatch, try again.');
  const code = url.searchParams.get('code');
  if (!code) return res.writeHead(400).end(`Spotify said: ${url.searchParams.get('error')}`);

  const token = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT }),
  }).then((r) => r.json());

  res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done. Go back to your terminal.');
  server.close();
  if (!token.refresh_token) return console.error('No refresh token returned:', token.error_description ?? token);
  console.log('\nSPOTIFY_REFRESH_TOKEN (add it to Vercel, then clear your terminal):\n');
  console.log(token.refresh_token);
});

server.listen(8888, '127.0.0.1', () => {
  console.log('Log in to Spotify here, then come back:\n');
  console.log(login.toString());
});
