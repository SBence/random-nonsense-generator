import * as esbuild from "esbuild";
import { cpSync, rmSync } from "fs";

const sourceFolder = "./src";
const prodFolder = "./build/prod";
const filesToCopy = [
  "package.json",
  "yarn.lock",
  "prisma/schema.prisma",
  "prisma/migrations",
];

const copyFiles = () => ({
  name: "copy-files",
  setup(build) {
    build.onStart(() => {
      rmSync(prodFolder, { recursive: true, force: true });
    });
    build.onEnd(() => {
      for (const file of filesToCopy) {
        try {
          cpSync(`./${file}`, `${prodFolder}/${file}`, { recursive: true });
        } catch (e) {
          console.error("Failed to copy file:", e);
        }
      }
    });
  },
});

await esbuild.build({
  entryPoints: [`${sourceFolder}/index.ts`],
  bundle: true,
  minifyIdentifiers: false,
  minifySyntax: true,
  minifyWhitespace: true,
  platform: "node",
  packages: "external",
  outfile: `${prodFolder}/index.cjs`,
  plugins: [copyFiles()],
});
