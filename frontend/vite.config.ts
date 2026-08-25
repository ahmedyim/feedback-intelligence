import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load non-VITE_ variables on the Node/Server side
  const env = loadEnv(mode, process.cwd(), ''); 

  return {
    server: {
      proxy: {
        '/api': {
          target: env.API_BASE_URL || 'http://localhost:8000/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  };
});
