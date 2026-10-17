import NowPlaying from './NowPlaying';
import PrintFireworks from './PrintFireworks';

// The header: Kobayashi Kiyochika's "Fireworks at Ikenohata" (1881; public domain, The
// Met), framed in the content column so its edges line up with the page, with new
// fireworks bursting over it and a dot-matrix clock in its corner. The name sits below.
const PRINT = 'https://www.metmuseum.org/art/collection/search/712976';

export default function HeroBanner() {
  return (
    <header id="top" className="max-w-5xl mx-auto border-x border-line/60">
      <figure className="m-0">
        <div className="relative overflow-hidden bg-[#26313a] aspect-[2000/560] max-sm:aspect-[2000/860]">
          <img
            src="/ikenohata.jpg"
            srcSet="/ikenohata-1000.jpg 1000w, /ikenohata.jpg 2000w"
            sizes="(min-width: 1024px) 1024px, 100vw"
            alt="Kiyochika's woodblock print of fireworks over a dark pond at night, red lanterns strung across and a crowd in silhouette"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover object-[50%_27%]"
          />
          <PrintFireworks />
        </div>
        <figcaption className="px-6 sm:px-9 pt-1.5 flex flex-wrap justify-between gap-x-4 font-mono text-[10px] text-mute">
          <span>
            Kobayashi Kiyochika,{' '}
            <a href={PRINT} target="_blank" rel="noopener noreferrer" className="italic hover:text-signal">
              Fireworks at Ikenohata
            </a>
            , 1881
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
