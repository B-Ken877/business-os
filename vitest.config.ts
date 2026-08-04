import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@business-os/shared": resolve(__dirname, "reusable-components/_shared/index.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["reusable-components/**/tests/**/*.test.ts"],
    globals: false,
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["reusable-components/**/backend/**/*.ts"],
    },
  },
});
