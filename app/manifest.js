// Web app manifest: the name and the larger icons phones and search engines use.
export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: 'Manas Dasari',
    short_name: 'Manas',
    description: 'CS undergrad building developer tools and real-time web apps.',
    start_url: '/',
    display: 'browser',
    background_color: '#070B14',
    theme_color: '#070B14',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
