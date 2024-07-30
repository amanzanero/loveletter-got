module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ["@repo/eslint-config/library.js", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
