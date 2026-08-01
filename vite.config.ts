import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    // 资源大于该值则拷贝为独立文件（图片/BGM 均走文件，保证加载性能）
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 800
  },
  server: {
    host: true,
    port: 5173,
    open: false,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8788', changeOrigin: true },
      '/wall': { target: 'http://127.0.0.1:8788', changeOrigin: true }
    }
  },
  preview: {
    host: true,
    port: 4173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8788', changeOrigin: true },
      '/wall': { target: 'http://127.0.0.1:8788', changeOrigin: true }
    }
  }
})
