import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import db from "@astrojs/db";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react(), db()],
  vite: {
    optimizeDeps: {
      exclude: ["oslo"],
    },
  },
  output: "server",
  adapter: vercel(),
});
