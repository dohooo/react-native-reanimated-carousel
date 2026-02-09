# Release Notes Style Guide

Goal: keep GitHub Releases short, scannable, and user-facing.

## Rules for every changeset file

1. Use bullet-only summaries after frontmatter.
2. Keep each bullet to one concise sentence (max 160 chars).
3. Keep total bullets per file at 1-6.
4. Focus on user impact, not internal implementation details.
5. Put deep analysis in PR description or docs, not release notes.

## Allowed

- Fix gesture blocking when `style={{ flex: 1 }}` is used.
- Deprecate `width`/`height` in favor of style-based sizing.

## Not allowed

- Root-cause sections (`Root Cause`, `Solution`, `Affected Files`).
- Markdown headings (`#`, `##`) in summary body.
- Code blocks in summary body.

## Validation

Run:

```bash
yarn changeset:check
```

CI runs the same check.
