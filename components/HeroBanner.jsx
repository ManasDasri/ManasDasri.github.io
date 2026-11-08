import NowPlaying from './NowPlaying';

// The banner: no picture of its own; the homepage's dot field (Halftone.jsx) shows through it
// and fades out before the name. Inside the content column so its edges line up with the page.
export default function HeroBanner() {
  return (
    <header id="top" className="relative z-[2] max-w-2xl mx-auto border-x border-dashed border-line/70 h-[clamp(240px,34svh,320px)]">
      {/* rise sits on the wrapper: both it and the hover shimmer use `animation`, so on the
          same element un-hovering would replay the fade-in */}
      <div className="rise absolute inset-x-0 bottom-0 px-6 sm:px-9 pb-5 sm:pb-7">
        <h1 className="w-fit font-serif leading-[0.9] whitespace-nowrap text-[clamp(2.8rem,9.5vw,5.25rem)]">Manas Dasari</h1>
        <NowPlaying />
      </div>
    </header>
  );
}
