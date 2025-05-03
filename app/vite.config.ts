import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Todas las peticiones que lleguen a /api/skyscanner/*
      // serán reenviadas a la API real
      '/api/skyscanner': {
        target: 'https://partners.api.skyscanner.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/skyscanner/, '/apiservices'),
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
