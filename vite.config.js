import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { r2DevServerPlugin } from './src/server/r2Plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    r2DevServerPlugin()
  ],
})
