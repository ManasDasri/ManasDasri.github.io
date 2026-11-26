'use client';

// One bar for every page. On the home page the section links scroll; elsewhere they go home first.
const LINKS = [
  ['Work', 'work'],
  ['Open source', 'open-source'],
  ['Log', 'log'],
  ['Writing', 'writing'],
  ['Contact', 'contact'],
];

export default function SiteNav({ home = false }) {
  return (
    <nav className="nav wrap" aria-label="Site">
      <a href={home ? '#top' : '/'} className="nav-me">Manas Dasari</a>
      <ul>
        {LINKS.map(([label, id]) => (
          <li key={id}>
            <a href={home ? `#${id}` : `/#${id}`}>{label}</a>
          </li>
        ))}
      </ul>
      <button className="nav-k" onClick={() => window.dispatchEvent(new Event('open-palette'))} aria-label="Open the command menu">
        ⌘K
      </button>
    </nav>
  );
}
