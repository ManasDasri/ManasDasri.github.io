import Dock from './Dock';
import Footer from './Footer';
import CommandPalette from './CommandPalette';
import MarginArt from './MarginArt';

// An index page (projects, writing, reading): its margin scene, a way home, a big serif
// title, then the page's own content in the column.
export default function PageShell({ scene, title, intro, children }) {
  return (
    <>
      <MarginArt scene={scene} />
      <Dock />
      <main id="main" className="max-w-2xl mx-auto border-x border-dashed border-line/70 relative">
        <header className="px-6 sm:px-9 pt-10 pb-10">
          <a href="/" className="rise font-mono text-xs text-mute hover:text-signal">← home</a>
          <h1 className="rise font-serif text-[clamp(3.5rem,10vw,5rem)] leading-none mt-8" style={{ '--i': 1 }}>{title}</h1>
          {intro && <p className="rise text-mute leading-relaxed mt-5 max-w-[52ch]" style={{ '--i': 2 }}>{intro}</p>}
        </header>
        <div className="rise px-6 sm:px-9 pb-16" style={{ '--i': 3 }}>
          {children}
        </div>
        <Footer />
        <CommandPalette />
      </main>
    </>
  );
}
