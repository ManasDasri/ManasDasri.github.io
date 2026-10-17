// node lib/lifeShare.test.mjs — round-trips colonies through the URL format.
import assert from 'node:assert/strict';
import { encode, decode } from './lifeShare.js';

const norm = (cells) => {
  const x0 = Math.min(...cells.map(([x]) => x)), y0 = Math.min(...cells.map(([, y]) => y));
  return cells.map(([x, y]) => `${x - x0},${y - y0}`).sort();
};

const glider = [[11, 20], [12, 21], [10, 22], [11, 22], [12, 22]];
const back = await decode(await encode({ rule: 'highlife', cells: glider }));
assert.equal(back.rule, 'highlife');
assert.deepEqual(norm(back.cells), norm(glider));

// a big random colony survives the trip and stays URL-sized
const soup = [];
for (let y = 0; y < 42; y++) for (let x = 0; x < 160; x++) if (Math.random() < 0.15) soup.push([x, y]);
const code = await encode({ rule: 'conway', cells: soup });
assert.deepEqual(norm((await decode(code)).cells), norm(soup));
assert.ok(code.length < 2000, `link too long: ${code.length}`);

assert.equal((await decode(await encode({ rule: 'conway', cells: [] }))).cells.length, 0);
assert.equal(await decode('conway.9.9.z!!'), null); // garbage in, null out
assert.equal(await decode('<script>'), null);
assert.equal(await decode('conway.9999.9999.r'), null); // oversized, rejected before decoding
console.log(`ok · soup link ${code.length} chars`);
