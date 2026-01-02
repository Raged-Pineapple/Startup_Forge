import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/connections': 'http://localhost:3000',
      '/inbox': 'http://localhost:3000',
      '/chat': 'http://localhost:3000'
    }
  }
});