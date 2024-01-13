import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

import { pagesTemplate } from "./gen-pages-template.mjs";
import { summaryTemplate } from "./gen-summary-template.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const pagesDir = join(__dirname, "../../app/src/pages");
const externalPages = [
  "material-3",
  "complex",
  "snap-carousel-loop",
  "snap-carousel-complex",
];

const pages = readdirSync(pagesDir).filter(page => !externalPages.includes(page));

async function writePage(page) {
  const pagePath = join(pagesDir, page);
  const pageContent = readFileSync(join(pagePath, "index.tsx"), "utf8");
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
