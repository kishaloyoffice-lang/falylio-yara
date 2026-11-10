import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Falylio Yara — Dream • Create • Grow',
    short_name: 'FalylioYara',
    description:
      'All-in-One Digital Platform uniting Yara AI tools, 17-category online utilities, browser games, courses, software directory, and cloud workspace.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#060B19',
    theme_color: '#060B19',
    categories: ['productivity', 'utilities', 'education', 'entertainment'],
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
