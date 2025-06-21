import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: ['qksgkso8ws00k440k0o0w4ss.31.97.68.94.sslip.io']
  }
})
