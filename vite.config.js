import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
    target: 'esnext',
  },
  server: {
    port: 5173,
    host: true,
  },  preview: {
    port: 4173,
    host: true,
    allowedHosts: ['.sslip.io', '.hostinger.com'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})