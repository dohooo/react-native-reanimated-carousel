# Release Notes Style Guide

Goal: keep GitHub Releases short, scannable, and user-facing.

## Rules for every changeset file

1. Start with one plain summary sentence after frontmatter; do not prefix it with a list marker.
2. Add optional follow-up details as `- ...` bullets.
3. Keep every line concise (max 160 chars) and use at most 6 lines per file.
4. Focus on user impact, not internal implementation details.
5. Put deep analysis in PR description or docs, not release notes.

This matches `@changesets/changelog-github`, which adds the top-level release bullet itself.

## Allowed

```md
Fix gesture blocking when `style={{ flex: 1 }}` is used.
- Preserve explicit sizing behavior.
```

## Not allowed

- Root-cause sections (`Root Cause`, `Solution`, `Affected Files`).
- Markdown headings (`#`, `##`) in summary body.
- Code blocks in summary body.
- A list marker on the first summary line, because it renders as `- - ...` in the changelog.

## Validation

Run:

```bash
yarn changeset:check
```

CI runs the same check.
