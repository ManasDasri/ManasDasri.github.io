'use client';

import { useEffect, useRef, useState } from 'react';
import DEMO from '@/lib/sproutDemo.json';

// Real output: sprout run on this site's own repo, captured by scripts/sprout-demo.mjs.
// Typing a captured command (or the start of one, like `sprout tour`) prints it.
const INSTALL = [
  '# this terminal is a demo; run these in yours',
  'brew install sprout-devlabs/tap/sprout',
  '# windows',
  'scoop bucket add sprout https://github.com/Sprout-DevLabs/scoop-bucket',
  'scoop install sprout',
  '# anywhere with go 1.22+',
  'go install github.com/Sprout-DevLabs/sprout@latest',
];
const MCP = [
  '# give your coding agent the same map, as MCP tools',
  'claude mcp add sprout -- sprout mcp',
  '# tools: project_map, reading_order, tree, diff_tree, deps,',
  '#        dependents, impact, context',
];
const HELP = [
  'sprout tour                     what this repo is and where to start',
  'sprout --entry                  the reading order',
  'sprout                          the tree, ignoring what git ignores',
  'sprout --size / --churn         true folder sizes, or the 90-day hotspots',
  'sprout --diff HEAD~3 -L 1       the last three commits as a tree',
  'sprout dependents <file>        what depends on a file, and why',
  'sprout impact <file>            what a change could break, and the tests',
  'sprout context <file>           what to know before editing a file',
  'sprout --ai                     a token-budgeted map for an LLM',
  'sprout mcp                      the same, as tools for your agent',
  'install, clear',
];
const SUGGESTIONS = ['sprout tour', 'sprout impact components/Section.jsx', 'sprout --diff HEAD~3 -L 1', 'sprout --ai', 'help'];

// the captured command this input asks for: the same, or the one it starts
function captured(input) {
  if (input === 'sprout') input = 'sprout -L 1';
  if (DEMO[input]) return DEMO[input];
  const key = Object.keys(DEMO).find((k) => k.startsWith(`${input} `));
  return key ? [`$ ${key}`, ...DEMO[key]] : null;
}

function run(input) {
  const line = input.trim().replace(/\s+/g, ' ');
  if (!line) return [];
  if (line === 'help') return HELP;
  if (line === 'install' || line.startsWith('brew')) return INSTALL;
  if (line === 'sprout mcp') return MCP;
  if (line === 'sudo' || line.startsWith('sudo ')) return ['nice try.'];
  if (!line.startsWith('sprout')) return [`command not found: ${line.split(' ')[0]}. Try: help`];
  return captured(line) ?? [`this demo has real output for a few commands (help lists them).`, 'For anything else, the real thing: install'];
}

function lineClass(l) {
  if (/^#{1,2} /.test(l)) return 'text-signal';
  if (l.startsWith('#') || l.startsWith('$ ')) return 'text-mute/60';
  if (/^[^\s].*\/(\s|$)|[├└]── [^ ]+\/(\s|$)/.test(l)) return 'text-accent';
  if (/^\s+\d+\.|^(Affected|Tests|Start here|Impact|Reading order|Tour of)/.test(l)) return 'text-text';
  return 'text-mute';
}

// greet: the command it types when it first comes into view
export default function SproutTerminal({ greet = 'sprout' }) {
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
    setHistory((h) => [...h, { cmd, out: run(cmd) }]);
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
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          type(greet);
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
    <div id="terminal" ref={ref}>
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
