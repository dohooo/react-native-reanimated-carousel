import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://rn-carousel.dev";
const DEFAULT_PAGES_DIR = fileURLToPath(new URL("../pages", import.meta.url));
const DEFAULT_OUTPUT_DIR = fileURLToPath(new URL("../out", import.meta.url));
const DEFAULT_SCENES_FILE = fileURLToPath(new URL("../components/scenes/scenes.json", import.meta.url));
const PACKAGE_FILE = fileURLToPath(new URL("../../../package.json", import.meta.url));

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

function markdownUrlForRoute(route) {
  return `${canonicalForRoute(route === "/" ? "/index" : route)}.md`;
}

/**
 * Rewrites site-relative links in prose to absolute URLs. Links to documentation
 * pages point at their Markdown twins, so an agent that follows them stays in
 * Markdown; other files (images, videos) keep their path on the site.
 */
export function absolutizeLinks(markdown, routes) {
  const resolve = (target) => {
    const match = /^(\/[^\s#?)]*)([?#][^\s)]*)?$/u.exec(target);
    if (!match) return target;
    const [, pathname, suffix = ""] = match;
    const route = pathname.length > 1 ? pathname.replace(/\/$/u, "") : pathname;
    if (routes.has(route)) return `${markdownUrlForRoute(route)}${suffix}`;
    return `${SITE_URL}${pathname}${suffix}`;
  };

  const output = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*```/u.test(line)) inFence = !inFence;
    output.push(
      inFence || /^\s*```/u.test(line)
        ? line
        : line.replace(/(\]\()(\/[^\s)]*)(\))/gu, (_match, open, target, close) => `${open}${resolve(target)}${close}`)
    );
  }
  return output.join("\n");
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

