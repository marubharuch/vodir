import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/vodir/', // must match your GitHub repo name
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Vodir App',
        short_name: 'Vodir',
        description: 'A Progressive Web App hosted on GitHub Pages',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        start_url: '/vodir/',
        scope: '/vodir/',
        display: 'standalone',
        icons: [
          {
            src: '/vodir/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/vodir/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
