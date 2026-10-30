// Captures real sprout output on a clean clone of this repo for the terminal on Sprout's
// page (components/SproutTerminal.jsx). Needs sprout on PATH. Run from the repo root:
//   node scripts/sprout-demo.mjs
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const COMMANDS = [
  'tour --limit 6',
  '--entry',
  '-L 1',
  '--size -L 1 --sort size',
  '--churn -L 1',
  '--diff HEAD~3 -L 1',
  'dependents components/KoiPond.jsx',
  'impact components/Section.jsx',
  'context components/KoiPond.jsx --budget 300',
  '--ai --budget 300',
  '--version',
];

const dir = mkdtempSync(join(tmpdir(), 'sprout-demo-'));
const repo = join(dir, 'ManasDasri.github.io'); // the name sprout prints, as on GitHub
try {
  execSync(`git clone --quiet . ${repo}`);
  const run = (args) =>
    execSync(`sprout ${args}`, { cwd: repo, env: { ...process.env, NO_COLOR: '1' } })
      .toString()
      .replace(/\n+$/, '')
      .split('\n')
      // the clone's branch name is an accident of where this ran
      .filter((l) => !l.startsWith('git: on '));
  const out = Object.fromEntries(COMMANDS.map((c) => [`sprout ${c}`.trim(), run(c)]));
  writeFileSync('lib/sproutDemo.json', JSON.stringify(out, null, 1) + '\n');
  console.log(`captured ${COMMANDS.length} commands`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
