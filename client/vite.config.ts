import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Make sure environment variables are available
    'process.env': process.env,
  },
  server: {
    // For local development
    proxy: {
      // Optionally proxy API calls during development
      // '/api': {
      //   target: 'http://localhost:3000',
      //   changeOrigin: true,
      // }
    }
  }
})
