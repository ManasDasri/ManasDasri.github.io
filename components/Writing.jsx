import { writing } from '@/lib/data';

export default function Writing() {
  return (
    <section id="writing" className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="font-display text-sm text-signal mb-6">// writing</h2>
      <ul className="list-none p-0 m-0">
        {writing.map((post) => (
          <li key={post.title} className="py-3.5 border-b border-line last:border-none">
            <a href={post.href} className="font-semibold text-text hover:text-signal">
              {post.title}
            </a>
            <div className="text-mute text-sm italic mt-1">— {post.meta}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
