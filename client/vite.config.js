import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('d3') || id.includes('recharts') || id.includes('react-force-graph')) {
              return 'vendor-charts';
            }
            if (id.includes('bootstrap')) {
              return 'vendor-bootstrap';
            }
            return 'vendor-other';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})