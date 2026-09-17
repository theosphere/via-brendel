import { defineConfig } from 'vite';

export default defineConfig({
  base: '/via-brendel/', // served from a GitHub Pages project path, not the domain root
  server: {
    host: true, // bind to all interfaces so a phone on the same Wi-Fi can reach it
  },
});
