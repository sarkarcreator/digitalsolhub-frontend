import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],

    cacheDir: 'node_modules/.vite_dev_cache',

    define: {
      global: 'globalThis',
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      port: 3000,
      host: '0.0.0.0',

      allowedHosts: [
        'digitalsolhub.com',
        'www.digitalsolhub.com',
        'api.digitalsolhub.com',
        'dshsol.vercel.app',
        'localhost',
        '127.0.0.1',
      ],

      headers: {
        'Cache-Control': 'no-store',
      },

      proxy: {
        '/api': {
          target:
            env.VITE_API_BASE_URL?.replace('/api', '') ||
            'http://localhost:8000',

          changeOrigin: true,
          secure: false,
          ws: true,

          rewrite: (path) => path,
        },
      },
    },

    preview: {
      host: '0.0.0.0',

      allowedHosts: [
        'digitalsolhub.com',
        'www.digitalsolhub.com',
        'api.digitalsolhub.com',
        'dshsol.vercel.app',
      ],
    },

    build: {
      sourcemap: false,

      minify: 'esbuild',

      target: 'es2020',

      cssMinify: 'esbuild',

      chunkSizeWarningLimit: 700,

      modulePreload: {
        resolveDependencies: (_filename, deps) =>
          deps.filter((dep) => !dep.includes('pdf-tools')),
      },

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('dompurify')) return 'pdf-tools';
            if (id.includes('qrcode.react')) return 'qr-tools';
            if (id.includes('lucide-react')) return 'icons';
            return undefined;
          },
        },
      },
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});
