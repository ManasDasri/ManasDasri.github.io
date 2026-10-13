'use client';

import { useEffect, useState } from 'react';

// Pings a project's site from the visitor's browser and shows how it answered.
// A no-cors request can't read the response, but it resolves when the server
// answers and rejects when it can't be reached — enough for up / slow / down.
// Side effect worth having: it wakes sleeping free-tier hosts (Flow on Render)
// before the visitor clicks through.
const SLOW_MS = 4000;
const TIMEOUT_MS = 20000;

const LOOK = {
  checking: { dot: 'bg-mute', text: 'checking…' },
  up: { dot: 'bg-signal', text: (ms) => `up · ${ms} ms` },
  slow: { dot: 'bg-mature', text: (ms) => `slow · ${(ms / 1000).toFixed(1)} s, probably waking up` },
  down: { dot: 'bg-accent', text: 'unreachable right now' },
};

export default function LiveStatus({ url, label }) {
  const [state, setState] = useState({ kind: 'checking' });

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const t0 = performance.now();
    fetch(url, { mode: 'no-cors', cache: 'no-store', signal: ctrl.signal })
      .then(() => {
        const ms = Math.round(performance.now() - t0);
        setState({ kind: ms > SLOW_MS ? 'slow' : 'up', ms });
      })
      .catch(() => !ctrl.signal.aborted || performance.now() - t0 >= TIMEOUT_MS ? setState({ kind: 'down' }) : null)
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [url]);

  const look = LOOK[state.kind];
  const text = typeof look.text === 'function' ? look.text(state.ms) : look.text;
  return (
    <span className="font-mono text-xs flex items-center gap-2 text-mute" title={`Pinged ${url} from your browser`}>
      <span className="relative flex w-2 h-2" aria-hidden="true">
        {state.kind === 'up' && <span className="absolute inset-0 rounded-full bg-signal animate-ping opacity-60" />}
        <span className={`relative w-2 h-2 rounded-full ${look.dot}`} />
      </span>
      <span>
        {label && <span className="text-text/80">{label} · </span>}
        <span aria-live="polite">{text}</span>
      </span>
    </span>
  );
}
