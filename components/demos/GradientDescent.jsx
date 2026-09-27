'use client';

import { useEffect, useRef, useState } from 'react';

// One weight, one loss curve with two valleys. Gradient descent repeats
// w ← w − rate · f′(w): step downhill, by an amount set by the learning rate.
const f = (w) => 0.05 * w ** 4 - 0.6 * w ** 2 + 0.35 * w + 2;
const df = (w) => 0.2 * w ** 3 - 1.2 * w + 0.35;

const W_MIN = -3.7, W_MAX = 3.7, L_MIN = -1, L_MAX = 4.7; // fits the whole curve without clipping
const VW = 600, VH = 260, PAD = 24;
const x = (w) => PAD + ((w - W_MIN) / (W_MAX - W_MIN)) * (VW - 2 * PAD);
const y = (l) => VH - PAD - ((Math.min(Math.max(l, L_MIN), L_MAX) - L_MIN) / (L_MAX - L_MIN)) * (VH - 2 * PAD);
const toW = (px) => W_MIN + ((px - PAD) / (VW - 2 * PAD)) * (W_MAX - W_MIN);

const CURVE = Array.from({ length: 161 }, (_, i) => {
  const w = W_MIN + (i / 160) * (W_MAX - W_MIN);
  return `${i ? 'L' : 'M'}${x(w).toFixed(1)},${y(f(w)).toFixed(1)}`;
}).join(' ');

// From w = 3.2: 0.03 needs ~97 steps; 0.3 settles in 7 but in the nearer,
// shallower valley; 1.1 leaps into the deeper valley and bounces there; 1.6 diverges.
const PRESETS = [
  { rate: 0.03, label: 'too small: crawls' },
  { rate: 0.3, label: 'quick, but stuck in the near valley' },
  { rate: 1.1, label: 'big: escapes, never settles' },
  { rate: 1.6, label: 'too big: blows up' },
];
const MAX_STEPS = 150;

export default function GradientDescent() {
  const svgRef = useRef(null);
  const [rate, setRate] = useState(0.15);
  const [start, setStart] = useState(3.2);
  const [path, setPath] = useState([3.2]);
  const [steps, setSteps] = useState(0);
  const [running, setRunning] = useState(false);

  const w = path[path.length - 1];
  const escaped = !Number.isFinite(w) || Math.abs(w) > 6;
  const settled = path.length > 1 && Math.abs(w - path[path.length - 2]) < 1e-4;

  function step() {
    setSteps((n) => n + 1);
    setPath((p) => {
      const cur = p[p.length - 1];
      return [...p, cur - rate * df(cur)].slice(-60);
    });
  }

  function reset(from = start) {
    setRunning(false);
    setSteps(0);
    setPath([from]);
  }

  useEffect(() => {
    if (!running) return;
    if (escaped || settled || steps >= MAX_STEPS) return setRunning(false);
    const t = setTimeout(step, 180);
    return () => clearTimeout(t);
  });

  function pickStart(e) {
    const r = svgRef.current.getBoundingClientRect();
    const w0 = Math.min(W_MAX - 0.2, Math.max(W_MIN + 0.2, toW(((e.clientX - r.left) / r.width) * VW)));
    setStart(w0);
    reset(w0);
  }

  const status = escaped
    ? 'Diverged: each step overshot further than the last. Lower the learning rate.'
    : settled
    ? `Settled at w = ${w.toFixed(2)}, loss ${f(w).toFixed(3)}${w > 0 ? '. That is the shallower valley: a local minimum, not the best one.' : '. That is the deeper valley.'}`
    : `step ${steps} · w = ${w.toFixed(3)} · loss ${f(w).toFixed(3)} · slope ${df(w).toFixed(3)}`;

  return (
    <figure className="not-prose my-10 rounded-xl border border-line bg-paper p-5 sm:p-6">
      <figcaption className="font-mono text-xs text-signal mb-1">Interactive · added on this site</figcaption>
      <p className="font-head text-lg font-semibold text-text m-0">What “learning” looks like with one weight</p>
      <p className="text-sm text-mute mt-1 mb-4 max-w-[62ch]">
        The curve is the loss for every value of a single weight <em>w</em>. Each step moves <em>w</em> downhill by
        the learning rate times the slope. Click the curve to pick a start, then step or run.
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full h-auto cursor-crosshair select-none"
        onClick={pickStart}
        role="img"
        aria-label={`Loss curve with gradient descent path. ${status}`}
      >
        <path d={CURVE} fill="none" stroke="#16404A" strokeWidth="2" />
        {path.map((p, i) => {
          if (!Number.isFinite(p) || Math.abs(p) > 6) return null;
          const age = path.length - 1 - i; // newest cell is brightest, like the grid up top
          const fill = age === 0 ? '#7CF5E4' : age < 6 ? '#2BB3B1' : '#1F5F8B';
          return <rect key={i} x={x(p) - 5} y={y(f(p)) - 5} width="10" height="10" rx="1.5" fill={fill} opacity={age === 0 ? 1 : 0.8} />;
        })}
        {path.length > 1 &&
          path.slice(1).map((p, i) =>
            Number.isFinite(p) && Math.abs(p) <= 6 ? (
              <line key={i} x1={x(path[i])} y1={y(f(path[i]))} x2={x(p)} y2={y(f(p))} stroke="#2BB3B1" strokeOpacity="0.35" strokeDasharray="3 3" />
            ) : null
          )}
      </svg>

      <p className="font-mono text-xs text-mute min-h-[2.5em] mt-2" aria-live="polite">{status}</p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-3">
        <label className="flex items-center gap-3 font-mono text-xs text-mute">
          learning rate
          <input
            type="range"
            min="0.01"
            max="1.8"
            step="0.01"
            value={rate}
            onChange={(e) => {
              setRate(+e.target.value);
              reset();
            }}
            className="accent-[#7CF5E4] w-32"
          />
          <span className="text-text w-8">{rate.toFixed(2)}</span>
        </label>
        <div className="flex gap-2">
          {[
            ['step', step, escaped || settled],
            [running ? 'pause' : 'run', () => setRunning((r) => !r), escaped || settled],
            ['reset', () => reset(), false],
          ].map(([label, fn, disabled]) => (
            <button
              key={label}
              onClick={fn}
              disabled={disabled}
              className="font-mono text-xs text-text border border-line rounded px-3 py-1.5 hover:border-signal hover:text-signal transition-colors disabled:opacity-40"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {PRESETS.map((p) => (
          <button
            key={p.rate}
            onClick={() => {
              setRate(p.rate);
              reset();
            }}
            className={`font-mono text-[11px] rounded px-2 py-1 transition-colors ${
              rate === p.rate ? 'bg-signal/15 text-signal' : 'text-mute hover:text-text'
            }`}
          >
            {p.rate} · {p.label}
          </button>
        ))}
      </div>
    </figure>
  );
}
