import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: process.env.VITE_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/Komse-Design/' : '/'),
    plugins: [react(), tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: Number(process.env.VITE_PORT || 3000),
      strictPort: true,
      proxy: {
        '/api': `http://localhost:${process.env.SERVER_PORT || process.env.MAIL_PORT || 3001}`,
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
