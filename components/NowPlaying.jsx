'use client';

import { useEffect, useRef, useState } from 'react';
import { nowPlayingEndpoint } from '@/lib/data';

const GRID = 12; // cover art resampled to 12×12 cells
const BAR = 24; // progress bar cells
const POLL_MS = 60_000;

const ago = (iso) => {
  const mins = Math.round((Date.now() - new Date(iso)) / 60000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (mins < 60) return rtf.format(-mins, 'minute');
  if (mins < 60 * 24) return rtf.format(-Math.round(mins / 60), 'hour');
  return rtf.format(-Math.round(mins / 1440), 'day');
};

// The album cover, drawn as Life-sized cells.
function CoverCells({ src }) {
  const ref = useRef(null);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Spotify's image CDN allows it, so we can read pixels
    img.onload = () => {
      const small = document.createElement('canvas');
      small.width = small.height = GRID;
      const s = small.getContext('2d');
      s.drawImage(img, 0, 0, GRID, GRID);
      const px = s.getImageData(0, 0, GRID, GRID).data;
      const ctx = ref.current.getContext('2d');
      const c = ref.current.width / GRID;
      ctx.clearRect(0, 0, ref.current.width, ref.current.height);
      for (let i = 0; i < GRID * GRID; i++) {
        ctx.fillStyle = `rgb(${px[i * 4]},${px[i * 4 + 1]},${px[i * 4 + 2]})`;
        ctx.fillRect((i % GRID) * c, ((i / GRID) | 0) * c, c - 1, c - 1);
      }
    };
    img.src = src;
  }, [src]);
  return <canvas ref={ref} width={GRID * 7} height={GRID * 7} className="w-[84px] h-[84px] rounded-md" aria-hidden="true" />;
}

export default function NowPlaying() {
  const [song, setSong] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!nowPlayingEndpoint) return;
    let alive = true;
    const load = () =>
      document.hidden ||
      fetch(nowPlayingEndpoint)
        .then((r) => (r.status === 200 ? r.json() : null))
        .then((s) => {
          if (!alive) return;
          setSong(s);
          setProgress(s?.progressMs ?? 0);
        })
        .catch(() => alive && setSong(null));
    load();
    const t = setInterval(load, POLL_MS);
    // hidden tabs skip polling; catch up as soon as the tab is looked at
    const onVisible = () => !document.hidden && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // advance the progress bar locally between polls
  useEffect(() => {
    if (!song?.playing) return;
    const t = setInterval(() => setProgress((p) => Math.min(p + 1000, song.durationMs)), 1000);
    return () => clearInterval(t);
  }, [song]);

  if (!song) return null;
  const filled = Math.round((progress / song.durationMs) * BAR);

  return (
    <a
      href={song.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-4 text-left no-underline rounded-xl border border-line bg-paper p-3 pr-5 hover:border-signal/50 transition-colors"
    >
      <CoverCells src={song.art} />
      <span className="min-w-0">
        <span className="flex items-center gap-2 font-mono text-xs text-mute">
          {song.playing ? (
            <>
              <span className="relative flex w-2 h-2" aria-hidden="true">
                <span className="absolute inset-0 rounded-full bg-signal animate-ping opacity-60" />
                <span className="relative w-2 h-2 rounded-full bg-signal" />
              </span>
              listening now on Spotify
            </>
          ) : (
            <>last played {song.playedAt ? ago(song.playedAt) : ''} on Spotify</>
          )}
        </span>
        <span className="block font-head text-lg font-semibold text-text group-hover:text-signal transition-colors truncate max-w-[16rem] sm:max-w-xs mt-1">
          {song.title}
        </span>
        <span className="block text-sm text-mute truncate max-w-[16rem] sm:max-w-xs">{song.artist}</span>
        {song.playing && (
          <span className="flex gap-[2px] mt-2" aria-hidden="true">
            {Array.from({ length: BAR }, (_, i) => (
              <span key={i} className={`w-[5px] h-[5px] rounded-[1px] ${i < filled ? 'bg-signal' : 'bg-line'}`} />
            ))}
          </span>
        )}
      </span>
    </a>
  );
}
