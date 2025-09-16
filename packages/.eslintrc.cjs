/* Root ESLint config */
module.exports = {
    root: true,
    ignorePatterns: ["node_modules", "dist", ".next", "coverage"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "unused-imports", "import"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/recommended",
      "plugin:import/typescript",
      "prettier"
    ],
    settings: {
      "import/resolver": {
        node: { extensions: [".js", ".ts", ".tsx"] },
        typescript: { project: ["./tsconfig.base.json"] }
      }
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "import/order": [
        "warn",
        {
          "groups": [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
          "newlines-between": "always",
          "alphabetize": { "order": "asc", "caseInsensitive": true }
        }
      ],
      "@typescript-eslint/consistent-type-imports": "warn"
    }
  };
  