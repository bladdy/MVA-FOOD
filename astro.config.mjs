// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';



// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'server',
  adapter: vercel(),
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components'
      }
    }
  },
  server: {
    host: true,
    port: 4321,
  }

});
