import Scramble from './Scramble';

// Notebook layout: the title sits in a sticky left margin, content on the right.
export default function Section({ id, title, note, children }) {
  return (
    <section id={id} className="px-6 sm:px-9 py-14 sm:py-20 border-t border-line/60 md:grid md:grid-cols-[170px_1fr] md:gap-10">
      <div className="mb-7 md:mb-0">
        <div className="md:sticky md:top-12">
          <h2 className="font-head text-xl font-bold text-text tracking-tight">
            <Scramble text={title} trigger="view" />
          </h2>
          {note && <p className="font-mono text-xs text-mute mt-1.5 leading-relaxed">{note}</p>}
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
