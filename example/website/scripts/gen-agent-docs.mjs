import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://rn-carousel.dev";
const DEFAULT_PAGES_DIR = fileURLToPath(new URL("../pages", import.meta.url));
const DEFAULT_OUTPUT_DIR = fileURLToPath(new URL("../out", import.meta.url));

function quotedYaml(value) {
  return JSON.stringify(value);
}

export function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/u.exec(source);
  if (!match) return { attributes: {}, body: source };

  const attributes = {};
  for (const line of match[1].split(/\r?\n/u)) {
    const entry = /^([A-Za-z_][\w-]*):\s*(.*)$/u.exec(line);
    if (!entry) continue;
    const [, key, rawValue] = entry;
    const value = rawValue.trim();
    if (!value) continue;
    attributes[key] = value.replace(/^(['"])(.*)\1$/u, "$2");
  }

  return {
    attributes,
    body: source.slice(match[0].length),
  };
}

function stripTopLevelMdxStatements(lines) {
  const output = [];
  let skippingExport = false;
  let exportBraceDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (skippingExport) {
      exportBraceDepth += (line.match(/\{/gu) ?? []).length;
      exportBraceDepth -= (line.match(/\}/gu) ?? []).length;
      if (exportBraceDepth <= 0 && /;\s*$/u.test(trimmed)) {
        skippingExport = false;
      }
      continue;
    }

    if (/^import\s/u.test(trimmed)) continue;
    if (/^export\s/u.test(trimmed)) {
      const opens = (line.match(/\{/gu) ?? []).length;
      const closes = (line.match(/\}/gu) ?? []).length;
      if (opens > closes || !/;\s*$/u.test(trimmed)) {
        skippingExport = true;
        exportBraceDepth = opens - closes;
      }
      continue;
    }

    output.push(line);
  }

  return output;
}

function attribute(tag, name) {
  const match = new RegExp(`${name}=(?:\"([^\"]*)\"|'([^']*)')`, "u").exec(tag);
  return match?.[1] ?? match?.[2];
}

function stripJsxFromLine(line) {
  let output = line;

  output = output.replace(/<Demo\b[^>]*\/>/gu, (tag) => {
    const kind = attribute(tag, "kind");
    const name = attribute(tag, "name");
    if (!kind || !name) return "";
    return `[Open the interactive ${name} demo](${SITE_URL}/Examples/${kind}/${name})`;
  });

  output = output.replace(/<img\b[^>]*\/?>/gu, (tag) => {
    const src = attribute(tag, "src");
    if (!src) return "";
    const alt = attribute(tag, "alt") ?? "Image";
    return `![${alt}](${src})`;
  });

  output = output.replace(/<video\b[^>]*\/?>/gu, (tag) => {
    const src = attribute(tag, "src");
    return src ? `[Video](${src})` : "";
  });

  output = output.replace(
    /<a\b[^>]*href=(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gu,
    (_match, doubleQuotedHref, singleQuotedHref, label) =>
      `[${label}](${doubleQuotedHref ?? singleQuotedHref})`
  );

  output = output.replace(/<\/?[A-Za-z][^>]*>/gu, "");
  return output;
}

export function stripFencedCode(markdown) {
  const output = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*```/u.test(line)) {
      inFence = !inFence;
      output.push("");
      continue;
    }
    if (!inFence) output.push(line);
  }

  return output.join("\n");
}

export function hasMdxResidue(markdown) {
  const prose = stripFencedCode(markdown);
  return (
    /(^|\n)\s*(?:import|export)\s/u.test(prose) ||
    /<\/?[A-Za-z][^>]*>/u.test(prose) ||
    /\{\/?\*/u.test(prose)
  );
}

export function mdxToMarkdown(source) {
  const { body } = parseFrontmatter(source);
  const withoutComments = body.replace(/\{\/\*[\s\S]*?\*\/\}/gu, "");
  const lines = withoutComments.replace(/\r\n/gu, "\n").split("\n");
  const output = [];
  let inFence = false;
  let prose = [];

  const flushProse = () => {
    if (prose.length === 0) return;
    output.push(...stripTopLevelMdxStatements(prose).map(stripJsxFromLine));
    prose = [];
  };

  for (const line of lines) {
    if (/^\s*```/u.test(line)) {
      flushProse();
      inFence = !inFence;
      output.push(line);
      continue;
    }

    if (inFence) output.push(line);
    else prose.push(line);
  }
  flushProse();

  const markdown = output
    .join("\n")
    .replace(/[ \t]+$/gmu, "")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();

  if (hasMdxResidue(markdown)) {
    throw new Error("MDX-to-Markdown conversion left JSX or module syntax behind");
  }

  return `${markdown}\n`;
}

