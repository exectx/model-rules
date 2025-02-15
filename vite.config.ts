import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild, mode }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
        input: "./workers/app.ts",
      }
      : undefined,
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
  },
  ssr: {
    resolve: {
      conditions: ["workerd", "worker", "browser"],
      externalConditions: ["workerd", "worker"],
    }
  },
  plugins: [
    mode === "development" ? cloudflare({ configPath: "wrangler.dev.toml" }) : undefined,
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
}));
