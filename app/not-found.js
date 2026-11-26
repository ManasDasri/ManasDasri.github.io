import SiteNav from '@/components/SiteNav';

export const metadata = { title: 'Page not found · Manas Dasari' };

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main id="main" className="max-w-3xl mx-auto min-h-screen px-6 sm:px-9 py-20 grid gap-12 content-center">
        <div className="max-w-[46ch]">
          <p className="font-mono text-xs text-signal">404</p>
          <h1 className="font-serif leading-[1] text-[clamp(2.8rem,7vw,4rem)] mt-3">
            Nothing on this map here.
          </h1>
          <p className="text-mute leading-relaxed mt-5">
            This address doesn’t lead anywhere any more. Start again from the homepage.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 font-mono text-sm">
            <a href="/" className="text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal">home</a>
            <a href="/projects/" className="text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal">projects</a>
            <a href="/writing/" className="text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal">writing</a>
          </div>
        </div>
      </main>
    </>
  );
}
