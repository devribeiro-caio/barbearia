import { defineConfig } from 'vite';

export default defineConfig({
  root: 'projeto-barbearia/frontend',
  publicDir: '../assets',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../../dist/frontend',
    emptyOutDir: true,
  },
});
