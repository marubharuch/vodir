import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/vodir/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',

      // ✔ Fresh content always
      // ✔ Install button will work
      // ✔ Does NOT block PWA detection
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 24 * 60 * 60
              }
            }
          }
        ]
      },

      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],

      manifest: {
        name: 'Visha Oshwal BVPV',
        short_name: 'VO Dir',
        description: 'Visha Oshwal Dir (Borsad,Valvod,Padara,Vatadara)',
        theme_color: '#ffffff',
        display: 'standalone',
        start_url: '/vodir/',
        background_color: '#ffffff',

        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
