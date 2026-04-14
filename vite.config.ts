import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze'
      ? visualizer({
          filename: 'docs/bundle-stats.html',
          gzipSize: true,
          brotliSize: true,
          template: 'treemap',
          open: false,
        })
      : null,
  ].filter(Boolean),
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    globals: true,
  },
  build: {
    sourcemap: mode === 'analyze',
    rollupOptions: {
      output: {
        manualChunks(moduleId) {
          if (
            moduleId.includes('react-markdown') ||
            moduleId.includes('highlight.js') ||
            moduleId.includes('RichMessageContent')
          ) {
            return 'markdown'
          }

          return undefined
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/gigachat/oauth': {
        target: 'https://ngw.devices.sberbank.ru:9443',
        changeOrigin: true,
        secure: false,
        rewrite: () => '/api/v2/oauth',
      },
      '/api/gigachat': {
        target: 'https://gigachat.devices.sberbank.ru',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/gigachat/, '/api/v1'),
      },
    },
  },
}))
