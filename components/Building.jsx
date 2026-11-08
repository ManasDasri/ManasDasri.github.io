import { byRank, projects } from '@/lib/data';
import Section from './Section';

// Selected work on the homepage: just the names, research first, then engineering, each in
// its curated order (byRank), each linking to its page. The full list, with what each one
// is, lives at /projects/.
const isResearch = (p) => /research/i.test(p.kind ?? '');

export default function Building() {
  const list = [...projects].sort(byRank);
  const groups = [
    ['research', list.filter(isResearch)],
    ['engineering', list.filter((p) => !isResearch(p))],
  ];
  return (
    <Section id="building" title="Selected Work">
      <div className="grid gap-8 sm:grid-cols-2">
        {groups.map(([label, items]) => (
          <div key={label}>
            <h3 className="font-mono text-xs text-mute mb-3">{label}</h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {items.map((p) => (
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
          </div>
        ))}
      </div>
      <a href="/projects/" className="inline-block mt-8 font-mono text-xs text-mute hover:text-signal">
        all projects, with what each one is →
      </a>
    </Section>
  );
}
