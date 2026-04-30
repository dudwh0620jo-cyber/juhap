# Juhap Home DESIGN.md

## Product Context

Juhap is a responsive web app for alcohol and food pairing recommendations. The home screen should feel like a friendly daily dashboard: direct, useful, soft, and easy to scan.

## Data Rule

- Backend-connected content must use local mock data until APIs are available.
- Keep mock data in a clear object that resembles a future home API response.
- Render recommendations, votes, rankings, weekly drink details, quiz CTA, and bottom navigation from mock data.
- Alcohol and food pairing text must use `+` between the drink and food names.

## Responsive Rule

- Support tablet screens down to 320px mobile screens.
- Mobile app surface max width: `430px`.
- On tablet and larger viewports, keep the app surface centered unless a later screen requires a wider layout.
- At 320px width, text must not overlap, controls must remain tappable, and long pairing names should truncate cleanly.

## Visual Theme

- Calm light gray background.
- White rounded content blocks.
- Dark recommendation cards only where image-like contrast is needed.
- Minimal gradients. Use them only as small image placeholders, never as the main page background.
- Avoid decorative blobs, oversized hero layouts, and marketing-style sections.

## Color Palette

- Page background: `#d9d9d9`
- Primary text: `#222222`
- Secondary text: `#606060`
- Muted text: `#8f8f8f`
- Surface: `#ffffff`
- Dark card: `#222222`
- Border: `#8b877f`
- Soft accent: `#fff4c8`
- Active tab: `#fff4c8`
- Disabled pill: `#9d9d9d`

## Typography

- Use the system sans-serif stack.
- H1 greeting: 20px, 700 weight.
- Section title: 20px, 800 weight.
- Body labels: 14px to 16px.
- Small metadata: 11px to 13px.
- Letter spacing should remain normal.

## Layout Rules

- Horizontal page padding: 24px to 28px on standard mobile.
- Reduce horizontal padding on narrow screens.
- Bottom padding must leave room for fixed tab navigation.
- Section spacing: 32px to 42px.
- Card radius: 8px for content cards, 18px to 24px for soft voting blocks.
- Touch targets should be at least 40px tall.

## Components

### Header

- Left greeting: `Hi 주합러!`
- Right circular notification button labeled `알림`.

### AI Recommendation

- Rounded bordered horizontal card.
- Left mascot symbol.
- Text:
  - `AI 주식 분석`
  - `지금 마시는 술, 어떤 음식이 어울릴까?`
- Right camera button.

### Today Recommendation

- Title: `오늘의 추천`
- Subtitle: `비 오는 화요일, 와인 한 잔`
- Horizontal scrolling cards.
- Each card has a small badge, image-like top, dark text bottom.
- Use pairing examples:
  - `진로 이즈백 + 삼겹살`
  - `한라산 + 방어회`
  - `카베네 소비뇽 + 고다치즈`

### Vote Section

- Title: `불금에 어울리는 조합은?`
- Two white rounded option cards separated by `vs`.
- Options:
  - `맥주에 피자다`
  - `와인에 스테이크다`
- Progress placeholder: `--%`
- Button text: `투표하고 현황보기`

### Ranking

- Title: `이번 주의 조합 랭킹`
- White pill list items.
- Ranking data:
  1. `한라산 + 방어회`
  2. `카베네 소비뇽 + 고다치즈`
  3. `발베니 12년 + 다크초콜릿`
  4. `처음처럼 + 삼겹살`
  5. `짐빔하이볼 + 어텀크리스피청포도`
- Add a right aligned `더보기` action.

### Weekly Drink

- Title: `금주의 주류 소개`
- Product name: `케이머스 나파 밸리 카베네 소비뇽 2023`
- Details:
  - `종류 : 레드와인`
  - `생산지 : 미국(U.S.A), California`
  - `품종 : Cabernet Sauvignon`
  - `평점 : 4.0`
  - `당도 : 낮은 당도`
- Bottle can be represented with a simple CSS illustration until real product assets are added.

### Quiz CTA

- White rounded block.
- Text: `퀴즈 풀고 포인트 받자!`

### Bottom Navigation

- Fixed to the bottom of the mobile viewport.
- Tabs: `홈`, `카테고리`, `채팅`, `커뮤니티`, `마이`
- Active tab: `채팅`
- Keep tab labels simple and readable.
