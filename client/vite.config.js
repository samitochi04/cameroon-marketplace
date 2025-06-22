import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  publicDir: 'public',
  // Copy locales to build output
  assetsInclude: ['**/*.json'],
  experimental: {
    renderBuiltUrl(filename) {
      if (filename.includes('locales')) {
        return '/locales/' + path.basename(filename)
      }
      return filename
    }
  },
})
