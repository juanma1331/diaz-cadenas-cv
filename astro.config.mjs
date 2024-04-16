import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import db from "@astrojs/db";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react(), db()],
  vite: {
    optimizeDeps: {
      exclude: ["oslo"]
    }
  },
  output: "server",
  adapter: cloudflare()
});