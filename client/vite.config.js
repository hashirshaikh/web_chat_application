import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
        credentials: true
      },
      '/broadcast': { target: 'http://localhost:3000', changeOrigin: true, credentials: true },
      '/leave-room': { target: 'http://localhost:3000', changeOrigin: true, credentials: true },
      '/generateCode': { target: 'http://localhost:3000', changeOrigin: true, credentials: true },
      '/create-room': { target: 'http://localhost:3000', changeOrigin: true, credentials: true },
      '/accept-code': { target: 'http://localhost:3000', changeOrigin: true, credentials: true },
      '/rooms': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        credentials: true
      },
      '/chats': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        credentials: true
      },
      '/auth/login': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        credentials: true
      },
      '/auth/register': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        credentials: true
      },
      '/auth/logout': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        credentials: true
      },
      '/auth/me': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        credentials: true
      },
      '/auth/update-username': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        credentials: true
      },
      '/auth/update-password': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        credentials: true
      }
    }
  }
})
