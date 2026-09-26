import { writing } from '@/lib/data';
import Section from './Section';

export default function Writing() {
  return (
    <Section id="writing" title="Writing">
      <ul className="list-none p-0 m-0">
        {writing.map((post) => (
          <li key={post.title} className="py-4 first:pt-0 border-b border-line last:border-none">
            <a href={post.href} className="group font-head text-lg font-semibold text-text hover:text-signal">
              {post.title}
              <span className="inline-block ml-2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">→</span>
            </a>
            <div className="text-mute text-sm mt-1 max-w-[62ch]">{post.meta}</div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
