#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const CHANGESET_DIR = path.join(process.cwd(), ".changeset");
const IGNORED_FILES = new Set(["README.md", "STYLE.md", "config.json", "pre.json"]);

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

function getBody(content) {
  const match = /^---\n[\s\S]*?\n---\n?/u.exec(content);
  if (!match) return null;
  return content.slice(match[0].length).trim();
}

function checkChangeset(content) {
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

  let bulletCount = 0;
  for (const line of lines) {
    if (!line.startsWith("- ")) {
      errors.push(`line must start with "- ": "${line}"`);
      continue;
    }

    bulletCount += 1;
    const text = line.slice(2).trim();
    if (!text) {
      errors.push("contains empty bullet line");
      continue;
    }

    if (text.length > MAX_LINE_LENGTH) {
      errors.push(`bullet too long (${text.length}); max is ${MAX_LINE_LENGTH}`);
    }
  }

  if (bulletCount === 0) {
    errors.push("must include at least one bullet line");
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

main();
