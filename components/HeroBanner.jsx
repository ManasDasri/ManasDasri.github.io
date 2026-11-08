import VideoBanner from './VideoBanner';
import NowPlaying from './NowPlaying';

// The banner: a looping black-and-white montage, inside the content column so its edges line up
// with the page, with the name over its foot.
export default function HeroBanner() {
  return (
    <header id="top" className="relative z-[2] max-w-2xl mx-auto border-x border-dashed border-line/70 h-[clamp(260px,40svh,380px)] overflow-hidden bg-ink">
      <VideoBanner />
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-ink from-25% via-ink/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none">
        {/* rise sits on the wrapper: both it and the hover shimmer use `animation`, so on the
            same element un-hovering would replay the fade-in */}
        <div className="rise px-6 sm:px-9 pb-5 sm:pb-7">
          <h1 className="pointer-events-auto w-fit font-serif leading-[0.9] whitespace-nowrap text-[clamp(2.8rem,9.5vw,5.25rem)]">
            Manas Dasari
          </h1>
          <NowPlaying />
        </div>
      </div>
    </header>
  );
}
