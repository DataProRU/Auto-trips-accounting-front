import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/tg_bot_add?username=',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Garage Shop',
        short_name: 'Garage',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        description: 'Garage Shop App',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
