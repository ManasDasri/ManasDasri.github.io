// A human hand and a robot hand reaching for each other (after Michelangelo's
// Creation of Adam). The image is split at the gap between the fingertips into
// two layers that drift toward each other and back; a spark glows in the gap.
// `screen` blending drops the image's black background into the page.
const GAP_X = 47; // fingertip gap, % across the image
const GAP_Y = 53; // and % down

export default function CreationHands() {
  const half = 'absolute inset-0 w-full h-full mix-blend-screen select-none';
  return (
    <figure className="group relative mx-auto w-full max-w-[600px] m-0">
      <div
        className="relative aspect-[534/156]"
        // the arms are cut off at the image edges; fade them in from the dark instead
        style={{ maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)' }}
      >
        <div className="hands-left absolute inset-0 transition-transform duration-700 ease-out group-hover:translate-x-2">
          <img src="/creation-hands.jpg" alt="" className={half} style={{ clipPath: `inset(0 ${100 - GAP_X}% 0 0)` }} />
        </div>
        <div className="hands-right absolute inset-0 transition-transform duration-700 ease-out group-hover:-translate-x-2">
          <img src="/creation-hands.jpg" alt="" className={half} style={{ clipPath: `inset(0 0 0 ${GAP_X}%)` }} />
        </div>
        <span
          className="hands-spark absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700"
          style={{
            left: `${GAP_X}%`,
            top: `${GAP_Y}%`,
            background: 'radial-gradient(circle, rgba(230,244,241,0.95) 0%, rgba(124,245,228,0.45) 25%, transparent 65%)',
          }}
          aria-hidden="true"
        />
      </div>
      <figcaption className="sr-only">Two hands reaching for each other, a spark between their fingertips</figcaption>
    </figure>
  );
}
