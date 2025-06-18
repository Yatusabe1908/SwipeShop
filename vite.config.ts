import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    cors: {
      origin: [
        "https://admin.shopify.com",
        "https://*.myshopify.com",
        /^https:\/\/.*\.myshopify\.com$/,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ],
      credentials: true,
    },
    headers: {
      "X-Frame-Options": "ALLOWALL",
      "Content-Security-Policy": "frame-ancestors *;",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          animation: ["framer-motion"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
        },
      },
    },
    // Ensure compatibility with iframe embedding
    target: "es2015",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
      },
    },
  },
  define: {
    // Ensure global is defined for compatibility
    global: "globalThis",
  },
});
