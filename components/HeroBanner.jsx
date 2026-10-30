import PondBanner from './PondBanner';
import NowPlaying from './NowPlaying';

// The pond-surface banner, inside the content column so its edges line up with the page.
export default function HeroBanner() {
  return (
    <header id="top" className="relative z-[2] max-w-2xl mx-auto border-x border-dashed border-line/70 h-[clamp(260px,40svh,380px)] overflow-hidden cursor-crosshair bg-ink">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(var(--c-mature)_/_0.16),transparent_65%)]" />
      <PondBanner />
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-ink via-ink/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none">
        {/* rise sits on the wrapper: both it and the hover shimmer use `animation`, so on the
            same element un-hovering would replay the fade-in */}
        <div className="rise px-6 sm:px-9 pb-5 sm:pb-7">
          <h1 className="pointer-events-auto w-fit font-serif leading-[0.9] text-[clamp(3.5rem,11vw,6rem)]">
            Manas Dasari
          </h1>
          <NowPlaying />
        </div>
      </div>
    </header>
  );
}
