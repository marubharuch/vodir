import fs from 'fs';
import path from 'path';

// Auto version generator
function generateBuildVersion() {
  const versionFile = path.resolve('build-version.txt');
  let buildNumber = 1;

  if (fs.existsSync(versionFile)) {
    const last = fs.readFileSync(versionFile, 'utf8');
    buildNumber = parseInt(last) + 1;
  }

  fs.writeFileSync(versionFile, buildNumber.toString());

  const now = new Date();
  const timestamp =
    now.getFullYear() +
    '.' +
    String(now.getMonth() + 1).padStart(2, '0') +
    '.' +
    String(now.getDate()).padStart(2, '0');

  return `${timestamp}.${String(buildNumber).padStart(3, '0')}`;
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// 🚀 FIXED & CLEAN CONFIG
export default defineConfig({
  base: '/vodir/',

  // ⭐ Correctly placed define block
  define: {
    __APP_VERSION__: JSON.stringify(generateBuildVersion())
  },

  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',

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

      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'apple-touch-icon.png'
      ],

      manifest: {
        name: 'Visha Oshwal BVPV',
        short_name: 'VO Dir',
        description: 'Visha Oshwal Dir (Borsad,Valvod,Padara,Vatadara)',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/vodir/',

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
});
