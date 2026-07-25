import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const runtimeExports = ["Carousel", "Pagination"];
const typeExports = [
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

async function readEntry(root, field, value, extensions = [""]) {
  assert.equal(typeof value, "string", `package.json ${field} must be a string`);

  for (const extension of extensions) {
    const entryPath = path.resolve(root, `${value}${extension}`);
    try {
      return { code: await readFile(entryPath, "utf8"), entryPath };
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  assert.fail(`package.json ${field} entry does not exist: ${value}`);
}

function sorted(values) {
  return [...values].sort();
}

function parseExportClause(clause) {
  return clause
    .split(",")
    .map((entry) => entry.trim().split(/\s+as\s+/)[1] ?? entry.trim().split(/\s+as\s+/)[0])
    .filter(Boolean);
}

function collectEsmRuntimeExports(code) {
  return [...code.matchAll(/\bexport\s*\{([^}]*)\}/g)].flatMap((match) =>
    parseExportClause(match[1])
  );
}

function collectDeclarationExports(code, typeOnly) {
  const pattern = typeOnly
    ? /\bexport\s+type\s*\{([^}]*)\}/g
    : /\bexport\s+(?!type\b)\{([^}]*)\}/g;

  return [...code.matchAll(pattern)].flatMap((match) => parseExportClause(match[1]));
}

function withDotSlash(value, extension = "") {
  const normalized = value.startsWith("./") ? value : `./${value}`;
  return normalized.endsWith(extension) ? normalized : `${normalized}${extension}`;
}

export async function checkPackageEntries(root = repositoryRoot) {
  const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  const commonjs = await readEntry(root, "main", packageJson.main, ["", ".js"]);
  const module = await readEntry(root, "module", packageJson.module, ["", ".js"]);
  const types = await readEntry(root, "types", packageJson.types);
  const rootExport = packageJson.exports?.["."];

  assert.deepEqual(packageJson.bin, {
    "rnrc-v5-codemod": "scripts/codemods/v5.mjs",
  });
  await readEntry(root, "bin.rnrc-v5-codemod", packageJson.bin["rnrc-v5-codemod"]);
  assert.deepEqual(
    Object.keys(packageJson.exports ?? {}).sort(),
    [".", "./package.json"],
    "package exports must expose only the root entry and ./package.json"
  );
  assert.equal(packageJson.exports["./package.json"], "./package.json");
  assert.deepEqual(Object.keys(rootExport ?? {}), ["react-native", "import", "require", "default"]);
  assert.deepEqual(Object.keys(rootExport.import ?? {}), ["types", "default"]);
  assert.deepEqual(Object.keys(rootExport.require ?? {}), ["types", "default"]);
  assert.equal(rootExport.import.types, withDotSlash(packageJson.types));
  await readEntry(root, "exports['.'].require.types", rootExport.require.types);
  assert.equal(rootExport["react-native"], withDotSlash(packageJson["react-native"]));
  assert.equal(rootExport.import.default, withDotSlash(packageJson.module, ".js"));
  assert.equal(rootExport.require.default, withDotSlash(packageJson.main, ".js"));
  assert.equal(rootExport.default, rootExport.import.default);

  assert.match(
    commonjs.code,
    /\brequire\s*\(/,
    `${path.relative(root, commonjs.entryPath)} must contain CommonJS requires`
  );
  assert.doesNotMatch(
    commonjs.code,
    /(^|[;\n])\s*(?:import|export)\s/m,
    `${path.relative(root, commonjs.entryPath)} must not expose ESM syntax`
  );
  const commonjsExports = [
    ...commonjs.code.matchAll(/Object\.defineProperty\(exports,\s*["']([^"']+)["']/g),
  ]
    .map((match) => match[1])
    .filter((name) => name !== "__esModule");
  assert.deepEqual(sorted(new Set(commonjsExports)), runtimeExports);

  assert.match(
    module.code,
    /(^|[;\n])\s*(?:import|export)\b/m,
    `${path.relative(root, module.entryPath)} must preserve ESM imports/exports`
  );
  assert.doesNotMatch(
    module.code,
    /\brequire\s*\(/,
    `${path.relative(root, module.entryPath)} must not be a duplicate CommonJS build`
  );
  assert.notEqual(
    module.code,
    commonjs.code,
    "package.json main and module entries must not contain identical module formats"
  );
  assert.deepEqual(sorted(new Set(collectEsmRuntimeExports(module.code))), runtimeExports);

  assert.doesNotMatch(types.code, /\bexport\s+default\b/, "types entry must not default-export");
  assert.deepEqual(
    sorted(new Set(collectDeclarationExports(types.code, false))),
    runtimeExports,
    "types entry runtime exports must match the named-only contract"
  );
  assert.deepEqual(
    sorted(new Set(collectDeclarationExports(types.code, true))),
    typeExports,
    "types entry must expose exactly the approved public type whitelist"
  );
  assert.doesNotMatch(
    types.code,
    /\b(?:I|T)[A-Z][A-Za-z0-9_]*\b/,
    "types entry must not expose I/T-prefixed public names"
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  checkPackageEntries()
    .then(() => console.log("Package entry check passed."))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
