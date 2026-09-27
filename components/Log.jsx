import { log } from '@/lib/data';
import Section from './Section';

const fmt = (d) =>
  d === 'upcoming'
    ? 'upcoming'
    : new Date(`${d}-01T00:00:00Z`).toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function Log() {
  return (
    <Section id="log" title="Log" note="dated milestones, newest first">
      <ol className="list-none p-0 m-0 relative">
        <span className="absolute left-[5px] top-2 bottom-2 w-px bg-line" aria-hidden="true" />
        {log.map((e) => {
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
    </Section>
  );
}
