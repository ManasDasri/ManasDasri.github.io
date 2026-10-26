// Data for the footer's LED ticker and the hero's highlights, fetched at build time (the site rebuilds
// hourly). Doing this in every visitor's browser would burn their 60/hour
// anonymous GitHub quota, which the rest of the page already uses. In CI the
// workflow's GITHUB_TOKEN is used; it never reaches the browser.
import { getLeetCodeStats } from './leetcode.js';

const USER = 'ManasDasri'; // GitHub
const LEETCODE_USER = 'ManasDasari'; // LeetCode (spelled differently)
const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
const gh = (path) =>
  fetch(`https://api.github.com/${path}${path.includes('?') ? '&' : '?'}build=${Date.now()}`, { headers }).then((r) =>
    r.ok ? r.json() : Promise.reject(new Error(`${path}: ${r.status}`))
  );

// My most recent pull request, anywhere on GitHub except this site's own repo
// (every site change is a PR, so it would mostly announce itself).
async function latestPR() {
  const q = encodeURIComponent(`author:${USER} is:pr -repo:${USER}/${USER}.github.io`);
  const { items } = await gh(`search/issues?q=${q}&sort=created&order=desc&per_page=1`);
  const pr = items?.[0];
  if (!pr) return null;
  return {
    title: pr.title.slice(0, 64),
    repo: pr.repository_url.split('/repos/')[1],
    state: pr.pull_request?.merged_at ? 'merged' : pr.state === 'open' ? 'in review' : 'closed',
    at: pr.created_at,
  };
}

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
let cached; // one fetch per build, however many pages render the footer

export function getTickerData() {
  cached ??= Promise.all([
    settle(latestPR()),
    settle(gh('repos/Sprout-DevLabs/sprout/releases/latest').then((r) => r.tag_name)),
    settle(getLeetCodeStats(LEETCODE_USER).then((s) => s?.all ?? null)),
    settle(gh(`search/issues?q=${encodeURIComponent(`author:${USER} is:pr is:merged`)}&per_page=1`).then((r) => r.total_count)),
    settle(repoStats('Sprout-DevLabs/sprout')),
  ]).then(([pr, sprout, leetcode, mergedPRs, sproutStats]) => ({ pr, sprout, leetcode, mergedPRs, sproutStats }));
  return cached;
}
