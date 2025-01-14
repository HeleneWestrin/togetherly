import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import fs from "fs";

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    https: {
      key: fs.readFileSync("./certs/helene-local.io.key"),
      cert: fs.readFileSync("./certs/helene-local.io.crt"),
    },
    host: "helene-local.io",
    port: 1234,
  },
});
