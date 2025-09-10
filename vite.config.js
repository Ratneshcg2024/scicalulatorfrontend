import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::", // Enables external access (IPv6)
    port: 8080, // Custom port for local dev consistency
    base: '/dist'  //to add the directory for cloud setup
  },
  plugins: [
    react(), // Fast SWC-based React plugin
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Clean import paths
    },
  },
});
