'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FiCloud, FiFeather, FiFolder, FiGrid, FiMaximize2, FiMinimize2, FiMinus, FiPower, FiTerminal, FiX, FiZap } from 'react-icons/fi';
import { projects } from '@/lib/data';
import { getWeather } from '@/lib/weather';
import SproutTerminal from '../SproutTerminal';
import Sigil from '../Sigil';
import MiniLife from './MiniLife';
import { BitLoader } from '../Bits';

// `startx` boots this: a Plasma-style desktop over the page, with a launcher,
// a taskbar, a system tray and draggable windows for a few small apps.

function Weather() {
  const [w, setW] = useState(undefined);
  useEffect(() => void getWeather().then(setW), []);
  if (w === undefined) return <p className="font-mono text-xs text-mute">checking the sky…</p>;
  if (!w) return <p className="font-mono text-xs text-mute">Open-Meteo didn’t answer. Try again in a bit.</p>;
  return (
    <div>
      <p className="font-mono text-xs text-mute">Bengaluru, now</p>
      <p className="font-head text-6xl font-extrabold tracking-tight text-text mt-1">{Math.round(w.temp)}°C</p>
      <p className="text-text capitalize mt-1">
        {w.text}
        {w.night ? ' night' : ''}
      </p>
      <p className="font-mono text-xs text-mute mt-1">wind {Math.round(w.wind)} km/h · rain {w.precip} mm</p>
      <p className="text-sm text-mute leading-relaxed mt-4">
        The colony on the homepage lives in this weather: rain seeds new cells, heat speeds it up, night dims it,
        and thunderstorms strike lightning.
      </p>
    </div>
  );
}

