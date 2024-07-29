import { build } from "esbuild";
import pckgJson from "./package.json" with { "type": "json" };

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  external: Object.keys(pckgJson.dependencies ?? [])
    .concat(Object.keys(pckgJson.peerDependencies ?? []))
    .filter((val) => !val.startsWith("@repo/")),
};

build({
  ...sharedConfig,
  platform: "node", // for CJS
  outfile: "dist/index.js",
});
