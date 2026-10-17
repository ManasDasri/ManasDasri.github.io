import NowPlaying from './NowPlaying';
import PrintSky from './PrintSky';

// The header: Utagawa Hiroshige's "Moon over Takanawa" (1854; public domain, The Met),
// framed in the content column so its edges line up with the page, with stars
// twinkling in its sky, a halo around its moon and a dot-matrix clock in its corner.
// The name sits below the print.
const PRINT = 'https://www.metmuseum.org/art/collection/search/37084';

export default function HeroBanner() {
  return (
    <header id="top" className="max-w-5xl mx-auto border-x border-line/60">
      <figure className="m-0">
        <div className="relative overflow-hidden bg-[#4a4440] aspect-[2000/560] max-sm:aspect-[2000/860]">
          <img
            src="/takanawa.jpg"
            srcSet="/takanawa-1000.jpg 1000w, /takanawa.jpg 1735w"
            sizes="(min-width: 1024px) 1024px, 100vw"
            alt="Hiroshige's woodblock print of a full moon in a dark sky over Takanawa bay, sailing boats at anchor"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover object-[50%_0%]"
          />
          <PrintSky />
        </div>
        <figcaption className="px-6 sm:px-9 pt-1.5 flex flex-wrap justify-between gap-x-4 font-mono text-[10px] text-mute">
          <span>
            Utagawa Hiroshige,{' '}
            <a href={PRINT} target="_blank" rel="noopener noreferrer" className="italic hover:text-signal">
              Moon over Takanawa
            </a>
            , 1854
          </span>
          <span>The Met · public domain</span>
        </figcaption>
      </figure>
      {/* rise sits on the wrapper: both it and the hover shimmer use `animation`, so on the
          same element un-hovering would replay the fade-in */}
      <div className="rise px-6 sm:px-9 pt-6">
        <h1 className="shimmer w-fit font-head font-extrabold tracking-[-0.04em] leading-[0.9] text-[clamp(2.75rem,8vw,4.5rem)]">
          Manas Dasari
        </h1>
        <NowPlaying />
      </div>
    </header>
  );
}
