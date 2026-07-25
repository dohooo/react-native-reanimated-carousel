import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { checkPackageEntries } from "./check-package-entries.mjs";

const typeNames = [
  "CarouselAnimation",
  "CarouselItemAnimation",
  "CarouselLayout",
  "CarouselPanGesture",
  "CarouselProgressChangeHandler",
  "CarouselProps",
  "CarouselRef",
  "CarouselRenderItem",
  "CarouselRenderItemInfo",
  "CarouselScrollToOptions",
  "CarouselStepOptions",
  "PaginationDotStyle",
  "PaginationProps",
];

async function createFixture(options = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "rnrc-package-entries-"));
  await mkdir(path.join(root, "lib", "commonjs"), { recursive: true });
  await mkdir(path.join(root, "lib", "module"), { recursive: true });
  await mkdir(path.join(root, "lib", "typescript"), { recursive: true });
  await mkdir(path.join(root, "src"), { recursive: true });
  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify({
      main: "lib/commonjs/index",
      module: "lib/module/index",
      "react-native": "src/index.tsx",
      types: "lib/typescript/index.d.ts",
      bin: {
        "rnrc-v5-codemod": "scripts/codemods/v5.mjs",
      },
      exports: {
        ".": {
          "react-native": "./src/index.tsx",
          import: {
            types: "./lib/typescript/index.d.ts",
            default: "./lib/module/index.js",
          },
          require: {
            types: "./lib/typescript/index.d.ts",
            default: "./lib/commonjs/index.js",
          },
          default: "./lib/module/index.js",
        },
        "./package.json": "./package.json",
      },
    })
  );
  await writeFile(path.join(root, "src", "index.tsx"), "export {};");
  await mkdir(path.join(root, "scripts", "codemods"), { recursive: true });
  await writeFile(path.join(root, "scripts", "codemods", "v5.mjs"), "#!/usr/bin/env node\n");
  await writeFile(
    path.join(root, "lib", "commonjs", "index.js"),
    'Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"Carousel",{value:{}});Object.defineProperty(exports,"Pagination",{value:{}});require("./Carousel");'
  );
  await writeFile(
    path.join(root, "lib", "module", "index.js"),
    options.moduleCode ??
      'export { Carousel } from "./Carousel"; export { Pagination } from "./Pagination";'
  );
  await writeFile(
    path.join(root, "lib", "typescript", "index.d.ts"),
    options.typesCode ??
      `export { Carousel } from "./Carousel";\nexport { Pagination } from "./Pagination";\nexport type { ${typeNames.join(
        ", "
      )} } from "./public-types";\n`
  );
  return root;
}

test("accepts distinct CommonJS, ESM, exports-map, and declaration entries", async () => {
  const root = await createFixture();

  try {
    await checkPackageEntries(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects a module entry compiled as CommonJS", async () => {
  const root = await createFixture({ moduleCode: 'require("./Carousel");' });

  try {
    await assert.rejects(checkPackageEntries(root), /must preserve ESM imports\/exports/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects a default declaration export", async () => {
  const root = await createFixture({
    typesCode: `export { Carousel, Pagination };\nexport type { ${typeNames.join(
      ", "
    )} };\nexport default Carousel;\n`,
  });

  try {
    await assert.rejects(checkPackageEntries(root), /must not default-export/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects public types outside the whitelist", async () => {
  const root = await createFixture({
    typesCode: `export { Carousel, Pagination };\nexport type { ${typeNames.join(
      ", "
    )}, InternalType };\n`,
  });

  try {
    await assert.rejects(checkPackageEntries(root), /approved public type whitelist/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
