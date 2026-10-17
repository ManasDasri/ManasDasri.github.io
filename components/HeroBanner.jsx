import NowPlaying from './NowPlaying';
import Snowfall from './Snowfall';

// The header: Hiroshige's "Evening Snow at Kanbara" (public domain, The Met), framed
// in the content column so its edges line up with the page, with live snow falling
// over it and a dot-matrix clock printed in its corner. The name sits below the print.
const PRINT = 'https://www.metmuseum.org/art/collection/search/56915';

export default function HeroBanner() {
  return (
    <header id="top" className="max-w-5xl mx-auto border-x border-line/60">
      <figure className="m-0">
        <div className="relative overflow-hidden aspect-[2000/760]">
          <img
            src="/kanbara.jpg"
            srcSet="/kanbara-1000.jpg 1000w, /kanbara.jpg 2000w"
            sizes="(min-width: 1024px) 1024px, 100vw"
            alt="Hiroshige's woodblock print of travellers walking through a snowbound village at night, mountains behind"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover object-[50%_65%]"
          />
          <Snowfall density={0.0005} colour="rgb(255 255 255)" clock="rgb(38 44 66 / 0.42)" className="absolute inset-0 w-full h-full" />
        </div>
        <figcaption className="px-6 sm:px-9 pt-2 flex flex-wrap justify-between gap-x-4 font-mono text-[10px] text-mute">
          <span>
            Utagawa Hiroshige,{' '}
            <a href={PRINT} target="_blank" rel="noopener noreferrer" className="italic hover:text-signal">
              Evening Snow at Kanbara
            </a>
            , c. 1833–34
          </span>
          <span>The Met · public domain</span>
        </figcaption>
      </figure>
      {/* rise sits on the wrapper: both it and the hover shimmer use `animation`, so on the
          same element un-hovering would replay the fade-in */}
      <div className="rise px-6 sm:px-9 pt-8">
        <h1 className="shimmer w-fit font-head font-extrabold tracking-[-0.04em] leading-[0.9] text-[clamp(3rem,10vw,6.5rem)]">
          Manas Dasari
        </h1>
        <NowPlaying />
      </div>
    </header>
  );
}
