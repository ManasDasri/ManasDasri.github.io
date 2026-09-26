import { writing } from '@/lib/data';
import SectionHeading from './SectionHeading';

export default function Writing() {
  return (
    <section id="writing" className="max-w-3xl mx-auto px-6 py-16">
      <SectionHeading>writing</SectionHeading>
      <ul className="list-none p-0 m-0">
        {writing.map((post) => (
          <li key={post.title} className="py-3.5 border-b border-line last:border-none">
            <a href={post.href} className="group font-semibold text-text hover:text-signal">
              {post.title}
              <span className="inline-block ml-2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">→</span>
            </a>
            <div className="text-mute text-sm italic mt-1">— {post.meta}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
