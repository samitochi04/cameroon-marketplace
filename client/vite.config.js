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
        // Remove leading slashes - Rollup will handle the base path
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  publicDir: 'public',
  // Copy locales to build output
  assetsInclude: ['**/*.json'],
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      // Return relative paths, Vite will handle the base
      if (filename.includes('locales')) {
        return '/locales/' + path.basename(filename)
      }
      // For assets, return with leading slash for absolute paths
      return '/' + filename
    }
  },
})