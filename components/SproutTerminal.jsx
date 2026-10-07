'use client';

import { useEffect, useRef, useState } from 'react';
import { projects } from '@/lib/data';
import { RULES, SHAPES, ruleCode } from './LifeCanvas';
import { shareColony } from '@/lib/lifeShare';

// Real output: sprout 0.2.0 run on this portfolio's own repo.
const TREE = [
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
];
const ENTRY = [
  'Reading order for ManasDasri.github.io',
  '',
  '  1. README.md                  what the project is',
  '  2. components/Section.jsx     used by 5 files',
  '  3. components/Scramble.jsx    used by 2 files',
  '  4. components/Effects.jsx     used by 1 file',
  '  5. components/LifeCanvas.jsx  used by 1 file',
];
const INSTALL = [
  '# this terminal is a demo; run these in yours',
  'brew install sprout-devlabs/tap/sprout',
  '# windows',
  'scoop bucket add sprout https://github.com/Sprout-DevLabs/scoop-bucket',
  'scoop install sprout',
  '# anywhere with go 1.22+',
  'go install github.com/Sprout-DevLabs/sprout@latest',
];
const HELP = [
  'sprout             tree of this site’s repo',
  'sprout --entry     where to start reading it',
  'install            how to get sprout',
  'ls                 my projects',
  'open <project>     project details, e.g. open flow',
  'life               control the Game of Life up top',
  'neofetch           what this site runs on',
  'startx             boot the desktop',
  'whoami, contact, clear',
];
const SUGGESTIONS = ['sprout --entry', 'life', 'life rule highlife', 'ls', 'help'];

const LIFE_HELP = [
  'life                  status + a live snapshot of the grid',
  'life pause | resume | reseed',
  'life share            copy a link to this exact colony',
  'life sound [on | off] let the colony play music',
  'life ascii [on | off] draw the colony in characters',
  `life rule [${Object.keys(RULES).join(' | ')}]`,
  `life drop [${Object.keys(SHAPES).join(' | ')}]`,
];

// Talks to the banner through its 'life' event; the reply comes back synchronously.
function life(args) {
  const [sub, value] = args;
  const actions = { ascii: ['view', value === 'on' ? 'ascii' : value === 'off' ? 'cells' : undefined], sound: ['sound', value === 'on' ? true : value === 'off' ? false : undefined], pause: ['pause', true], resume: ['pause', false], reseed: ['reseed'], rule: ['rule', value], drop: ['drop', value] };
  if (sub === 'help') return LIFE_HELP;
  if (sub === 'share')
    return shareColony().then((r) =>
      r ? [`link ${r.how === 'copied' ? 'copied' : r.how === 'shared' ? 'shared' : 'is in the address bar'}:`, r.url] : ['the grid isn’t running on this page.']
    );
  if (sub && !actions[sub]) return [`unknown: life ${sub}`, ...LIFE_HELP];
  if (sub === 'rule' && value && !RULES[value]) return [`no rule "${value}". Try: ${Object.keys(RULES).join(', ')}`];
  if (sub === 'drop' && !SHAPES[value]) return [`drop what? ${Object.keys(SHAPES).join(', ')}`];
  const [action, v] = actions[sub] ?? ['status'];
  let status;
  window.dispatchEvent(new CustomEvent('life', { detail: { action, value: v, reply: (s) => (status = s) } }));
  if (!status) return ['the grid isn’t running on this page. Try it on the homepage.'];
  const r = RULES[status.rule];
  return [
    `${r.name} ${ruleCode(r)} · generation ${status.gen} · ${status.pop} alive${status.paused ? ' · paused' : ''}${status.sound ? ' · sound on' : ''}`,
    '',
    ...status.grid,
    '',
    sub ? '# scroll up to watch it' : '# life help for commands',
  ];
}

const inDesktop = () => typeof document !== 'undefined' && document.documentElement.dataset.desktop === 'on';

// the obligatory ricer screenshot, with real values from the site
function neofetch() {
  const days = Math.floor((Date.now() - new Date('2026-01-01')) / 86400000);
  const logo = ['  ·■·  ', '  ··■  ', '  ■■■  ', '       ', ' glider'];
  const info = [
    'manas@algorithmicbit',
    '────────────────────',
    'OS: algorithmicbit.tech',
    'Host: GitHub Pages',
    'Kernel: Next.js 14 (static export)',
    'Shell: sprout-term',
    `DE: Plasma (simulated)${inDesktop() ? '' : ', try startx'}`,
    'WM: Life B3/S23',
    'Theme: Bioluminescent',
    `Uptime: coding for ${days} days`,
    `Projects: ${projects.length}`,
  ];
  return info.map((line, i) => `${(logo[i] ?? '').padEnd(10)}${line}`);
}

