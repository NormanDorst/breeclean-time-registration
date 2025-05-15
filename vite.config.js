import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/breeclean-time-registration/", // let op de slash aan het begin én einde
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
