import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/loops-api': {
        target: 'https://api.loops.so',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/loops-api/, ''),
      },
    },
  },
});
