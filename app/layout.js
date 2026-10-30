import './globals.css';
// fonts are self-hosted (no render-blocking trip to Google); same family names as before
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/bricolage-grotesque/latin-400.css';
import '@fontsource/bricolage-grotesque/latin-600.css';
import '@fontsource/bricolage-grotesque/latin-700.css';
import '@fontsource/bricolage-grotesque/latin-800.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/jetbrains-mono/latin-800.css';
import { ScrollProgress } from '@/components/Effects';
import { SITE, socials } from '@/lib/data';

// A title reached through a view transition already morphed in, so its rise stays off for
// good (a rule that only matched during the morph restarted it afterwards, a visible bounce).
const NO_RISE_AFTER_MORPH = `addEventListener('pagereveal',function(e){if(e.viewTransition){var s=new CSSStyleSheet();s.replaceSync('.morph{animation:none}');document.adoptedStyleSheets=document.adoptedStyleSheets.concat(s)}})`;

const description =
  'CS undergrad at Amrita building developer tools and real-time web apps: Sprout, Flow, Atmos and Velora.';

export const metadata = {
  metadataBase: new URL(SITE),
  // the home page's title in search results; other pages set their own
  title: 'Manas Dasari · Developer tools, real-time apps and fintech',
  description,
  alternates: { types: { 'application/rss+xml': [{ url: '/feed.xml', title: 'Manas Dasari · Writing' }] } },
  openGraph: { title: 'Manas Dasari', description, url: '/', siteName: 'Manas Dasari', type: 'website' },
  twitter: { card: 'summary_large_image', creator: '@ManasDmg9' },
};

// tells search engines who the site belongs to (and which profiles are the same person),
// and what to call the site in results: "Manas Dasari", not the domain ("Algorithmicbit")
const PERSON = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Person', '@id': `${SITE}/#me`, name: 'Manas Dasari', url: SITE, description, sameAs: socials.map((s) => s.href) },
    { '@type': 'WebSite', '@id': `${SITE}/#site`, name: 'Manas Dasari', alternateName: ['Manas', 'algorithmicbit'], url: `${SITE}/`, author: { '@id': `${SITE}/#me` } },
  ],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* several sections call GitHub's API as soon as they load */}
        <link rel="preconnect" href="https://api.github.com" crossOrigin="anonymous" />
        {/* page views via GoatCounter: no cookies, no personal data, so no consent banner */}
        <script data-goatcounter="https://manas049.goatcounter.com/count" async src="https://gc.zgo.at/count.js" />
        <script dangerouslySetInnerHTML={{ __html: NO_RISE_AFTER_MORPH }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PERSON }} />
      </head>
      <body className="font-body">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-signal focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-ink"
        >
          Skip to content
        </a>
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
