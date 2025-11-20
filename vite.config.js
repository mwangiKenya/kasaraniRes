import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/kasaraniRes/",  // GitHub Pages base
  plugins: [react()],
  server: {
    host: true,             // allow LAN/ngrok access
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'nonsymphonically-unwalked-sharla.ngrok-free.dev' // your ngrok URL
    ]
  }
});
