import './globals.css';
import { CursorGlow, ScrollProgress } from '@/components/Effects';

// Skip the boot screen after the first view in a session (runs before paint).
const BOOT_ONCE = `try{if(sessionStorage.getItem('booted'))document.documentElement.dataset.booted='1';sessionStorage.setItem('booted','1')}catch(e){}`;

const BOOT_LINES = [
  '[ ok ] mounting /home/manas',
  '[ ok ] loading projects: flow, atmos, sprout',
  '[ ok ] linking socials',
  '[ ok ] seeding game of life',
  '> welcome.',
];

export const metadata = {
  title: 'Manas — Personal Portfolio',
  description:
    'Manas — CS undergrad, engineer, fintech enthusiast, artist, and writer. Building Flow and other projects.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_ONCE }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <div className="boot" aria-hidden="true">
          {BOOT_LINES.map((l, i) => (
            <div key={l} style={{ animationDelay: `${i * 0.18}s` }}>
              {l}
            </div>
          ))}
        </div>
        <ScrollProgress />
        <CursorGlow />
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
