import LifeCanvas from './LifeCanvas';

const NAME = ['MANAS DASARI'];
const NAME_COMPACT = ['MANAS', 'DASARI'];

export default function HeroBanner() {
  return (
    <div className="relative w-full h-[clamp(340px,62svh,600px)] overflow-hidden cursor-crosshair bg-ink">
      <img src="pixel.gif" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.12] mix-blend-luminosity" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(157,123,255,0.14),transparent_60%)]" />
      <LifeCanvas lines={NAME} compactLines={NAME_COMPACT} />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-ink to-transparent pointer-events-none" />
    </div>
  );
}
