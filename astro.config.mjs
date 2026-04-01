import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

export default defineConfig({
  output: "static",
  site: "https://dawoodkamar.com",
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
});
