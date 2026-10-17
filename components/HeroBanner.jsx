import NightScene from './NightScene';
import NowPlaying from './NowPlaying';

export default function HeroBanner() {
  return (
    <header id="top" className="relative w-full h-[clamp(320px,52svh,480px)] overflow-hidden bg-ink">
      <NightScene />
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-ink to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none">
        {/* rise sits on the wrapper: both it and the hover shimmer use `animation`, so on the
            same element un-hovering would replay the fade-in */}
        <div className="rise max-w-5xl mx-auto px-6 sm:px-9 pb-5 sm:pb-7">
          <h1 className="shimmer pointer-events-auto w-fit font-head font-extrabold tracking-[-0.04em] leading-[0.9] text-[clamp(3rem,10vw,6.5rem)]">
            Manas Dasari
          </h1>
          <NowPlaying />
        </div>
      </div>
    </header>
  );
}
