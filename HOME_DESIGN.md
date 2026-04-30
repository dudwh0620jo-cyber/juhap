# Juhap Design Rules

## Project Structure

- Page components live in `src/pages`.
- Home screen: `src/pages/Home.tsx`
- Category screen: `src/pages/Category.tsx`
- Community and ranking screen: `src/pages/Community.tsx`
- Ranking detail screen: `src/pages/RankingDetail.tsx`
- Chat modal: `src/pages/Chat.tsx`
- Page-specific CSS lives in `src/styles`.
- Shared layout and bottom navigation styles live in `src/styles/common.css`.

## CSS Rules

- Always import `src/styles/reset.css` in `src/main.tsx` before any other style.
- Shared tokens (font family, font size, color) are registered as CSS variables in `src/styles/common.css` `:root`.
- Use a registered variable whenever the value exists in `:root`. Do not hardcode the raw value.
- If a value is not registered in `:root` (e.g. `#000000`), use the raw value as-is. Do not add new variables to `:root` just to use them.

### Registered font families
| Variable | Value |
|---|---|
| `--font-title` | "Noto Serif KR", serif |
| `--font-main` | "Pretendard Variable", sans-serif |

### Registered font sizes
| Variable | px |
|---|---|
| `--fs-display` | 32px |
| `--fs-title-l` | 28px |
| `--fs-title-m` | 24px |
| `--fs-h2` | 28px |
| `--fs-h3` | 24px |
| `--fs-h4` | 20px |
| `--fs-h5` | 18px |
| `--fs-h6` | 16px |
| `--fs-small` | 14px |

### Registered colors
| Variable | Hex |
|---|---|
| `--color-main-01` | #F6ECD9 |
| `--color-main-02` | #E4D2A7 |
| `--color-main-03` | #CA9E52 |
| `--color-main-04` | #A17C3B |
| `--color-main-05` | #7A5C2B |
| `--color-sub-01` | #FFFFFF |
| `--color-sub-02` | #F7F3EC |
| `--color-sub-03` | #E5DED3 |
| `--color-sub-04` | #CFC6B8 |
| `--color-sub-05` | #B5AA99 |
| `--color-gray-01` | #FFFFFF |
| `--color-gray-02` | #F2F2F2 |
| `--color-gray-03` | #D9D9D9 |
| `--color-gray-04` | #BFBFBF |
| `--color-gray-05` | #8C8C8C |
| `--color-dark-01` | #F5F5F5 |
| `--color-dark-02` | #BDBDBD |
| `--color-dark-03` | #757575 |
| `--color-dark-04` | #424242 |
| `--color-dark-05` | #212121 |

## Naming Convention

- CSS class names use `snake_case`.
- JavaScript and TypeScript identifiers use `camelCase`.

## Product And Data Rules

- Use mock data for backend-driven sections until API integration is ready.
- Keep mock data in clear objects that resemble future API responses.
- Alcohol-food pairing labels use `주류 + 음식` format.

## Layout Rules

- Mobile-first, centered app surface.
- Max app width: `430px`.
- Support tablet down to `320px`.
- Use a base `4px` rhythm for spacing.
- Keep controls tappable and text non-overlapping on small screens.

## Visual Rules

- Calm light gray background.
- White rounded cards for primary content.
- Minimal gradients only for image-like placeholders.
- Avoid decorative blobs and marketing-style hero composition.

## Navigation Rules

- Bottom navigation tabs: `홈`, `카테고리`, `채팅`, `커뮤니티`, `마이`.
- `채팅` is an overlay modal, not a full page transition.
- Active tab state is route-based except for modal chat open state.

## Category Screen

- Top tabs: `주류`, `음식`.
- Build `주류` first with left group navigation and right subcategory cards.
- `주류` groups:
  - 소주: `데일리(희석식)`, `프리미엄(증류식)`, `플레이버`
  - 와인: `레드`, `화이트`, `로제`, `스파클링`, `내추럴 와인`
  - 맥주: `라거/필스너`, `에일/IPA`, `흑맥주(스타우트)`, `과일맥주`
  - 위스키/증류주: `싱글몰트`, `블렌디드`, `버번`, `진/보드카`, `테킬라`, `럼`
  - 전통주: `막걸리/탁주`, `청주/약주`, `과실주`
  - 기타: `하이볼`, `칵테일 (Mix)`, `논알콜/저도수 (Sober)`

## Community Ranking Screen

- Top segmented control: `랭킹`, `커뮤니티`.
- Ranking layout includes:
  - Period buttons (`주간`, `일간`, `월간`, `전체`)
  - Category chips (`전체`, `와인`, `증류주`, `맥주`, `위스키`, `전통주`)
  - Podium section for ranks 1, 2, 3
  - Rounded ranking rows with rank, pair text, score, vote count, delta, category pill
- Ranking rows must link to ranking detail routes.

## Ranking Detail Screen

- Includes profile header with location chip.
- Includes image row, pairing title, tags, and long description.
- Includes product card and recommendation panel.
- Includes action row, similar pairing list, comments, and bottom comment input.

## Chat Screen

- Opens as a sheet-like overlay modal.
- Starts with large AI mascot and suggestion buttons.
- Switches to compact chat state when suggestion is chosen or input gains focus.
