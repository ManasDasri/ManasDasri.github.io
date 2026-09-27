// node now-playing/api.test.mjs — exercises the handler against a fake Spotify.
import assert from 'node:assert/strict';

const img = (w) => ({ url: `https://i.scdn.co/${w}`, width: w, height: w });
const song = {
  name: 'Song', artists: [{ name: 'A' }, { name: 'B' }], duration_ms: 200000,
  album: { name: 'Album', images: [img(640), img(300), img(64)] }, external_urls: { spotify: 'https://open.spotify.com/track/x' },
};
let playing = true;
globalThis.fetch = async (url) => {
  const json = (status, body) => ({ status, ok: status < 300, json: async () => body });
  if (String(url).includes('/api/token')) return json(200, { access_token: 't', expires_in: 3600 });
  if (String(url).includes('currently-playing'))
    return playing ? json(200, { is_playing: true, progress_ms: 5000, currently_playing_type: 'track', item: song }) : json(204);
  if (String(url).includes('recently-played')) return json(200, { items: [{ played_at: '2026-09-27T01:00:00Z', track: song }] });
};
const call = async (origin) => {
  const r = { headers: {}, code: 0, body: null };
  const res = {
    setHeader: (k, v) => (r.headers[k] = v),
    status: (c) => ((r.code = c), res),
    json: (b) => ((r.body = b), res),
    end: () => res,
  };
  const { default: handler } = await import('./api/now-playing.js');
  await handler({ headers: { origin } }, res);
  return r;
};

let r = await call('https://algorithmicbit.tech');
assert.equal(r.code, 503, 'unconfigured → 503');

Object.assign(process.env, { SPOTIFY_CLIENT_ID: 'i', SPOTIFY_CLIENT_SECRET: 's', SPOTIFY_REFRESH_TOKEN: 'r' });
r = await call('https://algorithmicbit.tech');
assert.equal(r.code, 200);
assert.equal(r.headers['Access-Control-Allow-Origin'], 'https://algorithmicbit.tech');
assert.deepEqual([r.body.playing, r.body.artist, r.body.art, r.body.progressMs], [true, 'A, B', 'https://i.scdn.co/64', 5000]);

playing = false;
r = await call('https://evil.example');
assert.equal(r.headers['Access-Control-Allow-Origin'], undefined, 'other origins get no CORS header');
assert.deepEqual([r.body.playing, r.body.playedAt, r.body.title], [false, '2026-09-27T01:00:00Z', 'Song']);
console.log('ok');
