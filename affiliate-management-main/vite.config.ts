import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get backend URL from environment (Docker uses 'backend', local uses 'localhost')
const backendUrl = process.env.VITE_API_URL || "http://localhost:5000";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: __dirname,
  server: {
    host: "0.0.0.0",  // Allow connections from Docker network
    port: 8080,
    fs: {
      allow: [".", "./client"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
    proxy: {
      // Proxy all /api requests to Python Flask backend
      "/api": {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
  },
}));
