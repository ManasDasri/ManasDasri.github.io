import Section from './Section';

// A research project's case study: the question, the data, the results table, what held and
// what didn't, the limits, how to rerun it, and where every number comes from.
const TONE = { supported: 'text-signal border-signal/40', measured: 'text-text border-line' };
const link = 'text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal';

function List({ items }) {
  return (
    <ul className="list-none p-0 m-0 flex flex-col gap-2.5 max-w-[68ch]">
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-sm leading-relaxed text-text/90">
          <span className="mt-[7px] w-[7px] h-[7px] rounded-[1px] bg-mute/60 flex-shrink-0" aria-hidden="true" />
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function Study({ study: s }) {
  return (
    <>
      <Section id="question" title="The question">
        <p className="text-text/90 leading-relaxed max-w-[68ch] m-0">{s.question}</p>
        <h3 className="font-mono text-xs text-mute mt-8 mb-3">data</h3>
        <List items={s.data} />
      </Section>

      <Section id="results" title="Results" note={s.results.caption}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse font-mono">
            <thead>
              <tr>
                {s.results.columns.map((c) => (
                  <th key={c} scope="col" className="text-left text-[11px] font-normal text-mute border-b border-line py-2 pr-4 whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.results.rows.map((r) => (
                <tr key={r[0]} className="border-b border-line/60">
                  <th scope="row" className="text-left font-normal text-text py-2.5 pr-4">{r[0]}</th>
                  {r.length === 2 ? (
                    // a row with one note instead of numbers, e.g. a run still to come
                    <td colSpan={s.results.columns.length - 1} className="py-2.5 text-mute">{r[1]}</td>
                  ) : (
                    r.slice(1).map((v, i) => <td key={i} className="py-2.5 pr-4 text-text/80">{v}</td>)
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="font-mono text-xs text-mute mt-10 mb-4">what held, and what didn’t</h3>
        <ul className="list-none p-0 m-0 flex flex-col gap-4 max-w-[68ch]">
          {s.findings.map((f) => (
            <li key={f.text} className="text-sm leading-relaxed text-text/90">
              <span className={`inline-block font-mono text-[10px] uppercase tracking-wider border rounded px-1.5 py-0.5 mr-2 ${TONE[f.verdict] ?? 'text-mute border-line'}`}>{f.verdict}</span>
              {f.text}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="limitations" title="Limitations" note="what these results do not show">
        <List items={s.limitations} />
      </Section>

      <Section id="reproduce" title="Reproduce" note={`sources last checked ${s.reviewed}`}>
        <pre className="text-xs font-mono bg-paper border border-line rounded-md p-4 overflow-x-auto m-0">
          <code>{s.reproduce.join('\n')}</code>
        </pre>
        <ul className="list-none p-0 m-0 mt-6 flex flex-col gap-2 text-sm">
          {s.sources.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noopener noreferrer" className={link}>{l.label}</a>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
