import { readFileSync } from "node:fs";

const file = process.argv[2];

if (!file) {
  throw new Error("commit message file path missing");
}

const message = readFileSync(file, "utf8").trim();
const firstLine = message.split("\n")[0] ?? "";
const conventional =
  /^(feat|fix|docs|chore|refactor|test|ops|data|build|ci|perf|style)(\([a-z0-9-]+\))?: .{1,120}$/.test(
    firstLine,
  );
const mergeOrRevert = /^(Merge|Revert)/.test(firstLine);

if (!conventional && !mergeOrRevert) {
  console.error(`Invalid commit message: ${firstLine}`);
  console.error(
    "Use Conventional Commits, for example: feat: add camera renderer",
  );
  process.exit(1);
}
