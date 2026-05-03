# Juhap Design Rules

## Project Structure

- Page components live in `src/pages`.
- Home screen: `src/pages/Home.tsx`
- Category screen: `src/pages/Category.tsx`
- Community and ranking screen: `src/pages/Community.tsx`
- Pairing detail screen: `src/pages/PairingDetail.tsx`
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
- Backend에서 내려오는 데이터(랭킹/피드/상세/댓글 등)는 API 연결 전까지 더미 데이터로 구성한다.
- Keep mock data in clear objects that resemble future API responses.
- Alcohol-food pairing labels use `주류 + 음식` format.
- 커뮤니티 페어링 더미 데이터는 검색 필터를 위해 `주종/카테고리/상세카테고리/특징/음식` 메타를 함께 가진다.
- 기능을 추가할 때는, 별도 수정 요청이 없는 기존 UI/동작은 그대로 둔다(기존 기능이 사라지거나 동작이 바뀌지 않게 유지).

- User grade labels:
  - 페어링 등급(커뮤니티 글/댓글 작성자): `뉴비 맛잘알` → `찐조합러` → `미식 탐험가` → `페어링 고수` → `조합 장인`
  - 주류 추천 등급(제품 상세 리뷰 작성자): `테이스터` → `셀렉터` → `큐레이터` → `소믈리에` → `마스터`

## Layout Rules

- Mobile-first, centered app surface.
- Max app width: `430px`.
- Support tablet down to `320px`.
- Use a base `4px` rhythm for spacing.
- Keep controls tappable and text non-overlapping on small screens.
- Grid 기반 페이지 레이아웃(`display: grid`)은 기본값(`align-content: stretch`) 때문에 화면 높이에 따라 섹션 간 간격이 과하게 벌어질 수 있으니, 섹션들이 항상 상단에 붙도록 `align-content: start`를 사용한다.

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
  - 사케: `다이긴죠 / 긴죠`, `준마이`, `혼죠조 / 일반주`
  - 기타: `하이볼`, `칵테일 (Mix)`, `논알콜/저도수 (Sober)`
- `음식` groups:
  - 간편식: `편의점 안주`, `배달`, `냉동식품`, `과자/스낵`, `홈파티 핑거푸드`, `디저트`
  - 한식: `구이류`, `찌개/국물`, `회/해산물`, `매운맛`, `발효류(김치/젓갈)`
  - 중식: `마라/향신료`, `딤섬`, `짜장/짬뽕류`
  - 일식: `스시/회`, `라멘`, `튀김/카츠`, `이자카야류`
  - 양식: `파스타`, `스테이크`, `치즈/샤퀴테리`, `피자`
  - 세계: `멕시칸`, `아시안`, `그외`
- `소주 > 플레이버` 카드에는 `i` 버튼을 두고, 클릭 시 설명 말풍선(5초 노출 후 페이드아웃)을 보여준다.
- 카테고리 소분류 카드 버튼은 공통 스타일을 사용한다(특정 항목만 `i` 버튼/말풍선 등 추가 요소를 더한다).
- 소분류 카드를 터치하면 카테고리 리스트 화면으로 이동한다.
- 카테고리 화면의 `검색하기`는 input이며, 현재 선택된 대분류의 소분류 항목을 텍스트 포함 검색으로 필터링한다.
- `주류` 탭에서 검색어가 대분류 라벨과 매칭되면(예: `와인`), 해당 대분류의 소분류 전체를 결과로 보여준다.
- 이때 검색 결과의 소분류를 선택하면, 선택된 소분류가 속한 대분류를 기준으로 `대분류>소분류`가 구성되어야 한다(검색 전 선택된 대분류 기준으로 고정하지 않음).
- 검색 input에 텍스트가 있을 때 우측에 `확인` 버튼을 노출하며, 버튼은 줄바꿈/아래로 내려가지 않게 한 줄로 유지한다.

## Category List Screen

- Route: `/category/list?group=<대분류>&sub=<소분류>`
- 상단에는 `검색하기` input이 있고, 그 아래에 `대분류>소분류` 타이틀을 보여준다.
- 검색 input은 리스트 내 아이템을 텍스트 포함 검색으로 필터링한다(상품명/태그).
- 소분류 페이지의 검색은 소분류 연관어(동의어/영문/스타일명 등 더미 키워드)도 함께 매칭한다.
- 검색어가 입력되면, 제품 리스트는 소분류보다 더 하위 분류(더미 기준 `subGroup`)로 섹션을 나눠 보여준다.
- 검색어가 입력되면, 제품 리스트는 검색어 매칭 우선순위에 따라 정렬한다(상품명 > 하위분류명 > 태그 > 키워드).
- 검색 확정(우측 `확인`) 후 결과가 0건이면 “검색 결과 없음” 문구는 노출하지 않고, 아래에 비슷한 카테고리/키워드 추천(태그/하위분류 기반) 칩만 노출한다. 기존 리스트는 계속 노출한다.
- 검색 input에 텍스트가 있을 때 우측에 `확인` 버튼을 노출하며, 버튼은 줄바꿈/아래로 내려가지 않게 한 줄로 유지한다.
- 리스트는 흰색 라운드 카드로 구성하며, 좌측 썸네일/중앙 텍스트/우측 화살표 버튼으로 배치한다.
- 소분류 검색 시 결과 개수(예: 1개)에 따라 리스트 컨테이너 높이가 과하게 늘어나지 않도록, 리스트 자체에 `min-height`로 높이를 강제하지 말고 페이지 기본 패딩(예: `.page_screen`의 하단 패딩)으로 아래 여백을 확보한다(타이틀/상단 간격이 흔들리지 않게 유지).

