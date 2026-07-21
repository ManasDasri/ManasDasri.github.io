import './globals.css';

export const metadata = {
  title: 'Manas — Personal Portfolio',
  description:
    'Manas — CS undergrad, engineer, fintech enthusiast, artist, and writer. Building Flow and other projects.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
