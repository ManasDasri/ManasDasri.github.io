import './globals.css';
import { ScrollProgress } from '@/components/Effects';
import Daylight from '@/components/Daylight';
import Entrance from '@/components/Entrance';
import { PALETTE_SCRIPT } from '@/lib/daylight';

// Runs before paint: the entrance plays once per visit, not on every page. It hides
// the overlay with a constructable stylesheet: those live outside the DOM, so React's
// hydration of <html> can't undo them (a data attribute on <html> got wiped).
const ENTRANCE_ONCE = `try{if(sessionStorage.getItem('entered')){var s=new CSSStyleSheet();s.replaceSync('.entrance{display:none}');document.adoptedStyleSheets=document.adoptedStyleSheets.concat(s)}sessionStorage.setItem('entered','1')}catch(e){}`;

const description =
  'CS undergrad at Amrita building developer tools and real-time web apps: Sprout, Flow, Atmos and Velora.';

export const metadata = {
  metadataBase: new URL('https://www.algorithmicbit.tech'), // canonical host; the bare domain 301s here
  title: 'Manas Dasari',
  description,
  openGraph: { title: 'Manas Dasari', description, url: '/', siteName: 'Manas Dasari', type: 'website' },
  twitter: { card: 'summary_large_image', creator: '@ManasDmg9' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ENTRANCE_ONCE }} />
        <script dangerouslySetInnerHTML={{ __html: PALETTE_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-signal focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-ink"
        >
          Skip to content
        </a>
        <Entrance />
        <Daylight />
        <ScrollProgress />
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
