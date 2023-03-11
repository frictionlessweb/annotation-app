import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/v1": {
        target: "http://0.0.0.0:8000",
        rewrite: (path) => {
          return path.replace("/api/v1", "");
        },
      },
    },
  },
});
