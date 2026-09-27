import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy de developpement : les requetes /api du frontend sont transmises
// au backend Spring Boot (port 8080). Meme origine = zero probleme de CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
