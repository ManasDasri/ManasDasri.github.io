'use client';

import { useState } from 'react';
import { projects, byRank } from '@/lib/data';

// A light table: the list on the left, the selected project's prints on the right. Prints
// rest as cyanotypes and develop into full colour when their project is picked.
const list = [...projects].sort(byRank);
const host = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '');

function Plate({ p, shot, setShot }) {
  const shots = p.screenshots ?? [];
  const repo = p.repoUrl ?? (p.repo && `https://github.com/${p.repo}`);
  return (
    <div className="plate">
      {shots.length > 0 ? (
        <div className="plate-print">
          {shots.map((s, i) => (
            <img key={s.src} src={s.src} alt={s.alt} loading="lazy" className={i === shot % shots.length ? 'on' : ''} />
          ))}
          {shots.length > 1 && (
            <div className="plate-pager" role="group" aria-label={`${p.name} screenshots`}>
              {shots.map((s, i) => (
                <button key={s.src} aria-label={`Screenshot ${i + 1} of ${shots.length}`} aria-pressed={i === shot % shots.length} onClick={() => setShot(i)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="plate-print plate-blank">
          <span>{p.name}</span>
          <small>No public page yet; the code is on GitHub.</small>
        </div>
      )}
      <div className="plate-text">
        {p.proof && <p className="plate-proof">{p.proof}</p>}
        <p>{p.built ?? p.description}</p>
        <div className="plate-links">
          {p.slug && <a href={`/projects/${p.slug}/`}>How it works</a>}
          {p.link && !p.link.includes('github.com') && (
            <a href={p.link} target="_blank" rel="noopener noreferrer">{host(p.link)} ↗</a>
          )}
          {(repo || p.link?.includes('github.com')) && (
            <a href={repo ?? p.link} target="_blank" rel="noopener noreferrer">Code ↗</a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Work() {
  const [active, setActive] = useState(0);
  const [shot, setShot] = useState(0);
  const pick = (i) => {
    if (i !== active) setShot(0);
    setActive(i);
  };
  return (
    <section id="work" className="wrap section">
      <header className="section-head">
        <h2>Work</h2>
        <p>Research I can show the numbers for, and tools people use. Pick one to see it.</p>
      </header>
      <div className="table">
        <ol className="table-list">
          {list.map((p, i) => (
            <li key={p.name} className={i === active ? 'on' : ''}>
              <button onClick={() => pick(i)} onPointerEnter={() => pick(i)} onFocus={() => pick(i)} aria-expanded={i === active} aria-controls="plate">
                <span className="row-name">{p.name}</span>
                <span className="row-tag">{p.tagline}</span>
                <span className="row-meta">
                  {p.kind}
                  <em className={p.badge === 'research' ? 'res' : ''}>{p.status}</em>
                </span>
              </button>
              {/* small screens: the plate opens under its row */}
              {i === active && (
                <div className="table-inline">
                  <Plate p={p} shot={shot} setShot={setShot} />
                </div>
              )}
            </li>
          ))}
        </ol>
        <div id="plate" className="table-view" aria-live="polite">
          <Plate p={list[active]} shot={shot} setShot={setShot} />
        </div>
      </div>
      <a href="/projects/" className="more">Every project, with diagrams and write-ups</a>
    </section>
  );
}
