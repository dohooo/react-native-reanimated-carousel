import assert from "node:assert/strict";
import test from "node:test";

import { checkChangeset } from "./check-changeset-style.mjs";

const wrap = (body) => `---
"react-native-reanimated-carousel": patch
---

${body}
`;

test("accepts a plain summary line", () => {
  assert.deepEqual(checkChangeset(wrap("Fix carousel sizing.")), []);
});

test("accepts optional follow-up bullets", () => {
  assert.deepEqual(
    checkChangeset(
      wrap("Fix carousel sizing.\n- Preserve explicit dimensions.")
    ),
    []
  );
});

test("accepts the constrained agent migration release section", () => {
  assert.deepEqual(
    checkChangeset(
      wrap(`Prepare the next major release.
- Link the complete migration guide.

### Migrate with your AI agent

\`\`\`text
Read the migration guide and upgrade this project.
\`\`\`

The agent leaves all changes ready for review.`)
    ),
    []
  );
});

test("rejects a malformed agent migration release section", () => {
  assert.deepEqual(
    checkChangeset(
      wrap(`Prepare the next major release.

### Migrate with your AI agent

\`\`\`text
This prompt
wraps onto two lines.
\`\`\`

Review the result.`)
    ),
    [
      "agent migration section must contain one single-line text prompt and one single-line review note",
    ]
  );
});

test("rejects a list marker on the summary line", () => {
  assert.deepEqual(checkChangeset(wrap("- Fix carousel sizing.")), [
    'summary line must not start with a list marker: "- Fix carousel sizing."',
  ]);
});

test("requires follow-up lines to be bullets", () => {
  assert.deepEqual(
    checkChangeset(wrap("Fix carousel sizing.\nPreserve explicit dimensions.")),
    [
      'detail line must start with "- ": "Preserve explicit dimensions."',
    ]
  );
});
