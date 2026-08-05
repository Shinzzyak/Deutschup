import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Only list packages that are actually in the dependency graph —
          // 'dompurify' and 'html2canvas' were named here but are neither in
          // package.json nor imported anywhere, so they produced empty chunks.
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router'],
            'supabase': ['@supabase/supabase-js'],
            'ui-vendor': ['lucide-react', 'motion'],
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
});
