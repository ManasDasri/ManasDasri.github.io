import NowPlaying from './NowPlaying';
import PixelNight from './PixelNight';

// The header: a rainy pixel-art night city (components/PixelNight.jsx), framed in the
// content column so its edges line up with the page. The name sits below it.
export default function HeroBanner() {
  return (
    <header id="top" className="max-w-5xl mx-auto border-x border-line/60">
      <div className="relative overflow-hidden bg-[#0a0e27] aspect-[2000/560] max-sm:aspect-[2000/860]">
        <PixelNight />
      </div>
      {/* rise sits on the wrapper: both it and the hover shimmer use `animation`, so on the
          same element un-hovering would replay the fade-in */}
      <div className="rise px-6 sm:px-9 pt-7">
        <h1 className="shimmer w-fit font-head font-extrabold tracking-[-0.04em] leading-[0.9] text-[clamp(2.75rem,8vw,4.5rem)]">
          Manas Dasari
        </h1>
        <NowPlaying />
      </div>
    </header>
  );
}
