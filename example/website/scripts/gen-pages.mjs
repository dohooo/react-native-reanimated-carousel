import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

import { pagesTemplate } from "./gen-pages-template.mjs";
import { summaryTemplate } from "./gen-summary-template.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const pagesDir = join(__dirname, "../../app/app/demos");

const includePages = [
  "normal",
  "parallax",
  "stack",
  "left-align",
  "pagination",
];

const externalPages = [
  "material-3",
  "complex",
  "snap-carousel-loop",
  "snap-carousel-complex",
];

const pages = readdirSync(pagesDir)
  .filter((page) => includePages.includes(page))
  .filter((page) => !externalPages.includes(page));

async function writePage(page) {
  const pageDirPath = join(pagesDir, page);
  const isDir = statSync(pageDirPath).isDirectory();

  if (!isDir) return;

  const pageContent = readFileSync(join(pageDirPath, "index.tsx"), "utf8");
  const processedContent = pagesTemplate(page, pageContent);
  const mdxPath = join(__dirname, `../../website/pages/Examples/${page}.mdx`);
  await writeFileSync(mdxPath, processedContent.trim(), {
    overwrite: true,
  });
}

async function writeSummary() {
  const page = "summary";
  const processedContent = summaryTemplate(pages);
  const mdxPath = join(__dirname, `../../website/pages/Examples/${page}.mdx`);
  await writeFileSync(mdxPath, processedContent.trim(), {
    overwrite: true,
  });
}

Promise.all(pages.map(writePage));

writeSummary();

console.log("Pages generated successfully 🎉");
