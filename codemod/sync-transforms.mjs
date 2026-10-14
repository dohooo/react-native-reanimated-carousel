import { copyFile, mkdir, readdir, rm } from "node:fs/promises";

// The transforms live in scripts/codemods so the library's own `rnrc-v5-codemod`
// bin and this package always run the same code.
const source = new URL("../scripts/codemods/", import.meta.url);
const target = new URL("./transforms/", import.meta.url);

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const file of await readdir(source)) {
  if (/^v\d+\.mjs$/.test(file)) await copyFile(new URL(file, source), new URL(file, target));
}
