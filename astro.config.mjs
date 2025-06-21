// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import svgr from 'vite-plugin-svgr';
import node from '@astrojs/node';



// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'server',
  //adapter: node({ mode: 'standalone' }), // Use this for docker production with Node.js
  adapter: vercel(), // Use this for deployment on Vercel
  vite: {
    plugins: [svgr()],
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@assets': '/src/assets',
        '@public': '/public',
      }
    }
  },
  server: {
    host: true,
    port: 4321,
  },
  devToolbar: {
    // Disable the developer toolbar
    enabled: false,
    // You can also modify other options here
  }

});
