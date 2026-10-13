'use client';

import { useEffect, useState } from 'react';
import { listenbrainzUser as user } from '@/lib/data';

// One line under the name: what's playing now, or the last track, from ListenBrainz.
// Its API is public and allows browser requests, so there's no server and no key.
const POLL_MS = 60_000;
const API = 'https://api.listenbrainz.org/1/user';

const ago = (uts) => {
  const mins = Math.round((Date.now() / 1000 - uts) / 60);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (mins < 60) return rtf.format(-mins, 'minute');
  if (mins < 60 * 24) return rtf.format(-Math.round(mins / 60), 'hour');
  return rtf.format(-Math.round(mins / 1440), 'day');
};

// cover from the Cover Art Archive: the exact image when ListenBrainz matched the
// release, else the release's front cover (which can 404; the img then hides itself)
function cover(tm) {
  const m = tm.mbid_mapping;
  if (m?.caa_id && m.caa_release_mbid) return `https://coverartarchive.org/release/${m.caa_release_mbid}/${m.caa_id}-250.jpg`;
  const mbid = m?.release_mbid ?? tm.additional_info?.release_mbid;
  return mbid ? `https://coverartarchive.org/release/${mbid}/front-250` : null;
}

const toTrack = (l, playing) => {
  const tm = l.track_metadata;
  const info = tm.additional_info ?? {};
  return {
    title: tm.track_name,
    artist: tm.artist_name,
    url: info.origin_url ?? (info.spotify_id || `https://listenbrainz.org/user/${encodeURIComponent(user)}/`),
    playing,
    playedAt: l.listened_at,
    art: cover(tm),
  };
};

export default function NowPlaying() {
  const [track, setTrack] = useState(null);

  useEffect(() => {
    if (!user) return;
    const base = `${API}/${encodeURIComponent(user)}`;
    const get = (path) => fetch(`${base}/${path}`).then((r) => (r.ok ? r.json() : null));
    let alive = true;
    const load = async () => {
      if (document.hidden) return;
      try {
        const now = (await get('playing-now'))?.payload?.listens?.[0];
        const last = now ? null : (await get('listens?count=1'))?.payload?.listens?.[0];
        if (alive) setTrack(now ? toTrack(now, true) : last ? toTrack(last, false) : null);
      } catch {}
    };
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
      {track.art && (
        <img
          key={track.art}
          src={track.art}
          alt=""
          width={22}
          height={22}
          onError={(e) => (e.currentTarget.style.display = 'none')}
          className="w-[22px] h-[22px] rounded-[3px] ring-1 ring-line object-cover shrink-0"
        />
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
        {!track.playing && track.playedAt && <span> · {ago(track.playedAt)}</span>}
      </span>
    </a>
  );
}
