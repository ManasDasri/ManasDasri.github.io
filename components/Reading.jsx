import { reading } from '@/lib/data';
import Section from './Section';

const linkClass = 'text-text underline decoration-line underline-offset-4 hover:decoration-signal hover:text-signal transition-colors';

function Item({ r }) {
  const title = r.href ? (
    <a href={r.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {r.title}
    </a>
  ) : (
    <span className="text-text">{r.title}</span>
  );
  return (
    <li className="text-sm leading-relaxed">
      {title}
      {r.author && <span className="block font-mono text-[11px] text-mute mt-0.5">{r.author}</span>}
      {r.note && <span className="block text-mute mt-1">{r.note}</span>}
      {r.progress != null && (
        <span className="flex items-center gap-3 mt-2" aria-label={`${r.progress}% read`}>
          <span className="flex-1 h-1 rounded-full bg-line overflow-hidden">
            <span className="block h-full bg-signal" style={{ width: `${r.progress}%` }} />
          </span>
          <span className="font-mono text-[10px] text-mute">{r.progress}%</span>
        </span>
      )}
    </li>
  );
}

export default function Reading() {
  if (!reading.length) return null;
  const groups = [
    ['reading now', reading.filter((r) => r.kind === 'book')],
    // a fixed year: the site rebuilds hourly, so the build date would relabel this shelf on Jan 1
    ['read in 2026', reading.filter((r) => r.kind === 'read')],
    ['papers', reading.filter((r) => r.kind === 'paper')],
  ].filter(([, items]) => items.length);
  return (
    <Section id="reading" title="Reading" note="books I've finished this year, and papers worth your time">
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {groups.map(([label, items]) => (
          <div key={label}>
            <h3 className="font-mono text-xs text-signal mb-3">{label}</h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-4">
              {items.map((r) => (
                <Item key={r.title} r={r} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
