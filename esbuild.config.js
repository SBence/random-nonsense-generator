import * as esbuild from "esbuild";
import { rmSync } from "fs";

const buildFolder = "build";

const cleanBuildFolder = () => ({
  name: "clean-build-folder",
  setup(build) {
    build.onStart(() => {
      rmSync(buildFolder, { recursive: true, force: true });
    });
  },
});

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  platform: "node",
  packages: "external",
  sourcemap: true,
  format: "esm",
  outfile: `${buildFolder}/index.js`,
  plugins: [cleanBuildFolder()],
});
