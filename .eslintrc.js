module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module"
  },
  extends: [
    "plugin:prettier/recommended",
    "prettier"
  ],
  plugins: [
    "prettier",
    "@typescript-eslint"
  ],
  rules: {
    sortkeys: 0,
    noconsole: 0
  },
  ignorePatterns: [
    "node_modules",
    "out",
    "dist",
    "**/*.d.ts"
  ]
}
