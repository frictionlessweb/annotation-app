/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom'
  },
  server: {
    proxy: {
      "/api/v1": {
        target: "http://localhost:8080",
        rewrite: (path) => {
          return path.replace("/api/v1", "");
        },
      },
    },
  },
});
