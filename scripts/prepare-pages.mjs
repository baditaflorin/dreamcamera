import { rm } from "node:fs/promises";

const generatedPaths = ["docs/assets", "docs/index.html", "docs/404.html", "docs/registerSW.js"];

await Promise.all(
  generatedPaths.map((path) =>
    rm(path, {
      force: true,
      recursive: true
    })
  )
);

