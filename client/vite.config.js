import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
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
        // Force absolute paths for all assets
        assetFileNames: '/assets/[name]-[hash][extname]',
        chunkFileNames: '/assets/[name]-[hash].js',
        entryFileNames: '/assets/[name]-[hash].js',
      },
    },
  },
  publicDir: 'public',
  // Copy locales to build output
  assetsInclude: ['**/*.json'],
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      // Always return absolute paths
      if (hostType === 'html') {
        return '/' + filename;
      }
      if (filename.includes('locales')) {
        return '/locales/' + path.basename(filename)
      }
      return '/' + filename
    }
  },
})
