import LifeCanvas from './LifeCanvas';

export default function HeroBanner() {
  return (
    <div className="relative w-full h-[clamp(300px,52svh,520px)] overflow-hidden cursor-crosshair bg-ink">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(157,123,255,0.16),transparent_65%)]" />
      <LifeCanvas />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-ink to-transparent pointer-events-none" />
    </div>
  );
}