## Community Ranking Screen

- Top segmented control: `랭킹`, `커뮤니티`.
- 커뮤니티 공통 검색 팝업(피드/랭킹 공통):
  - 상단: 왼쪽 `취소` 버튼 + 입력바(왼쪽 돋보기, placeholder: `조합, 주류, 안주 검색`)
  - 섹션 순서: `주종` → `카테고리` → `상세카테고리` → `특징` → `음식` → `최근검색`
  - 필터 동작:
    - `주종`은 단일 선택(1개만 선택 가능), 선택 시 해당 `카테고리`만 노출
    - 상위 카테고리 변경으로 하위 옵션이 비활성/비노출되는 경우, 해당 하위 선택은 자동으로 선택 해제(초기화)된다
    - `카테고리`는 중복 선택 가능, 선택된 카테고리 기준으로 `상세카테고리` 옵션이 확장됨
    - `상세카테고리`는 중복 선택 가능, 선택된 상세카테고리 기준으로 `특징` 옵션이 확장됨
    - `특징`은 중복 선택 가능(OR 매칭), 선택된 특징에 해당하는 피드 글이 검색 결과로 표시됨
- Ranking layout includes:
  - Period buttons (`주간`, `일간`, `월간`, `전체`)
  - Category chips (`전체`, `소주`, `와인`, `맥주`, `위스키/증류주`, `전통주`, `사케`, `기타`)
  - Podium section for ranks 1, 2, 3
  - Rounded ranking rows with rank, pair text, score, vote count, delta, category pill
- 랭킹/피드의 글(페어링 콘텐츠) 행은 페어링 상세 페이지로 이동해야 함.
- Feed 탭 필터: `후기(최신순)`, `자유(Q&A)`, `인기(인기순)`, `팔로우(팔로우한 사람들의 피드)`.
- Feed 카드 규칙:
  - 사진 영역은 가로 스와이프(스크롤) + 스냅이 되어야 함.
  - title + body 영역 터치 시 해당 랭킹 상세로 이동해야 함.
  - 하단 액션은 좌→우 순서로 `좋아요(토글)`, `댓글(상세 댓글 섹션 이동)`, `공유(더미)`, `북마크(확인 후 토글)`.
  - 카드 우측 상단 팔로우 버튼은 상태 기반:
    - `팔로우` 탭: 항상 `언팔로우`(팔로잉 피드이므로).
    - 그 외 탭: 팔로우 중이면 `언팔로우`, 아니면 `팔로우`.
  - 후기 탭에는 우측 하단 `+` 글쓰기 FAB가 있으며, 초기 로딩/정지 상태에서는 숨김이고 스크롤을 내려야 노출됨.

## Pairing Detail Screen

- Includes profile header with location chip.
- Header follow button:
  - Toggles follow state for the post author (`팔로우` / `언팔로우`).
  - Persist follow state in `localStorage` for mock behavior.
- Image row is horizontally swipeable (scroll-snap).
- Includes image row, pairing title, tags, and long description.
- Includes product card and recommendation panel.
  - Product card uses mock recommendation based on the pairing's `주종` (left side of `주류 + 음식`).
- Recommendation banner toggles recommend state (tap: +1, tap again: -1) and persists per pairing in `localStorage`.
- Includes action row, similar pairing list, comments, and bottom comment input.
- Similar pairing list uses mock data and navigates to another pairing detail when tapped.
- Like button toggles like state (tap: +1, tap again: -1) and is reflected in the community list via shared `localStorage`.
- Comments:
  - User can add a comment.
  - Comments written by the current user can be edited or deleted.
  - Persist comments per pairing in `localStorage` so they remain after navigation.
- 댓글 섹션은 `#comments` 해시로 진입 시 해당 위치로 스크롤되어야 함.

### Route

- Route: `/community/pairing/:pairingId`

## Chat Screen

- Opens as a sheet-like overlay modal.
- Starts with large AI mascot and suggestion buttons.
- Switches to compact chat state when suggestion is chosen or input gains focus.

## Product Detail Screen

- Route: `/product/:id`
- Layout includes:
  - Top header with back button + home/share icons.
  - Large product image area.
  - Breadcrumb + product name + price row + 인증마크(체크 아이콘).
  - Tabs: `술정보`, `후기`, `페어링추천`.
  - `술정보`: spec table, taste bars, tasting notes, long description, online purchase cards.
  - `후기`: 주류(제품 자체)에 대한 리뷰 리스트.
  - `페어링추천`: 음식과의 페어링에 대한 리뷰/콘텐츠 리스트(후기 탭 리뷰와 의미가 다름).
- 온라인 구매처(상점명) 클릭 시 즉시 이동하지 않고 “이동할까요?” 확인 모달을 띄운 뒤, 확인하면 외부 링크로 이동한다.
- 온라인 구매처는 카드(`purchase_card`) 전체 영역이 탭 가능해야 한다.
