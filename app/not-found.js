import Dock from '@/components/Dock';
import Diehard from '@/components/Diehard';

export const metadata = { title: 'Page not found · Manas Dasari' };

export default function NotFound() {
  return (
    <>
      <Dock />
      <main id="main" className="max-w-5xl mx-auto border-x border-line/60 min-h-screen px-6 sm:px-9 py-20 grid gap-12 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-[46ch]">
          <p className="font-mono text-xs text-signal">404</p>
          <h1 className="font-head font-extrabold tracking-[-0.03em] leading-[0.95] text-[clamp(2.4rem,6vw,4rem)] mt-3">
            This page didn’t survive.
          </h1>
          <p className="text-mute leading-relaxed mt-5">
            The pattern on the right is <em className="text-text">Diehard</em>: seven cells that live for exactly 130
            generations and then disappear completely. Whatever was at this address went the same way.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 font-mono text-sm">
            <a href="/" className="text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal">home</a>
            <a href="/#building" className="text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal">projects</a>
            <a href="/#writing" className="text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal">writing</a>
          </div>
        </div>
        <Diehard />
      </main>
    </>
  );
}
