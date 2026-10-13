import { projects } from '@/lib/data';
import { getPosts } from '@/lib/posts';

export default function sitemap() {
  const base = 'https://www.algorithmicbit.tech';
  return [
    { url: `${base}/` },
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}/` })),
    ...getPosts().map((p) => ({ url: `${base}/writing/${p.slug}/` })),
  ];
}
