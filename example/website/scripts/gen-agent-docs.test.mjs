import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  generateAgentDocs,
  hasMdxResidue,
  mdxToMarkdown,
} from "./gen-agent-docs.mjs";

const websiteDir = fileURLToPath(new URL("..", import.meta.url));
const repositoryDir = path.resolve(websiteDir, "../..");

test("converts MDX components to plain Markdown without changing fenced examples", () => {
  const source = `---
title: Fixture
---

import { Callout } from "nextra/components"

{/* generated */}
<Callout type="info">
Read the guide.
</Callout>
<Demo kind="basic-layouts" name="normal" />
<img src="/cover.png" alt="Cover" />
<video src="/demo.mp4" />
<p>Visit <a href="https://example.com">the source</a>.</p>

\`\`\`tsx
export const Example = () => <Carousel data={[]} />;
\`\`\`
`;

  const markdown = mdxToMarkdown(source);

  assert.doesNotMatch(markdown, /^import /mu);
  assert.match(
    markdown,
    /\[Open the interactive normal demo\]\(https:\/\/rn-carousel\.dev\/Examples\/basic-layouts\/normal\)/u
  );
  assert.match(markdown, /!\[Cover\]\(\/cover\.png\)/u);
  assert.match(markdown, /\[Video\]\(\/demo\.mp4\)/u);
  assert.match(markdown, /Visit \[the source\]\(https:\/\/example\.com\)\./u);
  assert.match(markdown, /export const Example = \(\) => <Carousel/u);
  assert.equal(hasMdxResidue(markdown), false);
});

test("generates twins and llms files for every documentation page", async () => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "rnrc-agent-docs-"));
  const pagesDir = path.join(websiteDir, "pages");
  await mkdir(outputDir, { recursive: true });

  const pages = await generateAgentDocs({ pagesDir, outputDir });

  assert.ok(pages.length > 20);
  assert.ok(pages.some(({ route }) => route === "/migration-v5"));
  assert.ok(pages.some(({ route }) => route === "/Examples/basic-layouts/normal"));

  const llms = await readFile(path.join(outputDir, "llms.txt"), "utf8");
  const llmsFull = await readFile(path.join(outputDir, "llms-full.txt"), "utf8");
  const migration = await readFile(path.join(outputDir, "migration-v5.md"), "utf8");

  assert.match(llms, /^# React Native Reanimated Carousel/mu);
  assert.match(llms, /## Instructions for AI coding agents/u);
  assert.match(llms, /https:\/\/rn-carousel\.dev\/migration-v5\.md/u);
  assert.match(llmsFull, /# Migration Guide to v5/u);
  assert.match(migration, /canonical_url: "https:\/\/rn-carousel\.dev\/migration-v5"/u);

  for (const page of pages) {
    const outputPath =
      page.route === "/"
        ? path.join(outputDir, "index.md")
        : path.join(outputDir, `${page.route.slice(1)}.md`);
    const markdown = await readFile(outputPath, "utf8");
    assert.equal(hasMdxResidue(markdown), false, page.route);
  }
});

test("keeps the migration handoff contract exact in every published source", async () => {
  const prompt = [
    "Read https://rn-carousel.dev/migration-v5.md and upgrade",
    "react-native-reanimated-carousel to v5 in this project, then summarize",
    "what changed for my review.",
  ].join(" ");
  const reviewNote = [
    "The agent only edits files in your working tree — nothing is committed,",
    "and it stops for your review.",
  ].join(" ");
  const migration = await readFile(
    path.join(websiteDir, "pages/migration-v5.mdx"),
    "utf8"
  );
  const readme = await readFile(path.join(repositoryDir, "README.md"), "utf8");
  const changeset = await readFile(
    path.join(repositoryDir, ".changeset/modernize-v5-api.md"),
    "utf8"
  );

  for (const [name, source] of [
    ["migration", migration],
    ["README", readme],
    ["changeset", changeset],
  ]) {
    assert.equal(source.split(prompt).length - 1, 1, name);
  }

  assert.equal(migration.split(reviewNote).length - 1, 1);
  assert.equal(changeset.split(reviewNote).length - 1, 1);
  assert.equal(
    migration.match(/\*\*Human confirmation required:\*\*/gu)?.length,
    12
  );
  assert.match(migration, /Then stop and wait for the user to review the working tree\./u);
  assert.match(
    migration,
    /Do NOT commit or push — leave all changes uncommitted for the user to review\./u
  );
});