async function readSidebarOrder(pagesDir) {
  const order = new Map();
  const visit = async (directory, prefix) => {
    let meta = {};
    try {
      meta = JSON.parse(await readFile(path.join(directory, "_meta.json"), "utf8"));
    } catch {
      return;
    }
    for (const key of Object.keys(meta)) {
      const route = key === "index" ? prefix || "/" : `${prefix}/${key}`;
      if (!order.has(route)) order.set(route, order.size);
      await visit(path.join(directory, key), `${prefix}/${key}`);
    }
  };
  await visit(pagesDir, "");
  return order;
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

function documentFrontmatter({ title, description, route }) {
  return [
    "---",
    `title: ${quotedYaml(title)}`,
    ...(description ? [`description: ${quotedYaml(description)}`] : []),
    `canonical_url: ${quotedYaml(canonicalForRoute(route))}`,
    `markdown_url: ${quotedYaml(markdownUrlForRoute(route))}`,
    'version: "5"',
    "---",
    "",
  ].join("\n");
}

function splitPages(pages) {
  const isScene = ({ route }) => route === "/Examples/scenes" || route.startsWith("/Examples/scenes/");
  const isExample = ({ route }) => route.startsWith("/Examples/");
  return {
    documentation: pages.filter((page) => !isExample(page)),
    scenes: pages.filter(isScene),
    examples: pages.filter((page) => isExample(page) && !isScene(page)),
  };
}

function linkList(items, { descriptions = true } = {}) {
  return items
    .map(
      ({ route, title, description }) =>
        `- [${title}](${markdownUrlForRoute(route)})${descriptions && description ? `: ${description}` : ""}`
    )
    .join("\n");
}

function packageFacts(pkg) {
  if (!pkg) return "";
  const peers = Object.entries(pkg.peerDependencies ?? {})
    .map(([name, range]) => `${name} ${range}`)
    .join(", ");
  return [
    `- Package: \`${pkg.name}\`, current version ${pkg.version}. Named exports only: \`import { Carousel, Pagination } from "${pkg.name}"\`.`,
    ...(peers ? [`- Peer dependencies: ${peers}.`] : []),
    `- Install with Expo: \`npx expo install ${pkg.name} react-native-reanimated react-native-worklets react-native-gesture-handler\`.`,
    "- Every page below is Markdown. On the site, add `.md` to a page URL for the same text (the home page is `/index.md`).",
    "",
  ].join("\n");
}

export function createLlmsIndex(pages, { pkg } = {}) {
  const { documentation, scenes, examples } = splitPages(pages);

  return `# React Native Reanimated Carousel

> react-native-reanimated-carousel v5 is a performant, customizable carousel for React Native, powered by Reanimated and Gesture Handler. It works on iOS, Android and Web.

${packageFacts(pkg)}
## Instructions for AI coding agents

- Use the v5 public API documented here; do not suggest removed v4 aliases or deep imports.
- For a v4-to-v5 upgrade, read ${SITE_URL}/migration-v5.md and follow its protocol in order.
- Run \`npx --yes rnrc-codemod v5 .\` before making behavioral migration decisions.
- Keep user changes uncommitted unless the user explicitly asks you to commit.

## Docs

${linkList(documentation)}

## Scenes

Full app screens built with one or more carousels. Each page explains the technique, lists the props it uses and includes the complete source.

${linkList(scenes)}

## Optional

- [Complete documentation in one file](${SITE_URL}/llms-full.txt): every page under Docs, without examples or scenes.

Animation examples, each a live demo with its source:

${linkList(examples, { descriptions: false })}
`;
}

export function createLlmsFull(pages) {
  const { documentation } = splitPages(pages);
  const preamble = `# React Native Reanimated Carousel: complete documentation

> Every documentation page of react-native-reanimated-carousel v5 in one file. Examples and scenes are listed in ${SITE_URL}/llms.txt.`;

  return [
    preamble,
    ...documentation.map(({ route, title, markdown }) => {
      const body = markdown.replace(/^#\s+.+\n+/u, "").trim();
      return `# ${title}\n\nSource: ${markdownUrlForRoute(route)}\n\n${body}`;
    }),
  ]
    .join("\n\n---\n\n")
    .concat("\n");
}

/** The scenes gallery is a React component, so its Markdown twin gets the list written out. */
export function scenesList(scenesData) {
  const labels = new Map(scenesData.tags.map(({ k, label }) => [k, label]));
  const lines = scenesData.scenes.map(({ slug, title, description, tags }) => {
    const techniques = tags.map((tag) => labels.get(tag) ?? tag).join(", ");
    return `- [${title}](${markdownUrlForRoute(`/Examples/scenes/${slug}`)}): ${description}${techniques ? ` Techniques: ${techniques}.` : ""}`;
  });
  return `## All scenes\n\n${lines.join("\n")}\n`;
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return undefined;
  }
}

export async function generateAgentDocs({
  pagesDir = DEFAULT_PAGES_DIR,
  outputDir = DEFAULT_OUTPUT_DIR,
  scenesFile = DEFAULT_SCENES_FILE,
  packageFile = PACKAGE_FILE,
} = {}) {
  const files = await collectMdxFiles(pagesDir);
  const routes = new Set(files.map((file) => routeForFile(file, pagesDir)));
  const order = await readSidebarOrder(pagesDir);
  const scenesData = await readJson(scenesFile);
  const pkg = await readJson(packageFile);
  const pages = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const { attributes } = parseFrontmatter(source);
    const route = routeForFile(file, pagesDir);
    let markdown = mdxToMarkdown(source);
    const title = titleForPage(attributes, markdown, route);
    if (!/^#\s/u.test(markdown)) markdown = `# ${title}\n\n${markdown}`;
    if (route === "/Examples/scenes" && scenesData) markdown = `${markdown}\n${scenesList(scenesData)}`;
    markdown = absolutizeLinks(markdown, routes);
    const description = attributes.description ?? "";
    const outputPath = outputPathForRoute(route, outputDir);
    const content = `${documentFrontmatter({ title, description, route })}${markdown}`;

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, content);
    pages.push({ route, title, description, markdown });
  }

  const rank = (route) => order.get(route) ?? Number.MAX_SAFE_INTEGER;
  pages.sort((left, right) => rank(left.route) - rank(right.route) || left.route.localeCompare(right.route));
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "llms.txt"), createLlmsIndex(pages, { pkg }));
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
