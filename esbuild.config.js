import * as esbuild from "esbuild";
import { cpSync, readFileSync, rmSync, writeFileSync } from "fs";

const sourceFolder = "./src";
const buildFolder = "./build/prod";
const filesToCopy = ["yarn.lock", "prisma/schema.prisma", "prisma/migrations"];

const cleanBuildFolder = () => ({
  name: "clean-build-folder",
  setup(build) {
    build.onStart(() => {
      rmSync(buildFolder, { recursive: true, force: true });
    });
  },
});

const copyFiles = () => ({
  name: "copy-files",
  setup(build) {
    build.onEnd(() => {
      for (const file of filesToCopy) {
        try {
          cpSync(`./${file}`, `${buildFolder}/${file}`, { recursive: true });
        } catch (e) {
          console.error("Failed to copy file:", e);
        }
      }
    });
  },
});

const copyProdPackageJSON = () => ({
  name: "copy-prod-package-json",
  setup(build) {
    build.onEnd(() => {
      const packageJson = JSON.parse(readFileSync("package.json"));
      delete packageJson.devDependencies;
      packageJson.main = "index.cjs";
      writeFileSync(`${buildFolder}/package.json`, JSON.stringify(packageJson));
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
  outfile: `${buildFolder}/index.cjs`,
  plugins: [cleanBuildFolder(), copyFiles(), copyProdPackageJSON()],
});
