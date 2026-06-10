import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import esbuild from "esbuild";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const projectRoot = process.cwd();
const extensionRoot = path.join(projectRoot, "extension");
const outputRoot = path.join(projectRoot, "dist", "extension");
const assetsRoot = path.join(outputRoot, "assets");

await rm(outputRoot, { recursive: true, force: true });
await mkdir(assetsRoot, { recursive: true });

await esbuild.build({
  entryPoints: {
    background: path.join(extensionRoot, "src", "background", "index.js"),
    content: path.join(extensionRoot, "src", "content", "index.js"),
    voice: path.join(extensionRoot, "src", "voice", "index.js"),
    sidepanel: path.join(extensionRoot, "src", "sidepanel", "main.jsx")
  },
  outdir: outputRoot,
  bundle: true,
  format: "iife",
  minify: false,
  sourcemap: false,
  target: ["chrome116"],
  loader: {
    ".js": "jsx",
    ".jsx": "jsx"
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "production")
  }
});

const cssInput = await readFile(
  path.join(extensionRoot, "src", "sidepanel", "index.css"),
  "utf8"
);

const cssOutput = await postcss([
  tailwindcss({
    config: path.join(projectRoot, "tailwind.config.js")
  }),
  autoprefixer()
]).process(cssInput, {
  from: path.join(extensionRoot, "src", "sidepanel", "index.css"),
  to: path.join(assetsRoot, "sidepanel.css")
});

await writeFile(path.join(assetsRoot, "sidepanel.css"), cssOutput.css, "utf8");
await copyFile(
  path.join(extensionRoot, "manifest.json"),
  path.join(outputRoot, "manifest.json")
);
await copyFile(
  path.join(extensionRoot, "sidepanel.html"),
  path.join(outputRoot, "sidepanel.html")
);
await copyFile(
  path.join(extensionRoot, "voice.html"),
  path.join(outputRoot, "voice.html")
);

console.log("Extension build complete:", outputRoot);

