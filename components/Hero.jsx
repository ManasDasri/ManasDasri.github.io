'use client';

import { useRef } from 'react';
import DocLink from './DocLink';
import WorkMap from './WorkMap';
import { status } from '@/lib/data';

const EMAIL = 'dasarimanas049@gmail.com';

// The name is set in Archivo's width axis: letters near the pointer stretch wide and heavy,
// the rest narrow, like type under a magnifier. Nothing moves until you move.
function Name() {
  const ref = useRef(null);
  const raf = useRef(0);
  const move = (e) => {
    const x = e.clientX, y = e.clientY;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      for (const ch of ref.current.querySelectorAll('[data-ch]')) {
        const r = ch.getBoundingClientRect();
        const d = Math.hypot(x - (r.left + r.width / 2), (y - (r.top + r.height / 2)) * 1.6);
        const t = Math.max(0, 1 - d / 260);
        ch.style.fontVariationSettings = `'wdth' ${(78 + t * 47).toFixed(1)}, 'wght' ${(560 + t * 340).toFixed(0)}`;
      }
    });
  };
  const leave = () => {
    cancelAnimationFrame(raf.current);
    for (const ch of ref.current.querySelectorAll('[data-ch]')) ch.style.fontVariationSettings = '';
  };
  return (
    <h1 ref={ref} className="name" onPointerMove={move} onPointerLeave={leave} aria-label="Manas Dasari">
      {['Manas', 'Dasari'].map((word) => (
        <span key={word} className="name-line" aria-hidden="true">
          {[...word].map((c, i) => (
            <span key={i} data-ch>
              {c}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

export default function Hero({ highlights = [] }) {
  return (
    <section id="top" className="hero wrap">
      <div className="hero-copy">
        <Name />
        <p className="hero-intro">
          I run machine learning experiments built to be checked: held-out tests, baselines, and the null results
          reported next to the rest. I also build developer tools, and send fixes upstream to projects like Zed,
          Gleam and rules_go. CS at Amrita, class of 2028.
        </p>
        <div className="hero-actions">
          <a href={`mailto:${EMAIL}`} className="btn btn-solid">Email me</a>
          <DocLink doc="resume" className="btn">Résumé</DocLink>
          <a href="/recruiter/" className="btn">One-page summary</a>
        </div>
        {status && (
          <p className="hero-status">
            <span className="dot" aria-hidden="true" /> {status[0].toUpperCase() + status.slice(1)}
          </p>
        )}
        {highlights.length > 0 && (
          <ul className="hero-facts">
            {highlights.map((h) => (
              <li key={h.label}>
                <a href={h.href} className="fact" {...(h.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  <strong>{h.value}</strong>
                  <span>{h.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <WorkMap />
    </section>
  );
}
