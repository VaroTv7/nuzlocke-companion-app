import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8085,
    host: true, // Listen on all addresses
    strictPort: true, // Fail if port is in use
  }
})
