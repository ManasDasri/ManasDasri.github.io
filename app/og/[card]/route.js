import { projects } from '@/lib/data';
import { getPost, getPosts } from '@/lib/posts';
import { shareCard } from '@/lib/og/card';

// Share cards, built once per project and post: /og/project-<slug>.png, /og/post-<slug>.png.
// A route (not opengraph-image.js) so each file ends in .png: GitHub Pages picks the
// content type from the extension, and link previews ignore images it can't type.
export const dynamic = 'force-static';

const detailed = projects.filter((p) => p.slug);
const fmt = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export function generateStaticParams() {
  return [...detailed.map((p) => ({ card: `project-${p.slug}.png` })), ...getPosts().map((p) => ({ card: `post-${p.slug}.png` }))];
}

export function GET(_req, { params }) {
  const [, kind, slug] = params.card.match(/^(project|post)-(.+)\.png$/);
  if (kind === 'project') {
    const p = detailed.find((p) => p.slug === slug);
    return shareCard({
      kicker: `${p.kind ?? 'Project'} · ${p.status}`,
      title: p.name,
      subtitle: p.tagline,
      meta: p.tags.map((t) => t.label).join(' · '),
      path: `/projects/${p.slug}/`,
      badge: p.badge,
    });
  }
  const p = getPost(slug);
  return shareCard({
    kicker: 'Writing · Manas Dasari',
    title: p.title.replace(/:.*$/, ''),
    subtitle: p.summary,
    meta: `${fmt(p.date)} · ${p.readMins} min read`,
    path: `/writing/${p.slug}/`,
  });
}
