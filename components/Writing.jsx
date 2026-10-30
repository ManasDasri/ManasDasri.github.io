import { getPosts } from '@/lib/posts';
import Section from './Section';

const fmt = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// every post, newest first: title, date, reading time and summary
export function PostList() {
  return (
    <ul className="list-none p-0 m-0">
      {getPosts().map((post) => (
        <li key={post.slug} className="py-4 first:pt-0 border-b border-line">
          <a href={`/writing/${post.slug}/`} className="group font-serif text-2xl leading-tight text-text hover:text-signal">
            <span className="inline-block" style={{ viewTransitionName: `post-${post.slug}` }}>
              {post.title}
            </span>
            <span className="inline-block ml-2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">→</span>
          </a>
          <div className="font-mono text-xs text-mute mt-1">
            {fmt(post.date)} · {post.readMins} min read
            {post.segments.some((s) => s.demo) && <span className="text-signal"> · interactive</span>}
          </div>
          <div className="text-mute text-sm mt-1.5 max-w-[62ch]">{post.summary}</div>
        </li>
      ))}
      <li className="pt-4 font-mono text-xs text-mute">more posts in the works · <a href="/feed.xml" className="hover:text-signal">follow via RSS</a></li>
    </ul>
  );
}

export default function Writing() {
  return (
    <Section id="writing" title="Writing">
      <PostList />
      <a href="/writing/" className="inline-block mt-6 font-mono text-xs text-mute hover:text-signal">
        all writing →
      </a>
    </Section>
  );
}
