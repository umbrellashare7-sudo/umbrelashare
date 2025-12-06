import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },

    plugins: [react()],

    build: {
      outDir: "dist", // ← SAFE, STANDARD, ALWAYS WORKS
      emptyOutDir: true,
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    define: {
      __API_KEY__: JSON.stringify(env.GEMINI_API_KEY || ""),
    },
  };
});
