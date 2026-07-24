import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageName = "react-native-reanimated-carousel";
const keepWorktree = process.env.KEEP_PACKED_PACKAGE_WORKTREE === "1";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repositoryRoot,
    encoding: "utf8",
    env: { ...process.env, ...options.env },
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(`${command} ${args.join(" ")} failed${details ? `:\n${details}` : ""}`);
  }

  return result.stdout ?? "";
}

async function linkDependency(consumerNodeModules, dependency) {
  const source = path.join(repositoryRoot, "node_modules", ...dependency.split("/"));
  const destination = path.join(consumerNodeModules, ...dependency.split("/"));
  await mkdir(path.dirname(destination), { recursive: true });
  await symlink(source, destination, "junction");
}

async function writeTypeConsumer(consumerRoot, moduleResolution) {
  const source = `
import { Carousel, Pagination } from "${packageName}";
import type {
  CarouselAnimation,
  CarouselItemAnimation,
  CarouselLayout,
  CarouselPanGesture,
  CarouselProgressChangeHandler,
  CarouselProps,
  CarouselRef,
  CarouselRenderItem,
  CarouselRenderItemInfo,
  CarouselScrollToOptions,
  CarouselStepOptions,
  PaginationDotStyle,
  PaginationProps,
} from "${packageName}";

declare const values: [
  typeof Carousel,
  typeof Pagination,
  CarouselAnimation,
  CarouselItemAnimation,
  CarouselLayout,
  CarouselPanGesture,
  CarouselProgressChangeHandler,
  CarouselProps<string>,
  CarouselRef,
  CarouselRenderItem<string>,
  CarouselRenderItemInfo<string>,
  CarouselScrollToOptions,
  CarouselStepOptions,
  PaginationDotStyle,
  PaginationProps,
];
void values;
`;
  const tsconfig = {
    compilerOptions: {
      allowSyntheticDefaultImports: true,
      jsx: "react-jsx",
      module: "esnext",
      moduleResolution,
      noEmit: true,
      skipLibCheck: true,
      strict: true,
      target: "es2020",
    },
    files: ["consumer.ts"],
  };

  await writeFile(path.join(consumerRoot, "consumer.ts"), source);
  await writeFile(path.join(consumerRoot, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));
  run(
    process.execPath,
    [path.join(repositoryRoot, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.json"],
    { cwd: consumerRoot }
  );
}

async function main() {
  const workRoot = await mkdtemp(path.join(tmpdir(), "rnrc-packed-package-"));
  const tarballDirectory = path.join(workRoot, "tarballs");
  const extractedDirectory = path.join(workRoot, "extracted");
  const consumerRoot = path.join(workRoot, "consumer");
  const consumerNodeModules = path.join(consumerRoot, "node_modules");

  try {
    await mkdir(tarballDirectory, { recursive: true });
    const packOutput = run(
      "npm",
      ["pack", "--json", "--pack-destination", tarballDirectory],
      { capture: true, env: { npm_config_ignore_scripts: "true" } }
    );
    const jsonPayload = packOutput.match(/(\[\s*\{\s*"id"[\s\S]*\]\s*)$/)?.[1];
    assert(jsonPayload, "npm pack did not return its JSON manifest");
    const packResult = JSON.parse(jsonPayload)[0];
    const tarballPath = path.join(tarballDirectory, packResult.filename);
    const filePaths = packResult.files.map((file) => file.path);

    assert(filePaths.includes("package.json"), "tarball must contain package.json");
    assert(filePaths.includes("lib/commonjs/index.js"), "tarball must contain the CommonJS root");
    assert(filePaths.includes("lib/module/index.js"), "tarball must contain the ESM root");
    assert(
      filePaths.includes("lib/typescript/module/index.d.ts"),
      "tarball must contain declarations"
    );
    assert(filePaths.includes("src/index.tsx"), "tarball must contain the React Native source root");
    assert(
      filePaths.includes("scripts/codemods/v5.mjs"),
      "tarball must contain the v5 migration codemod"
    );
    assert(
      filePaths.every(
        (file) =>
          file === "package.json" ||
          file === "README.md" ||
          file === "LICENSE" ||
          file === "scripts/codemods/v5.mjs" ||
          file.startsWith("lib/") ||
          file.startsWith("src/")
      ),
      "tarball contains files outside the approved package surface"
    );
    assert(
      filePaths.every((file) => !/\.test\.[cm]?[jt]sx?$/.test(file)),
      "tarball must not contain test files"
    );

    await mkdir(extractedDirectory, { recursive: true });
    run("tar", ["-xzf", tarballPath, "-C", extractedDirectory]);
    const extractedPackage = path.join(extractedDirectory, "package");
    const packedPackageJson = JSON.parse(
      await readFile(path.join(extractedPackage, "package.json"), "utf8")
    );
    assert.deepEqual(Object.keys(packedPackageJson.exports).sort(), [".", "./package.json"]);
    assert.deepEqual(packedPackageJson.bin, {
      "rnrc-v5-codemod": "scripts/codemods/v5.mjs",
    });

    await mkdir(consumerNodeModules, { recursive: true });
    await cp(extractedPackage, path.join(consumerNodeModules, packageName), { recursive: true });
    for (const dependency of [
      "@types/react",
      "react",
      "react-native",
      "react-native-gesture-handler",
      "react-native-reanimated",
      "react-native-worklets",
      "typescript",
    ]) {
      await linkDependency(consumerNodeModules, dependency);
    }

    const codemodFixture = path.join(consumerRoot, "legacy-carousel.tsx");
    await writeFile(
      codemodFixture,
      'import Carousel from "react-native-reanimated-carousel";\n<Carousel data={[]} renderItem={() => null} autoPlay />;\n'
    );
    run(process.execPath, [
      path.join(consumerNodeModules, packageName, "scripts", "codemods", "v5.mjs"),
      codemodFixture,
    ]);
    const migratedFixture = await readFile(codemodFixture, "utf8");
    assert.match(migratedFixture, /import\s*\{\s*Carousel\s*\}/);
    assert.match(migratedFixture, /\bautoplay\b/);
    assert.match(migratedFixture, /\bloop=\{true\}/);

    const consumerRequire = createRequire(path.join(consumerRoot, "consumer.cjs"));
    assert.match(
      consumerRequire.resolve(packageName),
      /lib[\\/]commonjs[\\/]index\.js$/,
      "CommonJS resolution must use the require condition"
    );
    assert.match(
      consumerRequire.resolve(`${packageName}/package.json`),
      /package\.json$/,
      "./package.json must remain exported"
    );
    assert.throws(
      () => consumerRequire.resolve(`${packageName}/src/types`),
      (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
      "deep imports must be blocked by the exports map"
    );

    const esmProbe = `
const root = import.meta.resolve("${packageName}");
if (!new URL(root).pathname.replaceAll("\\\\", "/").endsWith("/lib/module/index.js")) {
  throw new Error("ESM resolution did not use the import condition: " + root);
}
let blocked = false;
try {
  import.meta.resolve("${packageName}/src/types");
} catch (error) {
  blocked = error && error.code === "ERR_PACKAGE_PATH_NOT_EXPORTED";
}
if (!blocked) throw new Error("ESM deep import was not blocked");
`;
    run(process.execPath, ["--input-type=module", "--eval", esmProbe], { cwd: consumerRoot });

    await writeFile(
      path.join(consumerRoot, "package-resolution.test.cjs"),
      `test("uses the CommonJS package condition", () => {
  const resolved = require.resolve("${packageName}").split(require("node:path").sep).join("/");
  expect(resolved.endsWith("/lib/commonjs/index.js")).toBe(true);
  expect(() => require.resolve("${packageName}/src/types")).toThrow();
});
`
    );
    await writeFile(
      path.join(consumerRoot, "jest.config.cjs"),
      'module.exports = { testEnvironment: "node", testMatch: ["<rootDir>/*.test.cjs"] };\n'
    );
    run(
      process.execPath,
      [
        path.join(repositoryRoot, "node_modules", "jest", "bin", "jest.js"),
        "--config",
        "jest.config.cjs",
        "--runInBand",
      ],
      { cwd: consumerRoot }
    );

    await writeTypeConsumer(consumerRoot, "node");
    await writeTypeConsumer(consumerRoot, "bundler");

    console.log(
      JSON.stringify(
        {
          tarball: pathToFileURL(tarballPath).href,
          files: filePaths.length,
          checks: [
            "contents",
            "codemod",
            "commonjs",
            "esm",
            "jest",
            "typescript-node",
            "typescript-bundler",
          ],
        },
        null,
        2
      )
    );
  } finally {
    if (keepWorktree) {
      console.log(`Packed package worktree retained at ${workRoot}`);
    } else {
      await rm(workRoot, { recursive: true, force: true });
    }
  }
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});
