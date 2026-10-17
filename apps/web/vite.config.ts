import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Keep host aligned with OAuth cookies / OAUTH_SUCCESS_REDIRECT (not localhost)
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/stories": "http://127.0.0.1:8787",
      "/tags": "http://127.0.0.1:8787",
      "/auth": "http://127.0.0.1:8787",
      "/health": "http://127.0.0.1:8787",
    },
  },
});
