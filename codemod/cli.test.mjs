import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { before } from "node:test";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("./cli.mjs", import.meta.url));
const source = `import Carousel from "react-native-reanimated-carousel";

export const Example = () => <Carousel data={[1]} renderItem={() => null} autoPlay />;
`;

function run(args, cwd) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8" });
}

async function fixture() {
  const dir = await mkdtemp(path.join(tmpdir(), "rnrc-codemod-"));
  await writeFile(path.join(dir, "App.tsx"), source);
  return dir;
}

before(() => {
  const sync = spawnSync(
    process.execPath,
    [fileURLToPath(new URL("./sync-transforms.mjs", import.meta.url))],
    { encoding: "utf8" }
  );
  assert.equal(sync.status, 0, sync.stderr);
});

test("prints usage for a missing or unknown version", () => {
  const missing = run([]);
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /Usage: npx rnrc-codemod <version>/);
  assert.match(missing.stderr, /Versions: v5/);

  assert.equal(run(["v4", "."]).status, 2);
  assert.equal(run(["v5"]).status, 2);
});

test("v5 --dry previews changes without writing", async () => {
  const dir = await fixture();
  try {
    const result = run(["v5", "--dry", "."], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /would update App\.tsx/);
    assert.equal(await readFile(path.join(dir, "App.tsx"), "utf8"), source);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("v5 rewrites files in place", async () => {
  const dir = await fixture();
  try {
    const result = run(["v5", "."], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /updated App\.tsx/);
    const output = await readFile(path.join(dir, "App.tsx"), "utf8");
    assert.match(output, /import \{ Carousel \} from "react-native-reanimated-carousel"/);
    assert.match(output, /\bautoplay\b/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
