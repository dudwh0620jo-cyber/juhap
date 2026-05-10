# Contributing Rules

## Core principle
- Keep data and logic separate.
- Data must have a single source of truth.

## Scope and ownership
- `src/pages`: route-level page components.
- `src/components`: reusable UI blocks.
- `src/styles`: page/component styles.
- `src/data`: static data and mock datasets.
- `src/hooks`: reusable state/logic hooks.

## Naming and styling rules
- CSS class names use `snake_case`.
- TypeScript identifiers use `camelCase`.
- Use design tokens from `src/styles/common.css` `:root` when available.
- Do not add new token variables unless the value is reused across multiple screens.
- Keep page-specific styles in their page style file; put shared style rules in shared files only.

## Layout rules
- Mobile-first layout.
- Max app width: `430px`.
- Keep controls tappable on small screens.
- Preserve existing layout behavior unless the request explicitly asks for a behavior change.

## Typography rules
- Prefer even font sizes for consistency.
- Odd font sizes are allowed when matching an existing component, visual balance, or compact UI needs.
- Medium-sized UI text such as option labels, sheet buttons, filter labels, list labels, and general controls should usually use `font-weight: 500`.
- Avoid making medium-sized UI text overly bold by default.
- Use heavier weights only for clear hierarchy such as titles, product names, important prices/counts, active navigation, or established primary CTA styles.
- Before adding new font size or font weight values, check nearby existing styles first.

## Data placement
- Put static domain data under `src/data/**`.
- Use JSON for pure static values only (no logic, no comments, no computed fields).
- Use TypeScript wrapper files for types and exports from JSON.
- Prefer a flat `src/data` structure while the mock data is small.
- Split into domain folders only when a dataset becomes large, has several related files, or needs a clear module boundary.

## Import rules
- `src/pages/**` and `src/components/**` must not import `*.json` directly.
- Always import data through `src/data/**` TypeScript wrappers.

## Category filter rules
- Reuse shared constants and types; do not duplicate range constants and feature lists across pages.
- Keep UI-only state in page/components, but move reusable filter logic into shared hooks.

## Validation before merge
- Run `npm run verify` locally.
- Ensure lint and typecheck pass.
- Run `npm run check:encoding` and fix any mojibake before commit.
- Run `npm run check:mojibake` when editing Korean-heavy files.
- Run `npm run check:json` and fix broken JSON syntax before commit.

## Encoding rules
- Use UTF-8 without BOM for all text source files.
- Respect `.editorconfig` and `.gitattributes` as the single repo-wide encoding/EOL policy.
- Do not rely on editor-only workspace settings for shared rules.
- If using AI tools (Codex, Claude, etc.), require them to read this file first and follow these rules before editing.
- Avoid bulk overwrite commands for Korean-heavy files; prefer patch-based edits and immediate verification.

## Korean text safety rules
- Korean-heavy files must be edited with small patch-based changes only.
- Do not rewrite an entire file just to change a few labels or JSX blocks.
- Do not use bulk read/replace/write flows in shell for Korean-heavy files.
- Prefer `apply_patch` or editor-native line edits over PowerShell string replacement.
- After editing a Korean-heavy file, immediately run:
  - `npm run check:encoding`
  - `npm run check:mojibake`
  - `npm run typecheck`
  - `npm run lint` when the file affects UI or JSX
- If Korean text looks broken after an edit, stop and restore the file to the last known-good state before making the next change.

## High-risk files
- Treat these as high-risk for mojibake and patch them carefully:
  - `src/pages/CommunityWrite.tsx`
  - `src/pages/Community.tsx`
  - `src/pages/PairingDetail.tsx`
  - `src/pages/Category.tsx`
  - `src/pages/CategoryList.tsx`
  - `src/hooks/useHomePageData.ts`
  - `src/data/**/*.json`

## AI editing workflow
1. Read `CONTRIBUTING.md` before editing.
2. Check whether the target file is Korean-heavy or in the high-risk list.
3. Make the smallest possible patch.
4. Verify immediately.
5. Only then continue to the next patch.

## Data management details
### What goes to JSON
- Category trees
- Static labels and chips
- Default ranges
- Mock profile/static user metadata

### What stays in TypeScript
- Business logic
- Derived/computed values
- Matching/filtering functions
- Runtime validation and parsing

### Required structure
- Small mock data: `src/data/<name>.json` plus `src/data/<name>.ts`.
- Larger domain data: `src/data/<domain>/<name>.json` plus `src/data/<domain>/<name>.ts`.
- Optional `index.ts` only when it reduces imports and does not hide ownership.

### Change checklist
1. Update JSON
2. Update TS wrapper type if needed
3. Run `npm run verify`
4. Confirm affected UI flow

## PR checklist (copy into PR description)
- [ ] Followed `CONTRIBUTING.md`
- [ ] Data/logic separation respected
- [ ] No direct `*.json` import in pages/components
- [ ] `npm run verify` passed
- [ ] No unintended UI/layout regressions in affected pages
- [ ] Updated related docs when rules/structure changed
