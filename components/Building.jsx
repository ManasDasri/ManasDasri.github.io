import { byRank, projects } from '@/lib/data';
import Section from './Section';
import TiltShot from './TiltShot';

// Selected work on the homepage: the featured projects as cards (a picture, what it is, and
// one line of evidence), then everything else as a list of names. The full list, with what
// each one is, lives at /projects/.
export default function Building() {
  const list = [...projects].sort(byRank);
  const cards = list.filter((p) => p.featured && p.screenshots?.length);
  const rest = list.filter((p) => !cards.includes(p));
  return (
    <Section id="building" title="Selected Work">
      <ul className="list-none p-0 m-0 grid gap-x-6 gap-y-10 sm:grid-cols-2">
        {cards.map((p) => (
          <li key={p.name}>
            <a href={`/projects/${p.slug}/`} className="group block no-underline">
              <TiltShot>
                <img src={p.screenshots[0].src} alt="" loading="lazy" />
              </TiltShot>
              <span className="block mt-3 font-mono text-[11px] text-mute">{p.kind}</span>
              <span
                className="block w-fit mt-1 font-serif text-2xl leading-tight text-text group-hover:text-signal transition-colors"
                style={{ viewTransitionName: `project-${p.slug}` }}
              >
                {p.name}
                <span aria-hidden="true" className="inline-block ml-2 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 motion-reduce:transition-none">
                  →
                </span>
              </span>
              <span className="block mt-1.5 text-sm leading-relaxed text-text/80">{p.tagline}</span>
              {p.proof && <span className="block mt-2 font-mono text-[11px] leading-relaxed text-signal/90">{p.proof}</span>}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-10 mb-0 font-mono text-xs text-mute leading-loose">
        also:{' '}
        {rest.map((p, i) => (
          <span key={p.name}>
            <a
              href={p.slug ? `/projects/${p.slug}/` : p.link}
              {...(p.slug ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              className="text-text/90 border-b border-dashed border-mute/50 hover:text-signal hover:border-signal no-underline"
            >
              {p.name}
            </a>
            {i < rest.length - 1 ? ' · ' : ''}
          </span>
        ))}
        {' · '}
        <a href="/projects/" className="hover:text-signal">every project, with what each one is →</a>
      </p>
    </Section>
  );
}