async function collectMdxFiles(directory) {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith("_")) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMdxFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".mdx") && entry.name !== "404.mdx") {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function routeForFile(file, pagesDir) {
  const relative = path.relative(pagesDir, file).replace(/\\/gu, "/");
  const route = relative.replace(/\.mdx$/u, "").replace(/\/index$/u, "");
  return route === "index" || route === "" ? "/" : `/${route}`;
}

function outputPathForRoute(route, outputDir) {
  if (route === "/") return path.join(outputDir, "index.md");
  return path.join(outputDir, `${route.slice(1)}.md`);
}

function titleForPage(attributes, markdown, route) {
  if (attributes.title) return attributes.title;
  const heading = /^#\s+(.+)$/mu.exec(markdown)?.[1];
  if (heading) return heading;
  return route === "/" ? "React Native Reanimated Carousel" : route.slice(1);
}

function canonicalForRoute(route) {
  return route === "/" ? SITE_URL : `${SITE_URL}${route}`;
}

function documentFrontmatter({ title, route }) {
  return [
    "---",
    `title: ${quotedYaml(title)}`,
    `canonical_url: ${quotedYaml(canonicalForRoute(route))}`,
    `markdown_url: ${quotedYaml(`${canonicalForRoute(route === "/" ? "/index" : route)}.md`)}`,
    'version: "5"',
    "---",
    "",
  ].join("\n");
}

function splitPages(pages) {
  const examples = pages.filter(({ route }) => route.startsWith("/Examples/"));
  const documentation = pages.filter(({ route }) => !route.startsWith("/Examples/"));
  return { documentation, examples };
}

export function createLlmsIndex(pages) {
  const { documentation, examples } = splitPages(pages);
  const links = (items) =>
    items
      .map(
        ({ route, title, description }) =>
          `- [${title}](${canonicalForRoute(route === "/" ? "/index" : route)}.md)${description ? `: ${description}` : ""}`
      )
      .join("\n");

  return `# React Native Reanimated Carousel

> Documentation for react-native-reanimated-carousel v5, a performant React Native carousel powered by Reanimated.

## Instructions for AI coding agents

- Use the v5 public API documented here; do not suggest removed v4 aliases or deep imports.
- For a v4-to-v5 upgrade, read ${SITE_URL}/migration-v5.md and follow its protocol in order.
- Run \`npx rnrc-v5-codemod\` before making behavioral migration decisions.
- Keep user changes uncommitted unless the user explicitly asks you to commit.

## Documentation

${links(documentation)}

## Examples

${links(examples)}

## Optional

- [Complete documentation in one file](${SITE_URL}/llms-full.txt)
`;
}

export function createLlmsFull(pages) {
  return pages
    .map(({ route, title, markdown }) => {
      const body = markdown.replace(/^#\s+.+\n+/u, "").trim();
      return `# ${title}\n\nSource: ${canonicalForRoute(route === "/" ? "/index" : route)}.md\n\n${body}`;
    })
    .join("\n\n---\n\n")
    .concat("\n");
}

export async function generateAgentDocs({
  pagesDir = DEFAULT_PAGES_DIR,
  outputDir = DEFAULT_OUTPUT_DIR,
} = {}) {
  const files = await collectMdxFiles(pagesDir);
  const pages = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const { attributes } = parseFrontmatter(source);
    const route = routeForFile(file, pagesDir);
    const markdown = mdxToMarkdown(source);
    const title = titleForPage(attributes, markdown, route);
    const outputPath = outputPathForRoute(route, outputDir);
    const content = `${documentFrontmatter({ title, route })}${markdown}`;

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, content);
    pages.push({
      route,
      title,
      description: attributes.description ?? "",
      markdown,
    });
  }

  pages.sort((left, right) => left.route.localeCompare(right.route));
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "llms.txt"), createLlmsIndex(pages));
  await writeFile(path.join(outputDir, "llms-full.txt"), createLlmsFull(pages));

  return pages;
}

async function main() {
  const pages = await generateAgentDocs();
  console.log(`Generated ${pages.length} Markdown twins, llms.txt, and llms-full.txt.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.stack ?? error.message);
    process.exitCode = 1;
  });
}
