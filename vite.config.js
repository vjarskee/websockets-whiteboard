import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/client')
    },
    extensions: ['.js', '.vue']
  },

  base: '',

  root: resolve(process.cwd(), 'src', 'client'),

  build: {
    outDir: resolve(process.cwd(), 'dist', 'client')
  },
  plugins: [vue()],

  server: {
    proxy: {
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  }
})
