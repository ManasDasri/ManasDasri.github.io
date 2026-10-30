import Dock from '@/components/Dock';
import LostKoi from '@/components/LostKoi';
import MarginArt from '@/components/MarginArt';

export const metadata = { title: 'Page not found · Manas Dasari' };

export default function NotFound() {
  return (
    <>
      <MarginArt scene="mountains" />
      <Dock />
      <main id="main" className="max-w-2xl mx-auto border-x border-dashed border-line/70 min-h-screen px-6 sm:px-9 py-20 grid gap-12 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-[46ch]">
          <p className="font-mono text-xs text-signal">404</p>
          <h1 className="font-serif leading-[1] text-[clamp(2.8rem,7vw,4rem)] mt-3">
            This page swam off.
          </h1>
          <p className="text-mute leading-relaxed mt-5">
            Nothing lives at this address any more. The koi is still looking for it; you might have more luck from
            the homepage.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 font-mono text-sm">
            <a href="/" className="text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal">home</a>
            <a href="/projects/" className="text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal">projects</a>
            <a href="/#writing" className="text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal">writing</a>
          </div>
        </div>
        <LostKoi />
      </main>
    </>
  );
}
