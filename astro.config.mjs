import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'

import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  site:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4321'
      : 'https://davidhuertas.dev',
  integrations: [tailwind(), react(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        dark: 'github-dark',
        light: 'github-light'
      }
    }
  }
})
