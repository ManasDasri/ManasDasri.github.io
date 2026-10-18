// Blog posts live in content/posts/<slug>.md and are read at build time.
// Front matter is simple "key: value" lines between --- fences.
// A line "::demo <name>" in the body marks where an interactive demo goes.
// "draft: true" posts are left out of the build unless SHOW_DRAFTS=1 (local preview).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

const DIR = join(process.cwd(), 'content/posts');

// Give each h2/h3 an id (for links and the table of contents) and collect them in order.
function withHeadingIds(segments) {
  const toc = [], used = new Set();
  const slugify = (t) => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  for (const seg of segments) {
    if (!seg.html) continue;
    seg.html = seg.html.replace(/<h([23])>(.*?)<\/h\1>/g, (_, level, inner) => {
      let id = slugify(inner) || 'section', n = 2;
      while (used.has(id)) id = `${slugify(inner)}-${n++}`;
      used.add(id);
      toc.push({ level: +level, id, text: inner.replace(/<[^>]+>/g, '') });
      return `<h${level} id="${id}">${inner}</h${level}>`;
    });
  }
  return toc;
}

function parse(slug) {
  const raw = readFileSync(join(DIR, `${slug}.md`), 'utf8');
  const [, fm, body] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = Object.fromEntries(fm.split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
  const segments = body
    .split(/^::demo\s+(\S+)\s*$/m)
    .map((part, i) => (i % 2 ? { demo: part } : { html: marked.parse(part) }));
  const toc = withHeadingIds(segments);
  return {
    slug,
    ...meta,
    tags: meta.tags ? meta.tags.split(',').map((t) => t.trim()) : [],
    readMins: Math.max(1, Math.round(body.split(/\s+/).length / 200)),
    segments,
    toc,
  };
}

export function getPosts() {
  return readdirSync(DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parse(f.replace(/\.md$/, '')))
    .filter((p) => p.draft !== 'true' || process.env.SHOW_DRAFTS === '1')
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const getPost = (slug) => getPosts().find((p) => p.slug === slug);
