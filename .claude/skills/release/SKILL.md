---
name: release
description: Review current branch changes and create concise Changesets release notes with preview/confirmation before writing files. Use when asked to prepare release notes, create or update .changeset entries, or sanity-check release readiness.
---

# Release Skill

Use this skill to generate release-ready changeset entries in the repository style.

## Scope

- Review current branch changes.
- Propose release impact (major/minor/patch) from code diffs.
- Draft concise changeset bullets.
- Preview and ask for explicit user confirmation.
- Create or update `.changeset/*.md` only after confirmation.

## Required style

Follow `.changeset/STYLE.md` strictly:

1. Bullet-only summary lines (`- ...`).
2. 1-6 bullets, each concise and user-facing.
3. No headings, code blocks, root-cause sections, or file lists.
4. Keep implementation detail in PR discussion/docs, not release notes.

Target package frontmatter:

```yaml
---
"react-native-reanimated-carousel": patch
---
```

Replace `patch` with `minor` or `major` when justified.

## Workflow

1. Gather branch context.
- Run `git status --short`.
- Run `git diff --name-status origin/main...HEAD`.
- If `origin/main` is unavailable, fallback to `git diff --name-status main...HEAD`.
- Review commit titles with `git log --oneline --no-merges origin/main..HEAD` (or fallback).

2. Detect existing pending changesets.
- List `.changeset/*.md` excluding `README.md`, `STYLE.md`, `config.json`, `pre.json`.
- If a suitable pending changeset exists, prefer updating it instead of creating duplicates.

3. Infer bump recommendation from diff.
- Build signals from changed files and commit intent:
  - Breaking/API risk signals: removed or renamed public props/exports/types, stricter peer dependency floor, explicit migration-required notes.
  - Feature signals: new props/options/apis/behaviors that are backward compatible.
  - Fix signals: bug fixes, tests, docs, refactors without new public API.
- Select a primary recommendation:
  - `major` when breaking/API risk signals are present.
  - `minor` when feature signals dominate and no breaking signal exists.
  - `patch` when only fix signals exist.
- Always prepare one alternative recommendation when uncertainty exists.

4. Produce a preview for user confirmation.
- Show `Proposed bump` with confidence (`high`/`medium`/`low`).
- Show `Why` with 2-4 concise evidence bullets from actual diff/commits.
- Show `Alternative bump options` with one-line tradeoff for each.
- Show exact markdown content to be written.
- Ask: `Reply with confirm to write this changeset, or tell me what to edit.`

5. Only after explicit confirmation, write file changes.
- Create a kebab-case file name, e.g. `.changeset/release-<topic>.md`.
- Or update the agreed existing changeset file.

6. Validate.
- Run `node scripts/check-changeset-style.mjs`.
- If validation fails, fix and re-run until pass.
- Optionally run `yarn changeset:check` if dependencies are installed.

7. Report result.
- Return the file path, bump type, final bullets, and validation result.

## Decision rules for bump type

- `patch`: bug fixes, behavior corrections, internal improvements with backward compatibility.
- `minor`: backward-compatible features, new props/options/behavior.
- `major`: breaking API/behavior/dependency requirements requiring migration.

If uncertain between two bump levels, surface both options in preview and ask user to choose before writing.

## Output contract

When previewing, always include:

1. `Proposed bump:`
2. `Confidence:`
3. `Why:`
4. `Alternative bump options:`
5. `Draft changeset:` fenced markdown block
6. `Confirmation prompt`

Never write or modify `.changeset/*.md` before explicit `confirm`.
