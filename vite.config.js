import { defineConfig } from 'vite';

export default defineConfig({
  base: '/fitness-tracker/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        dashboard: './dashboard.html'
      }
    }
  }
});