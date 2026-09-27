import { getPosts } from '@/lib/posts';
import Section from './Section';

const fmt = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export default function Writing() {
  return (
    <Section id="writing" title="Writing">
      <ul className="list-none p-0 m-0">
        {getPosts().map((post) => (
          <li key={post.slug} className="py-4 first:pt-0 border-b border-line">
            <a href={`/writing/${post.slug}/`} className="group font-head text-lg font-semibold text-text hover:text-signal">
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
        <li className="py-4 last:pb-0">
          <span className="font-head text-lg font-semibold text-mute">More posts in the works</span>
        </li>
      </ul>
    </Section>
  );
}
