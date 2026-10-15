import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import { extname, join } from "path";
import { fileURLToPath } from "url";

import prettier from "prettier";

import { pagesTemplate } from "./gen-pages-template.mjs";
import { scenesOverviewTemplate, sceneTemplate } from "./gen-scene-templates.mjs";
import { summaryTemplate } from "./gen-summary-template.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const pagesDir = join(__dirname, "../../app/app/demos");

const examplesDir = join(__dirname, "../../website/pages/Examples");

const scenesDataPath = join(__dirname, "../components/scenes/scenes.json");

const scenesTagsPath = join(__dirname, "../../app/features/scenes/tags.json");

const SCENES_KIND = "scenes";

function getPages() {
  const pages = [];
  const kinds = readdirSync(pagesDir);

  for (const kind of kinds) {
    const kindPath = join(pagesDir, kind);
    if (!statSync(kindPath).isDirectory()) continue;

    const pageNames = readdirSync(kindPath);
    for (const pageName of pageNames) {
      const pageDirPath = join(kindPath, pageName);
      if (!statSync(pageDirPath).isDirectory()) continue;

      const demoFilePath = join(pageDirPath, "demo.tsx");
      const demoFileExt = extname(demoFilePath);
      const previewFilePath = join(pageDirPath, "preview.png");
      const isDemoExist = existsSync(demoFilePath);
      const isPreviewExist = existsSync(previewFilePath);

      const ignoreFileIncluded = readdirSync(pageDirPath).includes(".ignore");
      const metaFilePath = join(pageDirPath, "meta.json");
      const meta = existsSync(metaFilePath)
        ? JSON.parse(readFileSync(metaFilePath, "utf8"))
        : null;

      if (ignoreFileIncluded) {
        console.log(
          `💾 |_${kind}/${pageName} is ignored because of .ignore file`,
        );
        continue;
      }

      pages.push({
        meta,
        demo: {
          ext: demoFileExt,
          relativeDir: `/${kind}/${pageName}/`,
          relativePath: `/${kind}/${pageName}/demo.tsx`,
          pageName,
          pageKind: kind,
          isExist: isDemoExist,
        },
        preview: {
          ext: demoFileExt,
          relativeDir: `/${kind}/${pageName}/`,
          relativePath: `/${kind}/${pageName}/preview.png`,
          isExist: isPreviewExist,
        },
      });
    }
  }

  return pages;
}

async function writePage(page) {
  if (!page.demo.isExist) {
    console.log(
      `🍎 |_${page.demo.pageKind}/${page.demo.pageName} demo code not found, skip it...`,
    );
    return;
  }

  if (!page.preview.isExist) {
    console.log(
      `🍎 |_${page.demo.pageKind}/${page.demo.pageName} preview not found, skip it...`,
    );
    return;
  }

  const demoFilePath = join(pagesDir, page.demo.relativePath);
  const pageContent = readFileSync(demoFilePath, "utf8");

  // Format the code contents using Prettier
  const formattedPageContent = await prettier.format(pageContent, {
    parser: "typescript",
    useTabs: true,
  });

  const processedContent =
    page.demo.pageKind === SCENES_KIND
      ? sceneTemplate(page.demo.pageName, page.meta, formattedPageContent)
      : pagesTemplate(
          page.demo.pageKind,
          page.demo.pageName,
          formattedPageContent,
        );
  const mdxDir = join(examplesDir, page.demo.pageKind);
  if (!existsSync(mdxDir)) await mkdirSync(mdxDir, { recursive: true });
  const mdxPath = join(mdxDir, `${page.demo.pageName}.mdx`);
  await writeFileSync(mdxPath, processedContent.trim(), {
    overwrite: true,
  });

  console.log(`🍏 |_${page.demo.pageKind}/${page.demo.pageName} generated`);
}

// Scenes get an overview page with a filterable gallery, ordered by meta.json.
function writeScenes(pages) {
  const scenes = pages
    .filter((page) => page.demo.pageKind === SCENES_KIND && page.meta)
    .filter((page) => page.demo.isExist && page.preview.isExist)
    .sort((a, b) => a.meta.order - b.meta.order);
  if (scenes.length === 0) return;

  writeFileSync(
    join(examplesDir, `${SCENES_KIND}.mdx`),
    scenesOverviewTemplate(scenes.length).trim(),
  );
  writeFileSync(
    join(examplesDir, SCENES_KIND, "_meta.json"),
    JSON.stringify(
      Object.fromEntries(
        scenes.map((page) => [page.demo.pageName, page.meta.title]),
      ),
      null,
      2,
    ),
  );
  writeFileSync(
    scenesDataPath,
    `${JSON.stringify(
      {
        tags: JSON.parse(readFileSync(scenesTagsPath, "utf8")),
        scenes: scenes.map(({ demo, meta }) => ({
          slug: demo.pageName,
          title: meta.title,
          group: meta.group,
          description: meta.description,
          tags: meta.tags,
          statusBar: meta.statusBar,
        })),
      },
      null,
      2,
    )}\n`,
  );
}

async function writeSummary(pages) {
  const page = "summary";
  const processedContent = summaryTemplate(pages);
  const mdxPath = join(examplesDir, `${page}.mdx`);
  await writeFileSync(mdxPath, processedContent.trim(), {
    overwrite: true,
  });
}

function cleanGeneratedMDXFiles() {
  const dirs = readdirSync(examplesDir);

  for (const dir of dirs)
    rmSync(join(examplesDir, dir), { recursive: true, force: true });
}

async function genKindDirs() {
  writeFileSync(
    join(examplesDir, "_meta.json"),
    JSON.stringify({
      "summary": "Summary",
      "scenes": "Scenes",
      "basic-layouts": "Basic Layouts",
      "utils": "Utils",
      "custom-animations": "Custom Animations",
    }),
  );
}

// remove all of the mdx files in the examples dir
cleanGeneratedMDXFiles();

const pages = getPages().sort((a, b) =>
  !a.preview.isExist && !b.preview.isExist ? 0 : a.preview.isExist ? -1 : 1,
);

// Generate kind dirs and write `_meta.json`
genKindDirs(pages);

// Generate pages
for (const page of pages) await writePage(page);

// Generate the scenes overview, sidebar order and gallery data
writeScenes(pages);

// Generate summary (scenes have their own overview page)
writeSummary(pages.filter((page) => page.demo.pageKind !== SCENES_KIND));

console.log("Pages generated successfully 🎉");
