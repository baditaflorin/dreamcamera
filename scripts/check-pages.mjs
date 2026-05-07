import { gzipSync } from "node:zlib";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const index = await readFile("docs/index.html", "utf8");

if (!index.includes("/dreamcamera/assets/")) {
  throw new Error("docs/index.html does not contain GitHub Pages base asset paths");
}

const assets = await readdir("docs/assets");
const jsAssets = assets.filter((asset) => asset.endsWith(".js"));

if (jsAssets.length === 0) {
  throw new Error("build produced no JavaScript assets");
}

let initialGzipBytes = 0;
for (const asset of jsAssets) {
  if (asset.includes("onnx-runtime") || asset.includes("mediapipe")) {
    continue;
  }
  const path = join("docs/assets", asset);
  const info = await stat(path);
  if (info.size === 0) {
    throw new Error(`${path} is empty`);
  }
  const content = await readFile(path);
  initialGzipBytes += gzipSync(content).byteLength;
}

const budget = 200 * 1024;
if (initialGzipBytes > budget) {
  throw new Error(`initial JS exceeds 200KB gzipped budget: ${initialGzipBytes} bytes`);
}

console.log(`Pages build ok. Initial JS gzip: ${Math.round(initialGzipBytes / 1024)}KB`);

