import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

import { pagesTemplate } from "./gen-pages-template.mjs";
import { summaryTemplate } from "./gen-summary-template.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const pagesDir = join(__dirname, "../../app/app/demos");

const examplesDir = join(__dirname, "../../website/pages/Examples");

const externalPages = [
  "material-3",
  "complex",
  "snap-carousel-loop",
  "snap-carousel-complex",
];

const pages = readdirSync(pagesDir).filter((page) => {
  const hasExcluded = externalPages.includes(page);
  const hasPreviewImage = existsSync(join(pagesDir, page, "preview.png"));

  return !hasExcluded && hasPreviewImage;
});

async function writePage(page) {
  const pageDirPath = join(pagesDir, page);
  const isDir = statSync(pageDirPath).isDirectory();

  if (!isDir) return;

  const pageContent = readFileSync(join(pageDirPath, "index.tsx"), "utf8");
  const processedContent = pagesTemplate(page, pageContent);
  const mdxPath = join(examplesDir, `${page}.mdx`);
  await writeFileSync(mdxPath, processedContent.trim(), {
    overwrite: true,
  });
}

async function writeSummary() {
  const page = "summary";
  const processedContent = summaryTemplate(pages);
  const mdxPath = join(examplesDir, `${page}.mdx`);
  await writeFileSync(mdxPath, processedContent.trim(), {
    overwrite: true,
  });
}

// remove all of the mdx files in the examples dir
const mdxFiles = readdirSync(examplesDir).filter((file) =>
  file.endsWith(".mdx"),
);

for (const file of mdxFiles) unlinkSync(join(examplesDir, file));

Promise.all(pages.map(writePage));

writeSummary();

console.log("Pages generated successfully 🎉");
