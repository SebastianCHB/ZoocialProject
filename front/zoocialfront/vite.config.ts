import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = env.VITE_BACKEND_URL ?? 'http://localhost:8000';
  const isProd = mode === 'production';

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: isProd ? {} : {
      proxy: {
        '/api': {
          target: backend,
          changeOrigin: true,
          secure: false,
          headers: { Accept: 'application/json' },
        },
        '/sanctum': {
          target: backend,
          changeOrigin: true,
        },
        '/storage': {
          target: backend,
          changeOrigin: true,
        },
      },
    },
  };
});
