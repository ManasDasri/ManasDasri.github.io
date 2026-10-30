import { notFound } from 'next/navigation';
import { getPost, getPosts } from '@/lib/posts';
import Dock from '@/components/Dock';
import MarginArt from '@/components/MarginArt';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import GradientDescent from '@/components/demos/GradientDescent';
import SproutTerminal from '@/components/SproutTerminal';
import CodeCopy from '@/components/CodeCopy';

// "::demo <name>" in a post renders the matching component
const DEMOS = {
  'gradient-descent': GradientDescent,
  'sprout-entry': () => (
    <div className="not-prose my-8">
      <SproutTerminal embedded greet="sprout --entry" />
    </div>
  ),
};

const fmt = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// the post's headings, h3s indented under h2s
function Toc({ toc }) {
  return (
    <ol className="list-none p-0 m-0 mt-2 flex flex-col gap-1.5">
      {toc.map((h) => (
        <li key={h.id} className={h.level === 3 && toc.some((t) => t.level === 2) ? 'pl-3' : ''}>
          <a href={`#${h.id}`} className="font-mono text-xs text-mute hover:text-signal no-underline leading-snug">
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const p = getPost(params.slug);
  return {
    title: `${p.title} · Manas Dasari`,
    description: p.summary,
    openGraph: {
      type: 'article',
      title: p.title,
      description: p.summary,
      publishedTime: p.date,
      url: `/writing/${p.slug}/`,
      images: [{ url: `/og/post-${p.slug}.png`, width: 1200, height: 630, alt: p.title }],
    },
    twitter: { card: 'summary_large_image', images: [`/og/post-${p.slug}.png`] },
  };
}

export default function PostPage({ params }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  // posts are newest first: the previous one is newer, the next one older
  const all = getPosts(), i = all.findIndex((p) => p.slug === post.slug);
  const newer = all[i - 1], older = all[i + 1];
  const showToc = post.toc.length >= 3;

  return (
    <>
      <MarginArt scene="mountains" />
      <Dock />
      <main id="main" className="max-w-2xl mx-auto border-x border-dashed border-line/70 relative">
        <article className="px-6 sm:px-9 pt-12 pb-16">
          <a href="/writing/" className="rise font-mono text-xs text-mute hover:text-signal">
            ← all writing
          </a>
          <header className="mt-8 mb-10 max-w-[68ch]">
            <p className="rise font-mono text-xs text-mute" style={{ '--i': 1 }}>
              {fmt(post.date)} · {post.readMins} min read
            </p>
            <h1 style={{ viewTransitionName: `post-${post.slug}`, '--i': 2 }} className="rise morph font-serif leading-[1.02] text-[clamp(2.6rem,7vw,4rem)] mt-3">
              {post.title}
            </h1>
            <p className="rise text-mute leading-relaxed mt-5" style={{ '--i': 3 }}>{post.summary}</p>
            <div className="rise flex flex-wrap gap-2 mt-5" style={{ '--i': 4 }}>
              {post.tags.map((t) => (
                <span key={t} className="font-mono text-xs text-accent bg-accent/10 rounded px-2 py-1">
                  {t}
                </span>
              ))}
            </div>
          </header>

          <div className="max-w-[68ch] min-w-0">
            {showToc && (
              <details className="mb-8 rounded-md border border-line bg-paper px-4 py-3">
                <summary className="font-mono text-xs text-mute cursor-pointer">on this page</summary>
                <Toc toc={post.toc} />
              </details>
            )}
            {post.segments.map((s, i) => {
              if (s.html) return <div key={i} className="post-body" dangerouslySetInnerHTML={{ __html: s.html }} />;
              const Demo = DEMOS[s.demo];
              return Demo ? <Demo key={i} /> : null;
            })}
          </div>
          <CodeCopy />

          {post.original && (
            <p className="font-mono text-xs text-mute mt-12 pt-6 border-t border-line max-w-[68ch]">
              Also published on{' '}
              <a href={post.original} target="_blank" rel="noopener noreferrer" className="text-signal underline underline-offset-4">
                daily.dev
              </a>
              .
            </p>
          )}
          {(newer || older) && (
            <nav aria-label="More writing" className="grid gap-4 sm:grid-cols-2 mt-14 pt-8 border-t border-line max-w-[68ch]">
              {older ? (
                <a href={`/writing/${older.slug}/`} className="group no-underline">
                  <span className="font-mono text-xs text-mute">← older</span>
                  <span className="block font-head text-lg font-semibold text-text group-hover:text-signal transition-colors mt-1">{older.title}</span>
                </a>
              ) : <span />}
              {newer && (
                <a href={`/writing/${newer.slug}/`} className="group no-underline sm:text-right">
                  <span className="font-mono text-xs text-mute">newer →</span>
                  <span className="block font-head text-lg font-semibold text-text group-hover:text-signal transition-colors mt-1">{newer.title}</span>
                </a>
              )}
            </nav>
          )}
        </article>

        <Footer />
        <CommandPalette />
      </main>
    </>
  );
}
