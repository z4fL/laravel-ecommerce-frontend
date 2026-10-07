import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "./docs/api-docs.yaml",
    },
    output: {
      mode: "tags-split",
      target: "./src/generated",
      schemas: "./src/generated/models",
      client: "react-query",
      httpClient: "fetch",
      override: {
        mutator: {
          path: "./src/api.ts",
          name: "apiFetch",
        },
      },
    },
  },
});
