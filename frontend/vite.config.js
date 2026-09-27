import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Plugin inline: substitui os placeholders __VITE_GA4_ID__ e
 * __VITE_META_PIXEL_ID__ no index.html pelos valores reais das
 * variáveis de ambiente VITE_GA4_ID e VITE_META_PIXEL_ID.
 *
 * Funciona tanto em `vite dev` quanto em `vite build`.
 * Assim não precisamos de pacotes extras (vite-plugin-html etc.).
 */
function injectEnvIntoHtml() {
  let env = {};
  return {
    name: 'inject-env-into-html',
    configResolved(config) {
      env = config.env || {};
    },
    transformIndexHtml(html) {
      return html
        .replace(/__VITE_GA4_ID__/g, env.VITE_GA4_ID || '')
        .replace(/__VITE_META_PIXEL_ID__/g, env.VITE_META_PIXEL_ID || '');
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), injectEnvIntoHtml()],
  server: {
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      // Domínios de tunnel
      ".loca.lt",
      ".ngrok.io",
      ".ngrok-free.app",
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
