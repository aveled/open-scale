import type { MetadataRoute } from 'next';



export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'open scale',
        short_name: 'open scale',
        description: 'open scale',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#eab5b5',
        icons: [
            {
                'src': '/favicon.ico/web-app-manifest-192x192.png',
                'sizes': '192x192',
                'type': 'image/png',
                'purpose': 'maskable'
            },
            {
                'src': '/favicon.ico/web-app-manifest-512x512.png',
                'sizes': '512x512',
                'type': 'image/png',
                'purpose': 'maskable'
            }
        ],
    }
}
