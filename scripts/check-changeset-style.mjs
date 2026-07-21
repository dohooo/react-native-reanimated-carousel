#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHANGESET_DIR = path.join(process.cwd(), ".changeset");
const IGNORED_FILES = new Set(["README.md", "config.json", "pre.json"]);

const MAX_LINES = 6;
const MAX_LINE_LENGTH = 160;
const FORBIDDEN_PATTERNS = [
  /```/,
  /^\s*#/m,
  /\broot cause\b/i,
  /\bsolution\b/i,
  /\baffected files\b/i,
  /\bmigration steps?\b/i,
];

export function getBody(content) {
  const match = /^---\n[\s\S]*?\n---\n?/u.exec(content);
  if (!match) return null;
  return content.slice(match[0].length).trim();
}

export function checkChangeset(content) {
  const errors = [];
  const body = getBody(content);

  if (body == null) {
    errors.push("missing or invalid frontmatter block");
    return errors;
  }

  if (!body) {
    errors.push("summary body is empty");
    return errors;
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(body)) {
      errors.push(`contains unsupported verbose structure (${pattern})`);
      break;
    }
  }

  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > MAX_LINES) {
    errors.push(`too many summary lines (${lines.length}); max is ${MAX_LINES}`);
  }

  const [summary, ...details] = lines;
  if (/^(?:[-*+]|\d+[.)])\s+/u.test(summary)) {
    errors.push(`summary line must not start with a list marker: "${summary}"`);
  }

  if (summary.length > MAX_LINE_LENGTH) {
    errors.push(
      `summary line too long (${summary.length}); max is ${MAX_LINE_LENGTH}`
    );
  }

  for (const line of details) {
    if (!line.startsWith("- ")) {
      errors.push(`detail line must start with "- ": "${line}"`);
      continue;
    }

    const text = line.slice(2).trim();
    if (!text) {
      errors.push("contains empty bullet line");
      continue;
    }

    if (text.length > MAX_LINE_LENGTH) {
      errors.push(`bullet too long (${text.length}); max is ${MAX_LINE_LENGTH}`);
    }
  }

  return errors;
}

async function main() {
  let entries;
  try {
    entries = await fs.readdir(CHANGESET_DIR, { withFileTypes: true });
  } catch (error) {
    console.error("Failed to read .changeset directory:", error);
    process.exit(1);
  }

  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".md") && !IGNORED_FILES.has(name))
    .sort();

  const violations = [];

  for (const fileName of files) {
    const filePath = path.join(CHANGESET_DIR, fileName);
    const content = await fs.readFile(filePath, "utf8");
    const errors = checkChangeset(content);
    for (const error of errors) {
      violations.push(`${fileName}: ${error}`);
    }
  }

  if (violations.length > 0) {
    console.error("Changeset style check failed:\n");
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log(`Changeset style check passed for ${files.length} file(s).`);
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  main();
}