function run(input) {
  const [cmd, ...args] = input.trim().split(/\s+/);
  const rest = args.join(' ');
  switch (cmd) {
    case '':
      return [];
    case 'help':
      return HELP;
    case 'sprout':
      if (!rest || rest === '-L 1') return TREE;
      if (rest === '--entry') return ENTRY;
      if (rest === '--version') return ['sprout 0.2.0'];
      return [`sprout ${rest} works in the real thing. Try: install`];
    case 'install':
    case 'brew':
      return INSTALL;
    case 'ls':
      return projects.map((p) => `${p.name.toLowerCase().padEnd(10)} ${p.status}`);
    case 'open': {
      const p = projects.find((p) => p.slug === rest.toLowerCase());
      if (!p) return [`no project called "${rest}". Try: ls`];
      setTimeout(() => (window.location.href = `/projects/${p.slug}/`), 500);
      return [`opening ${p.name}…`];
    }
    case 'life':
      return life(args);
    case 'neofetch':
      return neofetch();
    case 'startx':
      if (inDesktop()) return ['a desktop is already running.'];
      setTimeout(() => window.dispatchEvent(new Event('startx')), 300);
      return ['starting Plasma…'];
    case 'exit':
    case 'logout':
      if (!inDesktop()) return ['nothing to exit. Try: startx'];
      setTimeout(() => window.dispatchEvent(new Event('desktop-exit')), 200);
      return ['logging out…'];
    case 'whoami':
      return ['Manas Dasari: engineer, fintech enthusiast, artist, writer'];
    case 'contact':
      return ['email   dasarimanas049@gmail.com', 'github  github.com/ManasDasri', 'x       x.com/ManasDmg9'];
    case 'sudo':
      return ['nice try.'];
    default:
      return [`command not found: ${cmd}. Try: help`];
  }
}

function lineClass(l) {
  if (/^[■·]+$/.test(l)) return 'text-signal/80 leading-[1.1]';
  if (l.startsWith('#')) return 'text-mute/60';
  if (/\/$/.test(l)) return 'text-accent';
  if (/^\s+\d+\./.test(l)) return 'text-text';
  return 'text-mute';
}

// `embedded` is the copy inside the desktop: no page-level id, no auto-run,
// and it doesn't take commands meant for the page's terminal.
export default function SproutTerminal({ embedded = false }) {
  const ref = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const [history, setHistory] = useState([]); // [{ cmd, out }]
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(null); // command being auto-typed
  const [recall, setRecall] = useState(-1);

  // animate a command being typed, then run it
  function type(cmd) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return submit(cmd);
    setTyping(cmd);
    setInput('');
  }

  function submit(cmd) {
    if (cmd.trim() === 'clear') return setHistory([]);
    const out = run(cmd);
    if (!(out instanceof Promise)) return setHistory((h) => [...h, { cmd, out }]);
    // async commands (life share) show a placeholder, then their real output
    const id = Symbol();
    setHistory((h) => [...h, { id, cmd, out: ['…'] }]);
    out.then((lines) => setHistory((h) => h.map((e) => (e.id === id ? { ...e, out: lines } : e))));
  }

  useEffect(() => {
    if (typing === null) return;
    if (input.length < typing.length) {
      const t = setTimeout(() => setInput(typing.slice(0, input.length + 1)), 32);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      submit(typing);
      setTyping(null);
      setInput('');
    }, 250);
    return () => clearTimeout(t);
  }, [typing, input]);

  // first time on screen: run the tree so it looks alive
  useEffect(() => {
    if (embedded) {
      type('neofetch');
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          type('sprout');
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    const onRun = (e) => type(e.detail);
    window.addEventListener('terminal-run', onRun);
    return () => {
      io.disconnect();
      window.removeEventListener('terminal-run', onRun);
    };
  }, []);

  // keep the newest output in view by scrolling the terminal, never the page
  useEffect(() => {
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history, input]);

  function onKeyDown(e) {
    const cmds = history.map((h) => h.cmd);
    if (e.key === 'Enter') {
      submit(input);
      setInput('');
      setRecall(-1);
    } else if (e.key === 'ArrowUp' && cmds.length) {
      e.preventDefault();
      const i = recall < 0 ? cmds.length - 1 : Math.max(0, recall - 1);
      setRecall(i);
      setInput(cmds[i]);
    } else if (e.key === 'ArrowDown' && recall >= 0) {
      e.preventDefault();
      const i = recall + 1;
      setRecall(i < cmds.length ? i : -1);
      setInput(i < cmds.length ? cmds[i] : '');
    }
  }

  const prompt = <span className="text-signal select-none">❯ </span>;

  return (
    <div id={embedded ? undefined : 'terminal'} ref={ref}>
      <div className="rounded-lg border border-line bg-ink overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2 border-b border-line bg-raised/60">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-accent/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-signal/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-mature/80" />
          </span>
          <span className="font-mono text-xs text-mute">~/ManasDasri.github.io</span>
          <span className="ml-auto font-mono text-[11px] text-mute/70">type help</span>
        </div>
        <div
          ref={bodyRef}
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
          className="font-mono text-[12px] sm:text-[13px] leading-relaxed p-4 sm:p-5 h-[270px] overflow-auto cursor-text"
        >
          <div aria-live="polite">
            {history.map((h, i) => (
              <div key={i} className="mb-2">
                <div className="whitespace-pre">
                  {prompt}
                  <span className="text-text">{h.cmd}</span>
                </div>
                {h.out.map((l, j) => (
                  <div key={j} className={`whitespace-pre ${lineClass(l)}`}>
                    {l || ' '}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <label className="flex items-center whitespace-pre">
            {prompt}
            <input
              ref={inputRef}
              aria-label="Terminal command"
              value={input}
              onChange={(e) => typing === null && setInput(e.target.value)}
              onKeyDown={onKeyDown}
              readOnly={typing !== null}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-text caret-signal p-0"
            />
          </label>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => type(s)}
            disabled={typing !== null}
            className="font-mono text-xs text-mute border border-line rounded px-2.5 py-1 hover:text-signal hover:border-signal transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
