#!/usr/bin/env node

import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const transformsDir = new URL("./transforms/", import.meta.url);
const versions = readdirSync(transformsDir)
  .filter((file) => /^v\d+\.mjs$/.test(file))
  .map((file) => file.slice(0, -".mjs".length));

const [version, ...args] = process.argv.slice(2);
const inputs = args.filter((arg) => arg !== "--dry");

if (!version || !versions.includes(version) || inputs.length === 0) {
  console.error(
    [
      "Usage: npx rnrc-codemod <version> [--dry] <file-or-directory> [...]",
      "",
      `Versions: ${versions.join(", ")}`,
      "Example: npx rnrc-codemod v5 --dry .",
    ].join("\n")
  );
  process.exitCode = 2;
} else {
  // Each transform runs its own CLI when it is the entry script.
  const transform = new URL(`${version}.mjs`, transformsDir);
  process.argv = [process.argv[0], fileURLToPath(transform), ...args];
  await import(transform.href);
}
