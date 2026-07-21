export default function HeroBanner() {
  return (
    <div className="relative w-full h-[220px] sm:h-[260px] overflow-hidden bg-gradient-to-b from-[#0B0F1E] via-[#141B32] to-[#1B1F26]">
      {/* pixel gif backdrop — file expected at public/pixel.gif */}
      <img
        src="pixel.gif"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />

      {/* straight bottom edge — flat cutoff instead of the old wavy silhouette */}
      <div className="absolute bottom-0 left-0 w-full h-14 bg-ink" />

      {/* fade to page background at the bottom edge */}
      <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
}
