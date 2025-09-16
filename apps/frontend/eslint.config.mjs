import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals",  "../../.eslintrc.cjs","next/typescript"), 
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "../../tsconfig.base.json"],
        tsconfigRootDir: __dirname,
      },
    },

    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // frontend-specific overrides here if needed
    },
  },
];

export default eslintConfig;
