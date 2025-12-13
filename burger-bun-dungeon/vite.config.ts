import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for itch.io compatibility
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Reduce upload size
    rollupOptions: {
      output: {
        // Single bundle - no code splitting for itch.io
        inlineDynamicImports: true,
        manualChunks: undefined
      }
    }
  }
})
