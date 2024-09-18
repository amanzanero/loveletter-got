import { build, context } from "esbuild";

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node", // for CJS
  outfile: "dist/index.js",
  sourcemap: true,
  minify: true,
});
