// Data for the footer's LED ticker, fetched at build time (the site rebuilds
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

// Public push events no longer carry commit messages, so look the head commit up.
async function latestPush() {
  const events = await gh(`users/${USER}/events/public?per_page=30`);
  const push = events.find((e) => e.type === 'PushEvent');
  if (!push) return null;
  const commit = await gh(`repos/${push.repo.name}/commits/${push.payload.head}`);
  return { repo: push.repo.name, message: commit.commit.message.split('\n')[0].slice(0, 72), at: push.created_at };
}

const settle = (p) => p.catch(() => null);
let cached; // one fetch per build, however many pages render the footer

export function getTickerData() {
  cached ??= Promise.all([
    settle(latestPush()),
    settle(gh('repos/Sprout-DevLabs/sprout/releases/latest').then((r) => r.tag_name)),
    settle(getLeetCodeStats(LEETCODE_USER).then((s) => s?.all ?? null)),
  ]).then(([push, sprout, leetcode]) => ({ push, sprout, leetcode }));
  return cached;
}
