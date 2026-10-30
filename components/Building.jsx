import { projects } from '@/lib/data';
import Section from './Section';

// Selected work on the homepage: just the names, newest first with the featured one leading,
// each linking to its page. The full list, with what each one is, lives at /projects/.
export default function Building() {
  const list = [...projects].sort((a, b) => (b.featured ?? 0) - (a.featured ?? 0) || (b.started ?? '').localeCompare(a.started ?? ''));
  return (
    <Section id="building" title="Selected Work">
      <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
        {list.map((p) => (
          <li key={p.name}>
            <a
              href={p.slug ? `/projects/${p.slug}/` : p.link}
              {...(p.slug ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              className="text-lg text-text no-underline border-b border-dashed border-mute/50 hover:text-signal hover:border-signal transition-colors"
              style={p.slug ? { viewTransitionName: `project-${p.slug}` } : undefined}
            >
              {p.name}
            </a>
          </li>
        ))}
      </ul>
      <a href="/projects/" className="inline-block mt-8 font-mono text-xs text-mute hover:text-signal">
        all projects, with what each one is →
      </a>
    </Section>
  );
}
