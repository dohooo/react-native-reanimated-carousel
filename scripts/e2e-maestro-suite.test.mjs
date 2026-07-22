import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

async function runFixture({ exitCode = 1, failure, legacyFilter = false }) {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "maestro-retry-"));

  try {
    const flowDir = path.join(fixtureRoot, "flows");
    const logDir = path.join(fixtureRoot, "logs");
    const maestroPath = path.join(fixtureRoot, "maestro");
    const statePath = path.join(fixtureRoot, "attempts");

    await mkdir(flowDir);
    await writeFile(
      path.join(flowDir, "01-driver-reconnect.yaml"),
      "name: Retry filtering\n"
    );
    await writeFile(
      maestroPath,
      `#!/usr/bin/env bash
set -euo pipefail

attempt=0
if [ -f "$FAKE_MAESTRO_STATE" ]; then
  attempt=$(cat "$FAKE_MAESTRO_STATE")
fi
attempt=$((attempt + 1))
echo "$attempt" > "$FAKE_MAESTRO_STATE"

if [ "$attempt" -eq 1 ] || [ "$FAKE_MAESTRO_RECOVERS" != "1" ]; then
  echo "$FAKE_MAESTRO_FAILURE"
  exit "$FAKE_MAESTRO_EXIT_CODE"
fi

echo "Flow completed"
`,
      { mode: 0o755 }
    );
    const result = spawnSync(
      "bash",
      [path.join(repoRoot, "scripts/e2e-maestro-suite.sh"), flowDir],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          E2E_APP_ID: "com.example",
          FAKE_MAESTRO_EXIT_CODE: String(exitCode),
          FAKE_MAESTRO_FAILURE: failure,
          FAKE_MAESTRO_RECOVERS: "1",
          FAKE_MAESTRO_STATE: statePath,
          GITHUB_WORKSPACE: repoRoot,
          MAESTRO_BIN: maestroPath,
          MAESTRO_FAIL_FAST: "1",
          MAESTRO_FLOW_LOG_DIR: logDir,
          MAESTRO_FLOW_MAX_ATTEMPTS: "2",
          MAESTRO_FLOW_TIMEOUT_SECONDS: "5",
          MAESTRO_RETRY_IOS_VIEW_HIERARCHY_TIMEOUTS_ONLY: legacyFilter
            ? "1"
            : "0",
          MAESTRO_RETRY_IOS_TRANSIENT_DRIVER_FAILURES_ONLY: "1",
          MAESTRO_REUSE_DRIVER_BETWEEN_FLOWS: "0",
        },
      }
    );

    return {
      attempts: Number.parseInt(await readFile(statePath, "utf8"), 10),
      result,
    };
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
}

test("retries an iOS driver connection failure with the legacy filter enabled", async () => {
  const { attempts, result } = await runFixture({
    failure:
      "Unable to set permissions for app com.example: Failed to connect to /127.0.0.1:58631",
    legacyFilter: true,
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.equal(attempts, 2);
  assert.match(result.stdout, /Retrying iOS Maestro driver connection failure/);
});

test("preserves retries for an iOS view-hierarchy timeout", async () => {
  const { attempts, result } = await runFixture({
    exitCode: 124,
    failure: "kAXErrorInvalidUIElement",
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.equal(attempts, 2);
  assert.match(result.stdout, /Retrying iOS view-hierarchy driver timeout/);
});

test("does not retry a non-driver Maestro failure", async () => {
  const { attempts, result } = await runFixture({
    failure: "Assertion failed: expected Current Index: 1",
  });

  assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
  assert.equal(attempts, 1);
  assert.match(
    result.stdout,
    /Not retrying because this was not a transient iOS Maestro driver failure/
  );
});
