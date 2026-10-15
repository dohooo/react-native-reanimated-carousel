import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  absolutizeLinks,
  generateAgentDocs,
  hasMdxResidue,
  mdxToMarkdown,
  stripFencedCode,
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

test("points site-relative links at Markdown twins and leaves code untouched", () => {
  const routes = new Set(["/", "/props", "/Examples/scenes"]);
  const markdown = [
    "See [props](/props#loop), [home](/), [scenes](/Examples/scenes/) and ![shot](/steps-1.png).",
    "Keep [GitHub](https://github.com/dohooo/react-native-reanimated-carousel).",
    "```tsx",
    'const link = "[x](/props)";',
    "```",
  ].join("\n");

  const result = absolutizeLinks(markdown, routes);

  assert.match(result, /\[props\]\(https:\/\/rn-carousel\.dev\/props\.md#loop\)/u);
  assert.match(result, /\[home\]\(https:\/\/rn-carousel\.dev\/index\.md\)/u);
  assert.match(result, /\[scenes\]\(https:\/\/rn-carousel\.dev\/Examples\/scenes\.md\)/u);
  assert.match(result, /!\[shot\]\(https:\/\/rn-carousel\.dev\/steps-1\.png\)/u);
  assert.match(result, /\[GitHub\]\(https:\/\/github\.com\/dohooo\/react-native-reanimated-carousel\)/u);
  assert.match(result, /const link = "\[x\]\(\/props\)";/u);
});

test("generates twins and llms files for every documentation page", async () => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "rnrc-agent-docs-"));
  const pagesDir = path.join(websiteDir, "pages");
  await mkdir(outputDir, { recursive: true });

  const pages = await generateAgentDocs({ pagesDir, outputDir });

  assert.ok(pages.length >= 33);
  assert.ok(pages.some(({ route }) => route === "/migration-v5"));
  assert.ok(pages.some(({ route }) => route === "/works-with-expo"));
  assert.ok(pages.some(({ route }) => route === "/Examples/basic-layouts/normal"));

  const llms = await readFile(path.join(outputDir, "llms.txt"), "utf8");
  const llmsFull = await readFile(path.join(outputDir, "llms-full.txt"), "utf8");
  const migration = await readFile(path.join(outputDir, "migration-v5.md"), "utf8");
  const expo = await readFile(path.join(outputDir, "works-with-expo.md"), "utf8");

  const scenes = await readFile(path.join(outputDir, "Examples/scenes.md"), "utf8");
  const docsSection = llms.slice(llms.indexOf("## Docs"), llms.indexOf("## Scenes"));

  assert.match(llms, /^# React Native Reanimated Carousel/mu);
  assert.match(llms, /## Instructions for AI coding agents/u);
  assert.match(llms, /Peer dependencies: .*react-native-reanimated >=/u);
  assert.match(docsSection, /\[API Reference\]\(https:\/\/rn-carousel\.dev\/props\.md\)/u);
  assert.doesNotMatch(docsSection, /\/Examples\//u);
  assert.match(llms, /## Scenes[\s\S]*\/Examples\/scenes\/slot-machine\.md[\s\S]*## Optional/u);
  assert.match(llms, /## Optional[\s\S]*\/Examples\/basic-layouts\/normal\.md/u);
  assert.match(llms, /https:\/\/rn-carousel\.dev\/llms-full\.txt/u);
  assert.doesNotMatch(llmsFull, /^Source: https:\/\/rn-carousel\.dev\/Examples\//mu);
  assert.ok(llmsFull.length < 150_000, `llms-full.txt is ${llmsFull.length} characters`);
  assert.match(scenes, /## All scenes/u);
  assert.match(scenes, /\[Slot Machine\]\(https:\/\/rn-carousel\.dev\/Examples\/scenes\/slot-machine\.md\)/u);
  assert.match(llms, /https:\/\/rn-carousel\.dev\/migration-v5\.md/u);
  assert.match(llms, /https:\/\/rn-carousel\.dev\/works-with-expo\.md/u);
  assert.match(llmsFull, /# Migration Guide to v5/u);
  assert.match(llmsFull, /# Works with Expo/u);
  assert.match(migration, /canonical_url: "https:\/\/rn-carousel\.dev\/migration-v5"/u);
  assert.match(expo, /canonical_url: "https:\/\/rn-carousel\.dev\/works-with-expo"/u);
  assert.match(expo, /npx expo install react-native-reanimated-carousel/u);
  assert.equal(hasMdxResidue(expo), false);

  for (const page of pages) {
    const outputPath =
      page.route === "/"
        ? path.join(outputDir, "index.md")
        : path.join(outputDir, `${page.route.slice(1)}.md`);
    const markdown = await readFile(outputPath, "utf8");
    assert.equal(hasMdxResidue(markdown), false, page.route);
    assert.match(markdown, /\n---\n# /u, `${page.route} starts with a title`);
    assert.doesNotMatch(stripFencedCode(markdown), /\]\(\//u, `${page.route} has a relative link`);
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

  // `changeset version` consumes the changeset file and moves its content
  // into CHANGELOG.md, so the release-notes copy of the contract lives in
  // exactly one of the two locations depending on the release lifecycle.
  const changesetPath = path.join(
    repositoryDir,
    ".changeset/modernize-v5-api.md"
  );
  const releaseNotes = existsSync(changesetPath)
    ? { name: "changeset", content: await readFile(changesetPath, "utf8") }
    : {
        name: "CHANGELOG",
        content: await readFile(path.join(repositoryDir, "CHANGELOG.md"), "utf8"),
      };

  for (const [name, source] of [
    ["migration", migration],
    ["README", readme],
    [releaseNotes.name, releaseNotes.content],
  ]) {
    assert.equal(source.split(prompt).length - 1, 1, name);
  }

  assert.equal(migration.split(reviewNote).length - 1, 1);
  assert.equal(
    releaseNotes.content.split(reviewNote).length - 1,
    1,
    releaseNotes.name
  );
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
