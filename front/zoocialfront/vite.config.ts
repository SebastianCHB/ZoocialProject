import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// config
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // backend
  const backend = env.VITE_BACKEND_URL ?? 'http://localhost:8000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        // api
        '/api': {
          target: backend,
          changeOrigin: true,
          secure: false,
          headers: { Accept: 'application/json' },
        },
        // sanctum
        '/sanctum': {
          target: backend,
          changeOrigin: true,
        },
        // storage
        '/storage': {
          target: backend,
          changeOrigin: true,
        },
      },
    },
  };
});
