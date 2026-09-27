// Colony ⇄ URL. A shared link carries the rule plus the live cells inside
// their bounding box, bit-packed, deflated and base64url-encoded:
//   ?life=<rule>.<w>.<h>.<z|r><data>   (z = deflated, r = raw fallback)

const MAX_CELLS = 400 * 200;

const b64url = (bytes) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function pipe(bytes, Stream) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new Stream('deflate-raw'))).arrayBuffer());
}

export async function encode({ rule, cells }) {
  if (!cells.length) return `${rule}.0.0.r`;
  const xs = cells.map(([x]) => x), ys = cells.map(([, y]) => y);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const w = Math.max(...xs) - x0 + 1, h = Math.max(...ys) - y0 + 1;
  const bits = new Uint8Array(Math.ceil((w * h) / 8));
  for (const [x, y] of cells) {
    const i = (y - y0) * w + (x - x0);
    bits[i >> 3] |= 1 << (i & 7);
  }
  const packed = typeof CompressionStream === 'function' ? 'z' + b64url(await pipe(bits, CompressionStream)) : 'r' + b64url(bits);
  return `${rule}.${w}.${h}.${packed}`;
}

export async function decode(code) {
  const m = /^([a-z]+)\.(\d{1,4})\.(\d{1,4})\.([zr])([A-Za-z0-9_-]*)$/.exec(code ?? '');
  if (!m) return null;
  const [, rule, w, h, kind, data] = m;
  if (+w * +h > MAX_CELLS) return null; // a crafted link can't make us loop forever
  try {
    const raw = unb64url(data);
    const bits = kind === 'z' ? await pipe(raw, DecompressionStream) : raw;
    const cells = [];
    for (let i = 0; i < +w * +h; i++) if (bits[i >> 3] & (1 << (i & 7))) cells.push([i % +w, (i / +w) | 0]);
    return { rule, w: +w, h: +h, cells };
  } catch {
    return null;
  }
}

// Ask the banner for its cells, build the link, then share or copy it.
// Returns { url, how } where how is 'shared' | 'copied' | 'address bar'.
export async function shareColony() {
  let snapshot;
  window.dispatchEvent(new CustomEvent('life', { detail: { action: 'export', reply: (s) => (snapshot = s) } }));
  if (!snapshot) return null;
  const url = `${location.origin}/?life=${await encode(snapshot)}`;
  try {
    if (navigator.share && matchMedia('(hover: none)').matches) {
      await navigator.share({ title: 'A Game of Life colony', url });
      return { url, how: 'shared' };
    }
    await navigator.clipboard.writeText(url);
    return { url, how: 'copied' };
  } catch {
    history.replaceState(null, '', url);
    return { url, how: 'address bar' };
  }
}
