import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // The pinned import map in index.html supplies these browser runtimes.
      // Keeping the packages in package.json preserves local type checks and CI.
      external: ["react", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "@supabase/supabase-js"],
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
