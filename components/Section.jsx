// Content is visible immediately, including without JavaScript or on history navigation.
export default function Section({ id, title, note, children }) {
  return (
    <section id={id} className="px-6 sm:px-9 py-10 sm:py-14 border-t border-line/60 md:grid md:grid-cols-[140px_minmax(0,1fr)] md:gap-8">
      <div className="mb-6 md:mb-0">
        <div className="md:sticky md:top-10">
          <h2 className="font-head text-2xl font-bold tracking-tight">{title}</h2>
          {note && <p className="font-mono text-xs text-mute mt-2 leading-relaxed">{note}</p>}
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
