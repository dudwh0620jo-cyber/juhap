# Juhap Design Rules

## Project Structure

- Page components live in `src/pages`.
- Home screen work belongs in `src/pages/Home.tsx`.
- Community screen work belongs in `src/pages/Community.tsx`.
- Chat screen work belongs in `src/pages/Chat.tsx`.
- Ranking detail work belongs in `src/pages/RankingDetail.tsx`.
- Page-specific CSS belongs in `src/styles`.
- Shared layout, reset, viewport, and bottom navigation styles belong in `src/styles/common.css`.

## Product Context

Juhap is a responsive web app for alcohol and food pairing recommendations. Screens should feel like a friendly daily dashboard: direct, useful, soft, and easy to scan.

## Data Rule

- Backend-connected content must use local mock data until APIs are available.
- Keep mock data in clear objects that resemble future API responses.
- Render all page content from mock data.
- Alcohol and food pairing text must use `+` between the drink and food names.

## Naming Convention

- CSS class names use `snake_case`.
- JavaScript and TypeScript identifiers use `camelCase`.

## Visual Theme

- Calm light gray background with a centered app surface.
- White rounded content blocks for primary content.
- Dark recommendation cards only where image-like contrast is needed.
- Minimal gradients. Use them only as small image placeholders, never as the main page background.
- Avoid decorative blobs, oversized hero layouts, and marketing-style sections.

## Layout Principles

- Use a base `4px` rhythm.
- Prefer these spacing tokens:
  - `xs = 4px`
  - `sm = 8px`
  - `md = 12px`
  - `lg = 16px`
  - `xl = 24px`
  - `2xl = 32px`
  - `3xl = 40px`
  - `4xl = 64px`
- Use horizontal page padding of `24px` on standard mobile screens.
- Reduce page padding to `18px` on narrow screens around `374px` and below.
- Keep page sections stacked with `32px` to `40px` vertical rhythm.
- Use tighter internal gaps of `8px` to `16px` inside cards and controls.
- Keep the app surface centered on larger screens instead of stretching content edge to edge.

## Responsive Behavior

- Support tablet screens down to `320px` mobile screens.
- At `320px`, text must not overlap, controls must remain tappable, and long labels should truncate cleanly.
- On narrow screens, reduce horizontal padding before reducing type size.
- Horizontal content should scroll intentionally rather than compress into unreadable widths.
- Keep bottom navigation readable at all widths with stable tap targets.

## Navigation

- The bottom navigation is shared across pages.
- Tabs: `홈`, `카테고리`, `채팅`, `커뮤니티`, `마이`.
- Active tab state is route-based.
- `커뮤니티` routes to `/community`.
- `채팅` routes to `/chat`.

## Home Screen

- Use `src/pages/Home.tsx` and `src/styles/home.css`.
- Keep pairing labels in `주류 + 음식` format.

## Community Screen

- Use `src/pages/Community.tsx` and `src/styles/community.css`.
- Top segmented control: `랭킹`, `피드`.
- Feed filters: `후기`, `질문`, `인기`, `팔로우`.
- Ranking rows should link to ranking detail pages.

## Category Screen

- Use `src/pages/Category.tsx` and `src/styles/category.css`.
- Top tabs: `주류`, `음식`.
- Build `주류` tab first with a left group navigation and right subcategory cards.
- `주류` groups:
  - 소주: `데일리(희석식)`, `프리미엄(증류식)`, `플레이버`
  - 와인 (Wine): `레드`, `화이트`, `로제`, `스파클링`, `내추럴 와인`
  - 맥주 (Beer): `라거/필스너`, `에일/IPA`, `흑맥주(스타우트)`, `과일맥주`
  - 위스키/증류주 (Spirits): `싱글몰트`, `블렌디드`, `버번`, `진/보드카`, `테킬라`, `럼`
  - 전통주 (Traditional): `막걸리/탁주`, `청주/약주`, `과실주`
  - 기타: `하이볼`, `칵테일 (Mix)`, `논알콜/저도수 (Sober)`

## Chat Screen

- Use `src/pages/Chat.tsx` and `src/styles/chat.css`.
- Chat opens as a modal sheet that slides up from the bottom.
- Initial state:
  - Large AI mascot.
  - Intro suggestion text.
  - Three recommendation buttons.
- Transition trigger:
  - Clicking any recommendation button.
  - Focusing the chat input.
- After transition:
  - AI mascot shrinks and moves to a chat bubble row.
  - Selected recommendation appears as a chip.

## Agent Working Notes

- Before building a new page, read this file and match spacing tokens before introducing new ones.
- Add new reusable layout rules here before spreading one-off values.
- Prefer `common.css` changes only for truly cross-page behavior.
