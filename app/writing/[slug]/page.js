import { notFound } from 'next/navigation';
import { getPost, getPosts } from '@/lib/posts';
import Dock from '@/components/Dock';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import GradientDescent from '@/components/demos/GradientDescent';
import SproutTerminal from '@/components/SproutTerminal';

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

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const p = getPost(params.slug);
  return {
    title: `${p.title} · Manas Dasari`,
    description: p.summary,
    openGraph: { type: 'article', title: p.title, description: p.summary, publishedTime: p.date },
  };
}

export default function PostPage({ params }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <Dock />
      <main id="main" className="max-w-5xl mx-auto border-x border-line/60 relative">
        <article className="px-6 sm:px-9 pt-12 pb-16">
          <a href="/#writing" className="font-mono text-xs text-mute hover:text-signal">
            ← all writing
          </a>
          <header className="mt-8 mb-10 max-w-[68ch]">
            <p className="font-mono text-xs text-mute">
              {fmt(post.date)} · {post.readMins} min read
            </p>
            <h1 style={{ viewTransitionName: `post-${post.slug}` }} className="rise font-head font-extrabold tracking-[-0.03em] leading-[0.95] text-[clamp(2.4rem,6vw,4rem)] mt-3">
              {post.title}
            </h1>
            <p className="text-mute leading-relaxed mt-5">{post.summary}</p>
            <div className="flex flex-wrap gap-2 mt-5">
              {post.tags.map((t) => (
                <span key={t} className="font-mono text-xs text-accent bg-accent/10 rounded px-2 py-1">
                  {t}
                </span>
              ))}
            </div>
          </header>

          <div className="max-w-[68ch]">
            {post.segments.map((s, i) => {
              if (s.html) return <div key={i} className="post-body" dangerouslySetInnerHTML={{ __html: s.html }} />;
              const Demo = DEMOS[s.demo];
              return Demo ? <Demo key={i} /> : null;
            })}
          </div>

          {post.original && (
            <p className="font-mono text-xs text-mute mt-12 pt-6 border-t border-line max-w-[68ch]">
              Also published on{' '}
              <a href={post.original} target="_blank" rel="noopener noreferrer" className="text-signal underline underline-offset-4">
                daily.dev
              </a>
              .
            </p>
          )}
        </article>

        <Footer />
        <CommandPalette />
      </main>
    </>
  );
}
