import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      root: 'frontend',
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false,
        fs: {
          allow: [
            '..', // Allow access to root directory from frontend root
          ]
        }
      },
      plugins: [react()],
      build: {
        outDir: '../dist',
        emptyOutDir: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            }
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './frontend/src'),
          '@components': path.resolve(__dirname, './components'),
          '@views': path.resolve(__dirname, './views'),
        }
      }
    };
});