function Projects({ go }) {
  return (
    <ul className="list-none p-0 m-0 grid grid-cols-2 sm:grid-cols-3 gap-3">
      {projects.map((p) => (
        <li key={p.name}>
          <button
            onClick={() => p.slug && go(`/projects/${p.slug}/`)}
            className="w-full flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-raised focus-visible:bg-raised transition-colors"
          >
            <Sigil pattern={p.pattern} playing dim={!p.active} />
            <span className="text-sm text-text">{p.name}</span>
            <span className="font-mono text-[11px] text-mute">{p.status}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Writing({ posts, go }) {
  return (
    <ul className="list-none p-0 m-0 flex flex-col gap-1">
      {posts.map((p) => (
        <li key={p.slug}>
          <button onClick={() => go(`/writing/${p.slug}/`)} className="w-full text-left rounded-lg p-3 hover:bg-raised transition-colors">
            <span className="block text-text">{p.title}</span>
            <span className="block font-mono text-xs text-mute mt-0.5">
              {p.date} · {p.readMins} min read
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

const APPS = {
  konsole: { title: 'Konsole', icon: FiTerminal, w: 680, h: 470 },
  projects: { title: 'Projects', icon: FiFolder, w: 560, h: 400 },
  writing: { title: 'Writing', icon: FiFeather, w: 520, h: 330 },
  life: { title: 'Life sandbox', icon: FiZap, w: 540, h: 470 },
  weather: { title: 'Weather', icon: FiCloud, w: 360, h: 330 },
};

function Window({ win, focused, children, onFocus, onClose, onMinimize, onToggleMax, onMove }) {
  const drag = useRef(null);
  const app = APPS[win.app];
  const max = win.max;

  function startDrag(e) {
    if (max || e.target.closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
  }
  function moveDrag(e) {
    if (!drag.current) return;
    // keep the title bar reachable: never fully off-screen
    const x = Math.min(window.innerWidth - 80, Math.max(-win.w + 120, e.clientX - drag.current.dx));
    const y = Math.min(window.innerHeight - 90, Math.max(0, e.clientY - drag.current.dy));
    onMove(x, y);
  }

  return (
    <section
      role="dialog"
      aria-label={app.title}
      onPointerDown={onFocus}
      style={max ? { zIndex: win.z } : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      className={`absolute flex flex-col overflow-hidden border bg-paper shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] ${
        max ? 'inset-0 bottom-11 rounded-none' : 'rounded-xl max-w-[calc(100vw-16px)]'
      } ${focused ? 'border-signal/40' : 'border-line'} ${win.min ? 'hidden' : ''}`}
    >
      <header
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => (drag.current = null)}
        onDoubleClick={onToggleMax}
        className={`flex items-center gap-2 px-3 h-9 shrink-0 border-b border-line select-none touch-none ${
          focused ? 'bg-raised' : 'bg-paper'
        } ${max ? '' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <app.icon className={`w-3.5 h-3.5 ${focused ? 'text-signal' : 'text-mute'}`} aria-hidden="true" />
        <h2 className={`text-xs font-mono ${focused ? 'text-text' : 'text-mute'}`}>{app.title}</h2>
        <div className="ml-auto flex gap-1">
          {[
            ['Minimise', FiMinus, onMinimize],
            [max ? 'Restore' : 'Maximise', max ? FiMinimize2 : FiMaximize2, onToggleMax],
            ['Close', FiX, onClose],
          ].map(([label, Icon, fn]) => (
            <button
              key={label}
              onClick={fn}
              aria-label={`${label} ${app.title}`}
              className={`w-6 h-6 flex items-center justify-center rounded-md text-mute hover:text-text ${
                label === 'Close' ? 'hover:bg-accent/80 hover:text-ink' : 'hover:bg-line'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          ))}
        </div>
      </header>
      <div className="flex-1 min-h-0 overflow-auto p-4">{children}</div>
    </section>
  );
}

function Clock() {
  const [now, setNow] = useState('');
  useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }));
    tick();
    const t = setInterval(tick, 15000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs text-text tabular-nums" title="Bengaluru time (IST)">
      {now}
    </span>
  );
}

function TrayWeather({ onOpen }) {
  const [w, setW] = useState(null);
  useEffect(() => void getWeather().then(setW), []);
  if (!w) return null;
  return (
    <button onClick={onOpen} className="font-mono text-xs text-mute hover:text-text px-1" title={`Bengaluru: ${w.text}`}>
      {Math.round(w.temp)}°C
    </button>
  );
}

export default function Desktop({ posts }) {
  const [state, setState] = useState('off'); // off → booting → on
  const [wins, setWins] = useState([]);
  const [launcher, setLauncher] = useState(false);
  const launcherOpen = useRef(false);
  launcherOpen.current = launcher;
  const z = useRef(10);
  const rootRef = useRef(null);
  const focused = wins.filter((w) => !w.min).sort((a, b) => b.z - a.z)[0]?.id;

  const open = useCallback((app) => {
    setLauncher(false);
    setWins((ws) => {
      const existing = ws.find((w) => w.app === app);
      if (existing) return ws.map((w) => (w.id === existing.id ? { ...w, min: false, z: ++z.current } : w));
      const { w, h } = APPS[app];
      const n = ws.length;
      return [
        ...ws,
        {
          id: `${app}-${Date.now()}`,
          app,
          x: Math.max(8, Math.min(window.innerWidth - w - 8, 96 + n * 32)),
          y: Math.max(8, Math.min(window.innerHeight - h - 60, 48 + n * 28)),
          w,
          h,
          z: ++z.current,
          min: false,
          max: window.innerWidth < 640, // phones: full-screen windows
        },
      ];
    });
  }, []);

  const update = (id, patch) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  const focus = (id) => update(id, { z: ++z.current, min: false });
  const close = (id) => setWins((ws) => ws.filter((w) => w.id !== id));

  const start = useCallback(() => {
    setState((s) => (s === 'off' ? 'booting' : s));
  }, []);
  const exit = useCallback(() => {
    setState('off');
    setWins([]);
    setLauncher(false);
  }, []);
  const go = (href) => {
    exit();
    window.location.href = href;
  };

  // boot sequence: a short splash, then the desktop with Konsole open
  useEffect(() => {
    if (state !== 'booting') return;
    const t = setTimeout(() => {
      setState('on');
      open('konsole');
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1100);
    return () => clearTimeout(t);
  }, [state, open]);

  // entry points: `startx` in the terminal, the palette, or /?startx
  useEffect(() => {
    window.addEventListener('startx', start);
    window.addEventListener('desktop-exit', exit);
    if (new URLSearchParams(location.search).has('startx')) start();
    return () => {
      window.removeEventListener('startx', start);
      window.removeEventListener('desktop-exit', exit);
    };
  }, [start, exit]);

  // while running: lock page scroll, tell the banner to ignore its hotkeys, Esc closes menus then logs out
  useEffect(() => {
    if (state === 'off') return;
    const html = document.documentElement;
    html.dataset.desktop = 'on';
    html.style.overflow = 'hidden';
    rootRef.current?.focus();
    const onKey = (e) => {
      if (e.key !== 'Escape' || /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
      if (launcherOpen.current) setLauncher(false);
      else exit();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      delete html.dataset.desktop;
      html.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [state, exit]);

  if (state === 'off') return null;

  if (state === 'booting')
    return (
      <div className="fixed inset-0 z-[45] bg-ink flex flex-col items-center justify-center gap-5" role="status" aria-label="Starting desktop">
        <div className="scale-150">
          <Sigil pattern="glider" playing />
        </div>
        <BitLoader label="starting Plasma…" />
      </div>
    );

  const content = (app) =>
    app === 'konsole' ? <SproutTerminal embedded /> :
    app === 'projects' ? <Projects go={go} /> :
    app === 'writing' ? <Writing posts={posts} go={go} /> :
    app === 'life' ? <MiniLife /> : <Weather />;

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Desktop mode. Press Escape or Log out to leave."
      className="fixed inset-0 z-[45] overflow-hidden outline-none bg-ink"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 20% 15%, rgb(var(--c-signal) / 0.16), transparent 55%), radial-gradient(ellipse at 85% 80%, rgb(var(--c-old) / 0.35), transparent 60%), radial-gradient(circle, rgb(var(--c-signal) / 0.08) 1px, transparent 1px)',
        backgroundSize: 'auto, auto, 18px 18px',
      }}
      onPointerDown={(e) => e.target === e.currentTarget && setLauncher(false)}
    >
      {/* desktop icons */}
      <ul className="list-none p-3 m-0 hidden sm:flex flex-col gap-1 w-24">
        {Object.entries(APPS).map(([key, a]) => (
          <li key={key}>
            <button
              onDoubleClick={() => open(key)}
              onKeyDown={(e) => e.key === 'Enter' && open(key)}
              className="w-full flex flex-col items-center gap-1.5 rounded-lg p-2 text-mute hover:bg-paper/60 hover:text-text focus-visible:bg-paper/60"
              title="Double-click to open"
            >
              <a.icon className="w-7 h-7 text-signal/90" aria-hidden="true" />
              <span className="text-[11px] text-text text-center leading-tight">{a.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {wins.map((w) => (
        <Window
          key={w.id}
          win={w}
          focused={w.id === focused}
          onFocus={() => w.id !== focused && focus(w.id)}
          onClose={() => close(w.id)}
          onMinimize={() => update(w.id, { min: true })}
          onToggleMax={() => update(w.id, { max: !w.max })}
          onMove={(x, y) => update(w.id, { x, y })}
        >
          {content(w.app)}
        </Window>
      ))}

      {/* launcher menu */}
      {launcher && (
        <div className="absolute left-2 bottom-12 z-[200] w-72 rounded-xl border border-line bg-paper/95 backdrop-blur-md shadow-2xl p-2">
          <div className="flex items-center gap-3 p-2 mb-1 border-b border-line">
            <img src="/pfp_main.jpeg" alt="" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <p className="text-sm text-text m-0">Manas Dasari</p>
              <p className="font-mono text-[11px] text-mute m-0">manas@algorithmicbit</p>
            </div>
          </div>
          {Object.entries(APPS).map(([key, a]) => (
            <button key={key} onClick={() => open(key)} className="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-text hover:bg-raised">
              <a.icon className="w-4 h-4 text-signal" aria-hidden="true" />
              {a.title}
            </button>
          ))}
          <button onClick={exit} className="w-full flex items-center gap-3 rounded-lg px-2 py-2 mt-1 border-t border-line text-left text-sm text-mute hover:bg-raised hover:text-text">
            <FiPower className="w-4 h-4" aria-hidden="true" />
            Log out (back to the site)
          </button>
        </div>
      )}

      {/* panel */}
      <nav aria-label="Taskbar" className="absolute inset-x-0 bottom-0 h-11 z-[150] flex items-center gap-1 px-2 bg-ink/90 backdrop-blur-md border-t border-line">
        <button
          onClick={() => setLauncher((l) => !l)}
          aria-expanded={launcher}
          aria-label="Application launcher"
          className={`w-9 h-9 flex items-center justify-center rounded-lg ${launcher ? 'bg-raised text-signal' : 'text-text hover:bg-raised'}`}
        >
          <FiGrid className="w-4 h-4" aria-hidden="true" />
        </button>
        <span className="w-px h-6 bg-line mx-1" aria-hidden="true" />
        <div className="flex-1 min-w-0 flex gap-1 overflow-x-auto no-scrollbar">
          {wins.map((w) => {
            const a = APPS[w.app];
            const active = w.id === focused;
            return (
              <button
                key={w.id}
                onClick={() => (active ? update(w.id, { min: true }) : focus(w.id))}
                aria-pressed={active}
                className={`flex items-center gap-2 h-9 px-3 rounded-lg text-xs whitespace-nowrap border-b-2 ${
                  active ? 'bg-raised text-text border-signal' : w.min ? 'text-mute border-transparent hover:bg-raised' : 'text-text border-line hover:bg-raised'
                }`}
              >
                <a.icon className="w-3.5 h-3.5" aria-hidden="true" />
                {a.title}
              </button>
            );
          })}
        </div>
        <TrayWeather onOpen={() => open('weather')} />
        <span className="px-2">
          <Clock />
        </span>
        <button onClick={exit} aria-label="Log out" className="w-9 h-9 flex items-center justify-center rounded-lg text-mute hover:text-accent hover:bg-raised">
          <FiPower className="w-4 h-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
