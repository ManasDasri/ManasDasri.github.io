import NowPlaying from './NowPlaying';

// The banner: Magnus Atom's ASCII take on The Creation of Adam, embedded from Pinterest as-is
// (their card keeps the credit and the link back), with the name under it. The card's video
// is about 0.557 of its width tall, plus a fixed footer; a container query sizes the frame.
const PIN = '369365606970489071';

export default function HeroBanner() {
  return (
    <header id="top" className="relative z-[2] max-w-2xl mx-auto border-x border-dashed border-line/70 bg-ink px-6 sm:px-9 pt-6 pb-5 sm:pb-7">
      <div className="max-w-[600px] [container-type:inline-size]">
        <iframe
          src={`https://assets.pinterest.com/ext/embed.html?id=${PIN}`}
          title="The Creation of Adam's hands in ASCII: a process video by Magnus Atom, on Pinterest"
          scrolling="no"
          className="block w-full h-[calc(55.7cqw+110px)] border-0"
        />
      </div>
      {/* rise sits on the wrapper: both it and the hover shimmer use `animation`, so on the
          same element un-hovering would replay the fade-in */}
      <div className="rise mt-7">
        <h1 className="w-fit font-serif leading-[0.9] whitespace-nowrap text-[clamp(2.8rem,9.5vw,5.25rem)]">
          Manas Dasari
        </h1>
        <NowPlaying />
      </div>
    </header>
  );
}
