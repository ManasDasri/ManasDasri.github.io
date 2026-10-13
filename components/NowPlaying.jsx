'use client';

import { useEffect, useState } from 'react';
import { lastfm } from '@/lib/data';

// One line under the name: what's playing now, or the last track, from Last.fm.
// Last.fm's API allows browser requests, so there's no server in between.
const POLL_MS = 60_000;
// Last.fm's grey star, sent when it has no cover for the album
const PLACEHOLDER = '2a96cbd8b46e442fc41c2b86b821562f';

const ago = (uts) => {
  const mins = Math.round((Date.now() / 1000 - uts) / 60);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (mins < 60) return rtf.format(-mins, 'minute');
  if (mins < 60 * 24) return rtf.format(-Math.round(mins / 60), 'hour');
  return rtf.format(-Math.round(mins / 1440), 'day');
};

export default function NowPlaying() {
  const [track, setTrack] = useState(null);

  useEffect(() => {
    if (!lastfm.user || !lastfm.apiKey) return;
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(lastfm.user)}&api_key=${lastfm.apiKey}&format=json&limit=1`;
    let alive = true;
    const load = () =>
      document.hidden ||
      fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const t = d?.recenttracks?.track?.[0];
          if (!alive) return;
          setTrack(
            t && {
              title: t.name,
              artist: t.artist?.['#text'],
              url: t.url,
              playing: t['@attr']?.nowplaying === 'true',
              playedAt: t.date?.uts,
              art: [...(t.image ?? [])].find((i) => i.size === 'medium')?.['#text'] || null,
            }
          );
        })
        .catch(() => {});
    load();
    const t = setInterval(load, POLL_MS);
    const onShow = () => !document.hidden && load();
    document.addEventListener('visibilitychange', onShow);
    return () => {
      alive = false;
      clearInterval(t);
      document.removeEventListener('visibilitychange', onShow);
    };
  }, []);

  if (!track) return null;
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="pointer-events-auto group inline-flex items-center gap-2.5 mt-3 max-w-full font-mono text-xs text-mute no-underline"
    >
      {track.art && !track.art.includes(PLACEHOLDER) && (
        <img src={track.art} alt="" width={22} height={22} className="w-[22px] h-[22px] rounded-[3px] ring-1 ring-line object-cover shrink-0" />
      )}
      {track.playing ? (
        <span className="eq" aria-label="playing now">
          <span />
          <span />
          <span />
        </span>
      ) : (
        <span aria-hidden="true">♪</span>
      )}
      <span className="truncate">
        <span className="text-text group-hover:text-signal transition-colors">{track.title}</span>
        {track.artist && <span> · {track.artist}</span>}
        {!track.playing && track.playedAt && <span> · {ago(+track.playedAt)}</span>}
      </span>
    </a>
  );
}
