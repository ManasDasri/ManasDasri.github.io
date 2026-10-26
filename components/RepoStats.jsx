// A repo's traction, fetched at build time: stars, release downloads and commits,
// each linking to where GitHub shows it. Missing numbers are left out.
export default function RepoStats({ repo, stats, className = '' }) {
  if (!stats) return null;
  const base = `https://github.com/${repo}`;
  const items = [
    [stats.stars, 'stars', `${base}/stargazers`],
    [stats.downloads, 'downloads', `${base}/releases`],
    [stats.commits, 'commits', `${base}/commits`],
  ].filter(([n]) => n != null);
  return (
    <ul className={`list-none p-0 m-0 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-mute ${className}`} aria-label="On GitHub">
      {items.map(([n, label, href]) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer" className="no-underline text-mute hover:text-signal">
            <span className="text-text font-semibold text-sm">{n.toLocaleString('en-US')}</span> {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
