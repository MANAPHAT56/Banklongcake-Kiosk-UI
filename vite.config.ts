import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget =
    env.VITE_PROXY_API_TARGET || "http://localhost:3000";

  return {
    base: env.VITE_BASE_PATH || "/",
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },

    server: {
      host: true,
      port: 5173,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});