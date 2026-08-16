import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const MOCK_API = 'http://127.0.0.1:8788'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.TCB_API_TARGET || MOCK_API
  const proxy = {
    '/api': { target: apiTarget, changeOrigin: true, secure: true },
    '/wall': { target: apiTarget, changeOrigin: true, secure: true }
  }

  if (apiTarget !== MOCK_API) {
    console.log(`[vite] API proxy → ${apiTarget}`)
  }

  return {
    plugins: [vue(), vueDevTools({ launchEditor: 'cursor' })],
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
      proxy
    },
    preview: {
      host: true,
      port: 4173,
      proxy
    }
  }
})
