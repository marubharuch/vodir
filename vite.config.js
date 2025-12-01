import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// -----------------------------
// ⭐ Auto Version Generator
// -----------------------------
function generateBuildVersion() {
  const versionFile = path.resolve("build-version.txt");
  let buildNumber = 1;

  if (fs.existsSync(versionFile)) {
    const last = fs.readFileSync(versionFile, "utf8");
    buildNumber = parseInt(last) + 1;
  }

  fs.writeFileSync(versionFile, buildNumber.toString());

  const now = new Date();
  const timestamp =
    now.getFullYear() +
    "." +
    String(now.getMonth() + 1).padStart(2, "0") +
    "." +
    String(now.getDate()).padStart(2, "0");

  return `${timestamp}.${String(buildNumber).padStart(3, "0")}`;
}

// -----------------------------
// ⭐ SAFE VITE CONFIG
// -----------------------------
export default defineConfig({
  base: "/vodir/",

  define: {
    __APP_VERSION__: JSON.stringify(generateBuildVersion()),
  },

  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      // ⚠️ Correct for update popup
      registerType: "autoUpdate",
      injectRegister: "auto",

      // ⚠️ SAFE SETTINGS
      devOptions: {
        enabled: true,          // allow PWA in dev mode (safe)
      },

      workbox: {
        // Only cache required static files
        globPatterns: [
          "**/*.{js,css,html,svg,png,ico,webmanifest}"
        ],

        // ⭐ ALWAYS GET LATEST CODE FROM SERVER
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              url.pathname.endsWith(".js"),
            handler: "NetworkFirst",
            options: {
              cacheName: "js-cache",
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              url.pathname.endsWith(".css"),
            handler: "NetworkFirst",
            options: {
              cacheName: "css-cache",
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /\.(png|jpg|jpeg|svg|gif|webp)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: { maxEntries: 100 },
            },
          },
        ],
      },

      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],

      manifest: {
        name: "Visha Oshwal BVPV",
        short_name: "VO Dir",
        description:
          "Visha Oshwal Dir (Borsad, Valvod, Padara, Vatadara)",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/vodir/",

        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
