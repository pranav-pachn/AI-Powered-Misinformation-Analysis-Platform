import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Avoid duplicate module instances when dependencies are hoisted to workspace root.
    dedupe: ['react', 'react-dom', '@react-three/fiber', 'three'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@react-three/fiber', 'three'],
  },
  server: {
    port: 5173,
    open: true,
    cors: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
})
