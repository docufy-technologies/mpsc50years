import tailwindcss from "@tailwindcss/vite";

import { tanstackRouter } from "@tanstack/router-plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      generatedRouteTree: "./src/route-tree.gen.ts",
      routeToken: "_layout",
    }),
    viteReact(),
  ],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // normalize slashes
            const parts = id.split(/node_modules\//g);

            // last part after the last node_modules is the real pkg path
            const pkgPath = parts[parts.length - 1];

            // handle scoped packages (@scope/name)
            const pkgName = pkgPath.startsWith("@")
              ? pkgPath.split("/").slice(0, 2).join("/")
              : pkgPath.split("/")[0];

            // replace / in scoped names so they are valid filenames
            return pkgName.replace("/", "_").replace(/@/g, "");
          }
        },
      },
    },
  },
});

export default config;
