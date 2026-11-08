import NowPlaying from './NowPlaying';
import VideoBanner from './VideoBanner';

// The banner: a looping black hole (VideoBanner) fading out before the name. Inside the content
// column so its edges line up with the page. data-video tells the dot field (Halftone.jsx) to
// leave the header to it.
export default function HeroBanner() {
  return (
    <header id="top" data-video className="relative z-[2] max-w-2xl mx-auto border-x border-dashed border-line/70 h-[clamp(260px,40svh,380px)] overflow-hidden">
      <VideoBanner />
      {/* rise sits on the wrapper: both it and the hover shimmer use `animation`, so on the
          same element un-hovering would replay the fade-in */}
      <div className="rise absolute inset-x-0 bottom-0 px-6 sm:px-9 pb-5 sm:pb-7">
        <h1 className="w-fit font-serif leading-[0.9] whitespace-nowrap text-[clamp(2.8rem,9.5vw,5.25rem)]">Manas Dasari</h1>
        <NowPlaying />
      </div>
    </header>
  );
}
