import LifeCanvas from './LifeCanvas';
import LifeTouchBar from './LifeTouchBar';

export default function HeroBanner() {
  return (
    <header id="top" className="relative w-full h-[clamp(260px,40svh,380px)] overflow-hidden cursor-crosshair bg-ink">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(43,179,177,0.16),transparent_65%)]" />
      <LifeCanvas />
      <LifeTouchBar />
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-ink via-ink/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none">
        <div className="max-w-5xl mx-auto px-6 sm:px-9 pb-5 sm:pb-7">
          <h1 className="rise font-head font-extrabold tracking-[-0.04em] leading-[0.9] text-[clamp(3rem,10vw,6.5rem)]">
            Manas Dasari
          </h1>
        </div>
      </div>
    </header>
  );
}
