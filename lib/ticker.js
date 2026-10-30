// Data for the hero's highlights and Sprout's stats, fetched at build time (the site rebuilds
// hourly). Doing this in every visitor's browser would burn their 60/hour
// anonymous GitHub quota, which the rest of the page already uses. In CI the
// workflow's GITHUB_TOKEN is used; it never reaches the browser.

const USER = 'ManasDasri'; // GitHub
const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
const gh = (path) =>
  fetch(`https://api.github.com/${path}${path.includes('?') ? '&' : '?'}build=${Date.now()}`, { headers }).then((r) =>
    r.ok ? r.json() : Promise.reject(new Error(`${path}: ${r.status}`))
  );

// Stars, total release downloads and commit count for a repo. The commit count is
// the page number of the last page when listing one commit per page.
export async function repoStats(repo) {
  const [info, releases, commits] = await Promise.all([
    gh(`repos/${repo}`),
    gh(`repos/${repo}/releases?per_page=100`),
    fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, { headers }),
  ]);
  const last = commits.headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/)?.[1];
  return {
    stars: info.stargazers_count,
    downloads: releases.reduce((n, r) => n + r.assets.reduce((m, a) => m + a.download_count, 0), 0),
    commits: last ? Number(last) : null,
  };
}

const settle = (p) => p.catch(() => null);
let cached; // one fetch per build, however many pages ask

export function getTickerData() {
  cached ??= Promise.all([
    settle(gh('repos/Sprout-DevLabs/sprout/releases/latest').then((r) => r.tag_name)),
    settle(gh(`search/issues?q=${encodeURIComponent(`author:${USER} is:pr is:merged`)}&per_page=1`).then((r) => r.total_count)),
    settle(repoStats('Sprout-DevLabs/sprout')),
  ]).then(([sprout, mergedPRs, sproutStats]) => ({ sprout, mergedPRs, sproutStats }));
  return cached;
}
