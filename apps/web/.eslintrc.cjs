module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "@repo/eslint-config/react-internal.js",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "vite.config.ts"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  parserOptions: {
    project: "tsconfig.app.json",
  },
};
