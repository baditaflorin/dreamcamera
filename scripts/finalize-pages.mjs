import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const commit =
  process.env.VITE_APP_COMMIT ??
  execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

await copyFile("docs/index.html", "docs/404.html");
await mkdir("docs/meta", { recursive: true });
await writeFile(
  "docs/meta/build.json",
  `${JSON.stringify(
    {
      name: packageJson.name,
      version: packageJson.version,
      commit,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  )}\n`,
);
