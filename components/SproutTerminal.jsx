'use client';

import { useEffect, useRef, useState } from 'react';

// Real output: sprout 0.2.0 run on this portfolio's own repo.
const TABS = {
  install: {
    cmd: 'brew install sprout-devlabs/tap/sprout',
    out: [
      '# windows',
      'scoop bucket add sprout https://github.com/Sprout-DevLabs/scoop-bucket',
      'scoop install sprout',
      '# anywhere with go 1.22+',
      'go install github.com/Sprout-DevLabs/sprout@latest',
    ],
  },
  tree: {
    cmd: 'sprout -L 1',
    out: [
      '.',
      '├── README.md',
      '├── app/',
      '├── components/',
      '├── lib/',
      '├── next.config.mjs',
      '├── package.json',
      '├── public/',
      '└── tailwind.config.js',
      '',
      '4 directories, 9 files (6 hidden or ignored, --all to show)',
    ],
  },
  entry: {
    cmd: 'sprout --entry',
    out: [
      'Reading order for ManasDasri.github.io',
      '',
      '  1. README.md                  what the project is',
      '  2. components/Section.jsx     used by 5 files',
      '  3. components/Scramble.jsx    used by 2 files',
      '  4. components/Effects.jsx     used by 1 file',
      '  5. components/LifeCanvas.jsx  used by 1 file',
    ],
  },
};

function lineClass(l) {
  if (l.startsWith('#')) return 'text-mute/60';
  if (/\/$/.test(l)) return 'text-accent';
  if (/^\s+\d+\./.test(l)) return 'text-text';
  return 'text-mute';
}

export default function SproutTerminal() {
  const ref = useRef(null);
  const [tab, setTab] = useState('tree');
  const [typed, setTyped] = useState(0);
  const [lines, setLines] = useState(0);
  const [started, setStarted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { cmd, out } = TABS[tab];

  // start typing the first time the terminal scrolls into view
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setStarted(true), io.disconnect()), {
      threshold: 0.4,
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(cmd.length);
      setLines(out.length);
      return;
    }
    if (typed < cmd.length) {
      const t = setTimeout(() => setTyped(typed + 1), 28);
      return () => clearTimeout(t);
    }
    if (lines < out.length) {
      const t = setTimeout(() => setLines(lines + 1), lines === 0 ? 220 : 45);
      return () => clearTimeout(t);
    }
  }, [started, typed, lines, cmd, out]);

  function show(next) {
    setTab(next);
    setTyped(0);
    setLines(0);
    setStarted(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(TABS.install.cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <div ref={ref} className="rounded-lg border border-line bg-ink overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-line bg-raised/60">
        <span className="flex gap-1.5 px-2" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-coral/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-signal/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-accent/80" />
        </span>
        <div role="tablist" aria-label="Sprout examples" className="flex gap-1">
          {Object.keys(TABS).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => show(k)}
              className={`font-mono text-xs px-2.5 py-1 rounded transition-colors ${
                tab === k ? 'bg-paper text-signal' : 'text-mute hover:text-text'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <button
          onClick={copy}
          className="ml-auto font-mono text-xs px-2.5 py-1 rounded text-mute hover:text-signal transition-colors"
        >
          {copied ? 'copied' : 'copy install'}
        </button>
      </div>
      <pre className="font-mono text-[12px] sm:text-[13px] leading-relaxed p-4 sm:p-5 h-[250px] overflow-x-auto" aria-live="polite">
        <div>
          <span className="text-signal">❯ </span>
          <span className="text-text">{cmd.slice(0, typed)}</span>
          {typed < cmd.length && <span className="caret text-text" aria-hidden="true" />}
        </div>
        {out.slice(0, lines).map((l, i) => (
          <div key={i} className={lineClass(l)}>
            {l || ' '}
          </div>
        ))}
        {typed === cmd.length && lines === out.length && (
          <div>
            <span className="text-signal">❯ </span>
            <span className="caret text-text" aria-hidden="true" />
          </div>
        )}
      </pre>
    </div>
  );
}
