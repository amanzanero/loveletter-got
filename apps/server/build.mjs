import { build, context } from "esbuild";
import pckgJson from "./package.json" with { "type": "json" };

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  external: Object.keys(pckgJson.dependencies ?? [])
    .concat(Object.keys(pckgJson.peerDependencies ?? []))
    .filter((val) => !val.startsWith("@repo/")),
  platform: "node", // for CJS
  outfile: "dist/index.js",
};

if (process.argv.findIndex((argv) => argv === "--dev") !== -1) {
  let ctx = await context({
    ...sharedConfig,
  });
  await ctx.watch();
  console.log("Watching...");
} else {
  build({
    ...sharedConfig,
    sourcemap: true,
    minify: true,
  });
}
