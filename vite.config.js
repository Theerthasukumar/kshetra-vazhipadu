import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { templeApiPlugin } from './serverPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), templeApiPlugin()],
  server: {
    host: true,
    port: 5173
  }
})
