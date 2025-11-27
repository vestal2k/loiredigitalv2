import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import sanity from '@sanity/astro'
import vercel from '@astrojs/vercel'
import { fileURLToPath } from 'url'

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    sanity({
      projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id',
      dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
      useCdn: true,
      apiVersion: '2025-01-01',
    }),
  ],
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  site: 'https://loiredigital.fr',
  image: {
    // Optimize images automatically
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
  },
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
})
