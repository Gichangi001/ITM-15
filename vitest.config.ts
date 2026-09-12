import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // See test/empty-module.ts for why these need aliasing under Vitest.
      "server-only": path.resolve(__dirname, "./test/empty-module.ts"),
      "client-only": path.resolve(__dirname, "./test/empty-module.ts"),
    },
  },
});
