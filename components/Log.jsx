import { log } from '@/lib/data';
import Section from './Section';

const fmt = (d) =>
  d === 'upcoming'
    ? 'upcoming'
    : new Date(`${d}-01T00:00:00Z`).toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

function Entries({ entries }) {
  return (
      <ol className="list-none p-0 m-0 relative">
        {entries.map((e) => {
          const upcoming = e.date === 'upcoming';
          const title = e.href ? (
            <a
              href={e.href}
              {...(e.href.startsWith('/') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              className="text-text hover:text-signal transition-colors"
            >
              {e.title}
            </a>
          ) : (
            <span className="text-text">{e.title}</span>
          );
          return (
            <li key={e.title} className="relative pl-8 pb-6 last:pb-0 sm:grid sm:grid-cols-[88px_1fr] sm:gap-4">
              <span
                className={`absolute left-0 top-[7px] w-[11px] h-[11px] rounded-[2px] ${
                  upcoming ? 'border border-signal bg-ink' : 'bg-signal'
                }`}
                aria-hidden="true"
              />
              <time className="block font-mono text-xs text-mute pt-0.5 mb-1 sm:mb-0">{fmt(e.date)}</time>
              <div className="text-sm leading-relaxed">
                <div className="font-head text-base font-semibold">{title}</div>
                {e.note && <div className="text-mute">{e.note}</div>}
              </div>
            </li>
          );
        })}
      </ol>
  );
}

export default function Log() {
  return (
    <Section id="log" title="Log" note="Milestones, newest first.">
      <Entries entries={log.slice(0, 3)} />
      <details className="mt-5">
        <summary className="text-sm text-signal min-h-11">Earlier milestones</summary>
        <Entries entries={log.slice(3)} />
      </details>
    </Section>
  );
}
