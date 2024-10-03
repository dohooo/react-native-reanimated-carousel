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
import { summaryTemplate } from "./gen-summary-template.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const pagesDir = join(__dirname, "../../app/app/demos");

const examplesDir = join(__dirname, "../../website/pages/Examples");

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

      pages.push({
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
  console.log(
    `📜 |_${page.demo.pageKind}/${page.demo.pageName} is going to generate...`,
  );

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
  const renderItemContent = readFileSync(
    join(pagesDir, "../../utils/render-item.tsx"),
    "utf8",
  );
  const slideItemContent = readFileSync(
    join(pagesDir, "../../components/SlideItem.tsx"),
    "utf8",
  );

  // Format the code contents using Prettier
  const formattedPageContent = await prettier.format(pageContent, {
    parser: "typescript",
    useTabs: true,
  });

  const formattedRenderItemContent = await prettier.format(renderItemContent, {
    parser: "typescript",
    useTabs: true,
  });

  const formattedSlideItemContent = await prettier.format(slideItemContent, {
    parser: "typescript",
    useTabs: true,
  });

  const processedContent = pagesTemplate(
    page.demo.pageKind,
    page.demo.pageName,
    {
      carousel: formattedPageContent,
      renderItem: formattedRenderItemContent,
      slideItem: formattedSlideItemContent,
    },
  );
  const mdxDir = join(examplesDir, page.demo.pageKind);
  if (!existsSync(mdxDir)) await mkdirSync(mdxDir, { recursive: true });
  const mdxPath = join(mdxDir, `${page.demo.pageName}.mdx`);
  await writeFileSync(mdxPath, processedContent.trim(), {
    overwrite: true,
  });

  console.log(`🍏 |_${page.demo.pageKind}/${page.demo.pageName} generated`);
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
      "basic-layouts": "Basic Layouts",
      "utils": "Utils",
      "custom-animations": "Custom Animations",
      "experiments": "Experiments",
    }),
  );
}

// remove all of the mdx files in the examples dir
cleanGeneratedMDXFiles();

const pages = getPages();

// Generate kind dirs and write `_meta.json`
genKindDirs(pages);

// Generate pages
for (const page of pages) await writePage(page);

// Generate summary
writeSummary(pages);

console.log("Pages generated successfully 🎉");
