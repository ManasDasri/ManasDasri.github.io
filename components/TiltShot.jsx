'use client';

// A project's picture that comes alive under the pointer: it tilts toward it in 3D and springs
// back when the pointer leaves, the screenshot zooms and drifts against the tilt for depth, an
// accent light follows the pointer (Forme's spotlight card) and a comet of light runs round the
// edge (Forme's beam card), with one sheen of glare across the glass. Styled in
// app/globals.css (.shot); with reduced motion only the light stays.
export default function TiltShot({ children }) {
  const move = (e) => {
    const el = e.currentTarget, r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width).toFixed(3));
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height).toFixed(3));
  };
  const leave = (e) => {
    e.currentTarget.style.setProperty('--mx', 0.5);
    e.currentTarget.style.setProperty('--my', 0.5);
  };
  return (
    <span className="shot" onPointerMove={move} onPointerLeave={leave}>
      <span className="shot-tilt">
        <span className="shot-frame">
          {children}
          <span className="shot-glare" aria-hidden="true" />
        </span>
        <span className="shot-beam" aria-hidden="true" />
      </span>
    </span>
  );
}
