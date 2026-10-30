import { SITE, projects } from '@/lib/data';
import { getPosts } from '@/lib/posts';

export const dynamic = 'force-static';

export default function sitemap() {
  return [
    { url: `${SITE}/` },
    ...['projects', 'writing', 'reading'].map((p) => ({ url: `${SITE}/${p}/` })),
    ...projects.filter((p) => p.slug).map((p) => ({ url: `${SITE}/projects/${p.slug}/` })),
    ...getPosts().map((p) => ({ url: `${SITE}/writing/${p.slug}/`, lastModified: p.date })),
  ];
}
