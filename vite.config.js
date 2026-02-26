import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Vercel friendly static build
export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
})