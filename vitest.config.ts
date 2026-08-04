import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      // Fallbacks for cases where tsconfig paths don't resolve (e.g. .ts file paths).
      "@business-os/shared": resolve(__dirname, "core/platform/index.ts"),
    },
  },
  test: {
    environment: "node",
    include: [
      "core/**/tests/**/*.test.ts",
      "reusable-components/**/tests/**/*.test.ts",
    ],
    globals: false,
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["reusable-components/**/backend/**/*.ts"],
    },
  },
});
