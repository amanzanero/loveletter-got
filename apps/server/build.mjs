import { build, context } from "esbuild";
import pckgJson from "./package.json" with { "type": "json" };

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  external: Object.keys(pckgJson.dependencies ?? [])
    .concat(Object.keys(pckgJson.peerDependencies ?? []))
    .filter((val) => !val.startsWith("@repo/router")),
  platform: "node", // for CJS
  outfile: "dist/index.js",
  sourcemap: true,
  minify: true,
});
