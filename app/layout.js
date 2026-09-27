import './globals.css';
import { ScrollProgress } from '@/components/Effects';

const description =
  'CS undergrad at Amrita building developer tools and real-time web apps: Sprout, Flow, Atmos and Velora.';

export const metadata = {
  metadataBase: new URL('https://algorithmicbit.tech'),
  title: 'Manas Dasari',
  description,
  openGraph: { title: 'Manas Dasari', description, url: '/', siteName: 'Manas Dasari', type: 'website' },
  twitter: { card: 'summary_large_image', creator: '@ManasDmg9' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <ScrollProgress />
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
