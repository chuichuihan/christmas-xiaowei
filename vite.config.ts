import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/music': {
        target: 'https://music-dl.sayqz.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/music/, '/api'),
      },
    },
  },
})
