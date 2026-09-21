import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/aiusage_api': {
        target: 'https://api.juejin.cn',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
