module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:import/errors",
    "prettier",
  ],
  plugins: ["prettier", "@typescript-eslint"],
  rules: {
    "no-unused-vars": "off",
    // TypeScript側のeslintで未使用のvarをエラー
    "@typescript-eslint/no-unused-vars": 1,
    "sort-keys": 0,
    "no-console": 0,
    "func-style": [2, "expression", { allowArrowFunctions: true }],
    "import/order": [
      "error",
      {
        groups: ["internal", "builtin", "external", "parent"],
      },
    ],
    "import/no-unresolved": "off",
  },
  ignorePatterns: ["node_modules", "out", "dist", "**/*.d.ts"],
};
