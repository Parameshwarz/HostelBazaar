import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/HostelBazaar/',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
}); 