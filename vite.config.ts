import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'date-fns',
      'react-image-gallery',
      'lucide-react',
      'framer-motion',
      'react-hot-toast',
      '@supabase/supabase-js'
    ],
    exclude: [],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'react-hot-toast', 'react-image-gallery'],
          'date-utils': ['date-fns']
        }
      }
    }
  },
  server: {
    port: 3000,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    }
  },
  base: '/HostelBazaar/',
});
