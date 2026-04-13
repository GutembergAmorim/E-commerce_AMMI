import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      // Domínios de tunnel
      ".loca.lt",
      ".ngrok.io",
      ".ngrok-free.app",
      ".loca.lt",
      // Seu domínio personalizado se tiver
      ".seudominio.com",
    ],
    host: true, // Permite acesso externo
    port: 5173,
    // Proxy para API em desenvolvimento
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.js",
  },
});
