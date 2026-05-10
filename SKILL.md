# Juhap AI Working Guide

## Source Of Truth

- `CONTRIBUTING.md` is the shared rulebook for Codex, Claude, and human contributors.
- Read `CONTRIBUTING.md` before editing.
- If this file and `CONTRIBUTING.md` conflict, follow `CONTRIBUTING.md`.

## Editing Workflow

1. Check whether the target file is listed as high-risk in `CONTRIBUTING.md`.
2. Make the smallest possible patch.
3. Preserve existing behavior unless the user explicitly asks for a behavior change.
4. Prefer reusable components, hooks, and data wrappers over duplicating logic.
5. Verify the affected files immediately after editing.

## Korean Text Safety

- Do not rewrite Korean-heavy files wholesale.
- Avoid shell-based bulk replacement or full-file writes for Korean-heavy files.
- Prefer `apply_patch` or editor-native small edits.
- If Korean text becomes mojibake, stop and restore the last known-good content before continuing.

## CSS And UI Rules

- Use existing CSS variables from `src/styles/common.css` when a matching token exists.
- Do not add new CSS variables unless the value is reused across multiple screens or approved.
- Prefer even font sizes, but allow odd sizes when matching existing components or visual balance.
- Medium-sized UI text usually uses `font-weight: 500`.
- Check nearby styles before introducing new font sizes, font weights, spacing, or colors.

## Data Rules

- Keep data and logic separate.
- Static mock/domain data belongs in `src/data`.
- Pages and components should import data through TypeScript wrappers, not directly from JSON.
- Keep mock data shaped like likely API responses, but do not over-split files while the mock is small.

## Before Finishing

- For code changes, run the smallest useful verification command.
- For JSON changes, run `npm run check:json`.
- For Korean-heavy edits, run encoding/mojibake checks when practical and report any existing failures clearly.
