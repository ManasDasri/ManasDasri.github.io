import { log } from '@/lib/data';

const month = (d) => new Date(`${d}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

// Dated milestones on one line, newest on the left; scroll sideways for older ones.
export default function Timeline() {
  const months = [];
  for (const e of log.filter((e) => e.date !== 'upcoming')) {
    const last = months.at(-1);
    if (last?.date === e.date) last.items.push(e);
    else months.push({ date: e.date, items: [e] });
  }
  return (
    <section id="log" className="wrap section">
      <header className="section-head">
        <h2>Log</h2>
        <p>Dated milestones, newest first. Scroll sideways for older ones.</p>
      </header>
      <ol className="tl" tabIndex={0} aria-label="Milestones">
        {months.map((m) => (
          <li key={m.date} className="tl-month">
            <time dateTime={m.date}>{month(m.date)}</time>
            <ul>
              {m.items.map((e) => (
                <li key={e.title}>
                  {e.href ? (
                    <a href={e.href} {...(e.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{e.title}</a>
                  ) : (
                    <span>{e.title}</span>
                  )}
                  {e.note && <small>{e.note}</small>}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
