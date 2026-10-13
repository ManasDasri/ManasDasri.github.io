import { SITE } from '@/lib/data';
import { getPosts } from '@/lib/posts';

// RSS for the writing section, built once at export time.
export const dynamic = 'force-static';

const esc = (s = '') => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function GET() {
  const items = getPosts()
    .map((p) => {
      const url = `${SITE}/writing/${p.slug}/`;
      return `<item><title>${esc(p.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate><description>${esc(p.summary)}</description></item>`;
    })
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Manas Dasari · Writing</title><link>${SITE}/</link><description>Notes on developer tools, open source and machine learning.</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
