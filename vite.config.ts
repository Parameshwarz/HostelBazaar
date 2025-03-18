import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { OutputAsset, OutputChunk } from 'rollup';

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
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    manifest: true,
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
        },
        assetFileNames: (info: { name?: string }) => {
          if (!info.name) return 'assets/[name].[hash][extname]';
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(info.name)) {
            return 'assets/images/[name].[hash][extname]';
          }
          if (/\.css$/i.test(info.name)) {
            return 'assets/css/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js'
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
  }
});
