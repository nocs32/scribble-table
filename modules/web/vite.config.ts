import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const coreApiUrl = 'http://localhost:2568';

// Live tables: the Colyseus client talks to /live (matchmaking over HTTP, then a WebSocket);
// core-api serves those routes at its root.
const liveProxy = {
  target: coreApiUrl,
  ws: true,
  rewrite: (path: string): string => path.replace(/^\/live/u, ''),
};

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      'styled-system': fileURLToPath(new URL('./styled-system', import.meta.url)),
    },
  },
  // 5174 and 4174, not Vite's 5173 and 4173: Felt Table uses those, and both may run at once.
  server: {
    port: 5174,
    strictPort: true,
    proxy: { '/api': coreApiUrl, '/live': liveProxy },
  },
  preview: {
    port: 4174,
    strictPort: true,
  },
});
