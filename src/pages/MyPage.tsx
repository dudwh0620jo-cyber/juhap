import { useState } from "react"
import PreferenceGroupSection from "../components/PreferenceGroupSection"
import {
  MAX_MULTI_SELECTIONS,
  NONE_OPTION,
  preferenceGroups,
  type PreferenceGroup,
} from "../data/setupContent"
import {
  readUserProfile,
  updateUserTastePreferences,
  type UserTastePreferences,
} from "../data/userProfile"
import { COMMUNITY_FOLLOWED_USERS_KEY } from "../utils/communityStorage"
import { useStoredNumberSet } from "../utils/storage"
import { defaultFollowedUserIdsMock } from "../utils/usersMock"
import "../styles/my.css"

type ExchangeItem = {
  icon: string
  title: string
  description: string
  tags: string[]
  point: string
}

const activityStats = [
  { value: 47, label: "기록" },
  { value: 23, label: "투표 참여" },
  { value: 8, label: "후기 작성" },
  { value: 14, label: "저장" },
]

const tasteBars = [
  { label: "바디", value: 35, level: "가벼움", className: "body" },
  { label: "쓴맛", value: 75, level: "강함", className: "bitter" },
  { label: "단맛", value: 30, level: "약함", className: "sweet" },
  { label: "탄산", value: 60, level: "중간", className: "sparkle" },
]

const exchangeTabs = ["전체", "할인권", "프리미엄", "체험권", "광고 상점"] as const
type ExchangeTab = (typeof exchangeTabs)[number]

const discountItems: ExchangeItem[] = [
  { icon: "🏪", title: "편의점 주류 500원 할인", description: "GS25 · CU · 세븐일레븐 적용", tags: ["즉시 사용", "편의점"], point: "500P" },
  { icon: "🛒", title: "마트 주류 1,000원 할인", description: "이마트 · 홈플러스 · 롯데마트", tags: ["7일 유효", "마트"], point: "800P" },
  { icon: "🍸", title: "파트너 바 10% 할인", description: "전국 파트너 바 30곳 적용", tags: ["14일 유효", "바·펍"], point: "1,200P" },
  { icon: "🍷", title: "와인 전문점 15% 할인", description: "와인앤모어 · 보틀벙커", tags: ["30일 유효", "와인샵"], point: "2,000P" },
]

const experienceItems: ExchangeItem[] = [
  { icon: "🎓", title: "주류 클래스 추첨권", description: "파트너 소믈리에 온라인 클래스", tags: ["추첨", "월 1회"], point: "500P" },
  { icon: "🥂", title: "파트너 바 시음 체험권", description: "3종 페어링 시음 코스", tags: ["예약 필요", "오프라인"], point: "3000P" },
]

const pointMissions = [
  { title: "기록 저장", reward: "+50P", action: "기록 둘러보기" },
  { title: "투표 참여", reward: "+20P", action: "투표 참여하기" },
  { title: "후기 작성", reward: "+50P", action: "후기 작성하기" },
  { title: "광고 시청", reward: "+50P", action: "광고 보기" },
]

const TASTE_SHEET_CLOSE_MS = 220
const EXCHANGE_VISIBLE_LIMIT = 5

function normalizeTastePreferences(tastePreferences: UserTastePreferences) {
  return preferenceGroups.reduce<UserTastePreferences>((nextPreferences, group) => {
    const selectedOptions = tastePreferences[group.key] ?? []

    if (group.type === "single") {
      nextPreferences[group.key] = selectedOptions.slice(0, 1)
      return nextPreferences
    }

    if (selectedOptions.includes(NONE_OPTION)) {
      nextPreferences[group.key] = [NONE_OPTION]
      return nextPreferences
    }

    nextPreferences[group.key] = selectedOptions.slice(0, group.maxSelections ?? MAX_MULTI_SELECTIONS)
    return nextPreferences
  }, {})
}

const hiddenTagOptions = new Set(["기타", NONE_OPTION])

const displayTagByOption: Record<string, string> = {
  "가볍게 마시고 싶어요": "#가볍게",
  "음식과 잘 맞는 술을 원해요": "#페어링 중요",
  "실패 없는 무난한 술이 좋아요": "#무난한",
  "새로운 술을 도전해보고 싶어요": "#새로운",
  "선물/모임용 술이 필요해요": "#선물/모임",
  편의점: "#편의점 구매",
  대형마트: "#대형마트 구매",
  "와인샵/바틀샵": "#와인샵/바틀샵 구매",
  "술집/이자카야": "#술집/이자카야 구매",
  "온라인/구독": "#온라인/ 구독 구매",
}

const quietTagByOption: Record<string, string> = {
  "고도수는 싫어요": "기피 #고도수",
  "너무 단 건 싫어요": "기피 #단 술",
  "향이 강한 건 싫어요": "기피 #향이 강한 술",
  "너무 비싼 건 싫어요": "기피 #비싼 술",
}

function toTagLabel(option: string) {
  return displayTagByOption[option] ?? `#${option.replace(/\s+/g, "")}`
}

function getTasteTags(tastePreferences: UserTastePreferences) {
  const activeTags = ["drinkType", "situation", "trait", "purchase"]
    .flatMap((key) => tastePreferences[key] ?? [])
    .filter((option) => option && !hiddenTagOptions.has(option))
    .map(toTagLabel)

  const quietTags = (tastePreferences.avoid ?? [])
    .filter((option) => option && !hiddenTagOptions.has(option))
    .map((option) => quietTagByOption[option] ?? `기피 ${toTagLabel(option)}`)

  return {
    activeTags: activeTags.length > 0 ? activeTags : ["#취향미설정"],
    quietTags,
  }
}

function ExchangeItemCard({ item }: { item: ExchangeItem }) {
  return (
    <article className="my_exchange_item">
      <span className="my_exchange_item_icon" aria-hidden="true">
        {item.icon}
      </span>
      <div className="my_exchange_item_body">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="my_exchange_item_tags">
          {item.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="my_exchange_item_action">
        <strong>{item.point}</strong>
        <button type="button">교환</button>
      </div>
    </article>
  )
}

export default function MyPage() {
  const profile = readUserProfile()
  const [isTasteOpen, setIsTasteOpen] = useState(false)
  const [isTasteEditorOpen, setIsTasteEditorOpen] = useState(false)
  const [isTasteEditorClosing, setIsTasteEditorClosing] = useState(false)
  const [isPointExchangeOpen, setIsPointExchangeOpen] = useState(false)
  const [activeExchangeTab, setActiveExchangeTab] = useState<ExchangeTab>("전체")
  const [isExperienceExpanded, setIsExperienceExpanded] = useState(false)
  const [selectedByGroup, setSelectedByGroup] = useState<UserTastePreferences>(() =>
    normalizeTastePreferences(profile.tastePreferences),
  )
  const [savedTastePreferences, setSavedTastePreferences] = useState<UserTastePreferences>(() =>
    normalizeTastePreferences(profile.tastePreferences),
  )
  const [warningByGroup, setWarningByGroup] = useState<Record<string, string>>({})
  const { value: followedUserIds } = useStoredNumberSet(COMMUNITY_FOLLOWED_USERS_KEY, defaultFollowedUserIdsMock)
  const nickname = profile.personalInfo.nickname.trim() || "이름"
  const { activeTags, quietTags } = getTasteTags(savedTastePreferences)

  function openTasteEditor() {
    setIsTasteEditorClosing(false)
    setIsTasteEditorOpen(true)
  }

  function closeTasteEditor() {
    setIsTasteEditorClosing(true)
    window.setTimeout(() => {
      setIsTasteEditorOpen(false)
      setIsTasteEditorClosing(false)
    }, TASTE_SHEET_CLOSE_MS)
  }

  function toggleOption(group: PreferenceGroup, option: string) {
    setWarningByGroup((current) => ({ ...current, [group.key]: "" }))

    setSelectedByGroup((current) => {
      if (group.type === "single") return { ...current, [group.key]: [option] }

      const selectedOptions = current[group.key] ?? []
      if (option === NONE_OPTION) {
        return { ...current, [group.key]: selectedOptions.includes(NONE_OPTION) ? [] : [NONE_OPTION] }
      }

      const selectedWithoutNone = selectedOptions.filter((selectedOption) => selectedOption !== NONE_OPTION)
      if (selectedWithoutNone.includes(option)) {
        return {
          ...current,
          [group.key]: selectedWithoutNone.filter((selectedOption) => selectedOption !== option),
        }
      }

      const maxSelections = group.maxSelections ?? MAX_MULTI_SELECTIONS
      if (selectedWithoutNone.length >= maxSelections) {
        setWarningByGroup((warning) => ({
          ...warning,
          [group.key]: `최대 ${maxSelections}개까지 선택할 수 있어요.`,
        }))
        return current
      }

      return { ...current, [group.key]: [...selectedWithoutNone, option] }
    })
  }

  function saveTastePreferences() {
    const nextWarnings: Record<string, string> = {}
    preferenceGroups.forEach((group) => {
      if ((selectedByGroup[group.key] ?? []).length === 0) {
        nextWarnings[group.key] = "항목을 선택해 주세요."
      }
    })

    if (Object.keys(nextWarnings).length > 0) {
      setWarningByGroup((current) => ({ ...current, ...nextWarnings }))
      return
    }

    updateUserTastePreferences(selectedByGroup)
    setSavedTastePreferences(selectedByGroup)
    closeTasteEditor()
  }

  function selectExchangeTab(tab: ExchangeTab) {
    setActiveExchangeTab(tab)
    setIsExperienceExpanded(false)
  }

  if (isPointExchangeOpen) {
    const showDiscount = activeExchangeTab === "전체" || activeExchangeTab === "할인권"
    const showExperience = activeExchangeTab === "전체" || activeExchangeTab === "체험권"
    const showPreparing = activeExchangeTab === "프리미엄" || activeExchangeTab === "광고 상점"
    const isAllExchangeTab = activeExchangeTab === "전체"
    const totalExchangeItemCount = discountItems.length + experienceItems.length
    const canExpandExchange = isAllExchangeTab
      ? totalExchangeItemCount > EXCHANGE_VISIBLE_LIMIT
      : experienceItems.length > EXCHANGE_VISIBLE_LIMIT
    const visibleDiscountItems =
      isAllExchangeTab && !isExperienceExpanded ? discountItems.slice(0, EXCHANGE_VISIBLE_LIMIT) : discountItems
    const remainingVisibleSlots = Math.max(0, EXCHANGE_VISIBLE_LIMIT - visibleDiscountItems.length)
    const visibleExperienceItems =
      !canExpandExchange || isExperienceExpanded
        ? experienceItems
        : experienceItems.slice(0, isAllExchangeTab ? remainingVisibleSlots : EXCHANGE_VISIBLE_LIMIT)

    return (
      <section className="my_exchange_page" aria-label="포인트 교환소">
        <header className="my_exchange_header">
          <button type="button" className="my_exchange_back" aria-label="마이페이지로 돌아가기" onClick={() => setIsPointExchangeOpen(false)} />
          <h1>포인트 교환소</h1>
          <button type="button" className="my_exchange_history">포인트내역</button>
        </header>

        <section className="my_exchange_balance" aria-label="보유 포인트">
          <div>
            <span>보유 포인트</span>
            <strong>2,840 <small>P</small></strong>
          </div>
          <p>교환 시 포인트가 차감돼요</p>
        </section>

        <nav className="my_exchange_tabs" aria-label="교환소 카테고리">
          {exchangeTabs.map((tab) => (
            <button
              type="button"
              className={activeExchangeTab === tab ? "is_active" : ""}
              key={tab}
              onClick={() => selectExchangeTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="my_exchange_sections">
          {showDiscount ? (
            <section className="my_exchange_section" aria-labelledby="exchange-discount">
              <h2 id="exchange-discount">할인권</h2>
              <div className="my_exchange_item_list">
                {visibleDiscountItems.map((item) => (
                  <ExchangeItemCard item={item} key={item.title} />
                ))}
              </div>
            </section>
          ) : null}

          {showExperience ? (
            <section className="my_exchange_section" aria-labelledby="exchange-experience">
              <h2 id="exchange-experience">체험권</h2>
              <div className="my_exchange_item_list">
                {visibleExperienceItems.map((item) => (
                  <ExchangeItemCard item={item} key={item.title} />
                ))}
                {canExpandExchange && !isExperienceExpanded ? (
                  <button type="button" className="my_exchange_more_button" onClick={() => setIsExperienceExpanded(true)}>
                    더보기
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}

          {showPreparing ? (
            <section className="my_exchange_empty" aria-label={`${activeExchangeTab} 준비중`}>
              <p>상품을 준비하고 있어요</p>
            </section>
          ) : null}
        </div>

        <section className="my_exchange_missions" aria-labelledby="my-exchange-missions-title">
          <h2 id="my-exchange-missions-title">미션하고 포인트 모으기</h2>
          <div className="my_exchange_mission_list">
            {pointMissions.map((mission) => (
              <article className="my_exchange_mission" key={mission.title}>
                <span>{mission.title}</span>
                <strong>{mission.reward}</strong>
                <button type="button">{mission.action}</button>
              </article>
            ))}
          </div>
        </section>
      </section>
    )
  }

  return (
    <section className="my_page" aria-label="마이페이지">
      <header className="my_profile_header">
        <div className="my_profile_avatar" aria-hidden="true" />

        <div className="my_profile_identity">
          <h1>{nickname}</h1>
          <div className="my_grade_line">
            <span className="user_grade_badge is_tier3">큐레이터</span>
          </div>
        </div>

        <div className="my_social_summary" aria-label="팔로우 정보">
          <strong>팔로워 74</strong>
          <span>/</span>
          <strong>팔로잉 {followedUserIds.size}</strong>
        </div>

        <button type="button" className="my_edit_button">수정</button>
      </header>

      <div className="my_page_body">
        <section className="my_activity_section" aria-labelledby="my-activity-title">
          <h2 id="my-activity-title">활동 데이터</h2>
          <div className="my_activity_grid">
            {activityStats.map((stat) => (
              <article className="my_activity_card" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="my_taste_summary" aria-label="취향 요약">
          <span className="my_taste_drop" aria-hidden="true">💧</span>
          <p>
            <strong>쓴맛 중심·라이트 바디</strong> 선호, <strong>혼술 多</strong>, 과일향 좋아함.
            <br />
            <span>"빠르게 결정하는 가성비 탐험가 스타일이에요."</span>
          </p>
          <button
            type="button"
            className={isTasteOpen ? "my_taste_toggle is_open" : "my_taste_toggle"}
            aria-label={isTasteOpen ? "내 취향 프로필 접기" : "내 취향 프로필 펼치기"}
            aria-expanded={isTasteOpen}
            aria-controls="my-taste-profile"
            onClick={() => setIsTasteOpen((current) => !current)}
          />
        </section>

        {isTasteOpen && (
          <section className="my_taste_profile" id="my-taste-profile" aria-labelledby="my-taste-profile-title">
            <div className="my_section_header">
              <h2 id="my-taste-profile-title">내 취향 프로필</h2>
              <button type="button" className="my_outline_button" onClick={openTasteEditor}>수정</button>
            </div>

            <div className="my_taste_card">
              <div className="my_taste_bars">
                {tasteBars.map((bar) => (
                  <div className="my_taste_bar_row" key={bar.label}>
                    <span>{bar.label}</span>
                    <div className="my_taste_bar_track" aria-hidden="true">
                      <span className={`my_taste_bar_fill ${bar.className}`} style={{ width: `${bar.value}%` }} />
                    </div>
                    <strong>{bar.level}</strong>
                  </div>
                ))}
              </div>

              <div className="my_tag_group" aria-label="선호 태그">
                {activeTags.map((tag) => (
                  <span className="my_tag is_active" key={tag}>{tag}</span>
                ))}
              </div>

              {quietTags.length > 0 ? (
                <div className="my_tag_group is_muted" aria-label="기피 태그">
                  {quietTags.map((tag) => (
                    <span className="my_tag" key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}

              <p className="my_ai_note">
                <span>AI 분석</span>
                "빠르게 결정하는 스타일이에요. 가성비 중심으로 새로운 걸 자주 시도해요."
              </p>
            </div>
          </section>
        )}

        {isTasteEditorOpen ? (
          <div className={isTasteEditorClosing ? "my_taste_sheet_overlay is_closing" : "my_taste_sheet_overlay"} role="presentation" onClick={closeTasteEditor}>
            <section className="my_taste_sheet" role="dialog" aria-modal="true" aria-label="취향 수정" onClick={(event) => event.stopPropagation()}>
              <header className="my_taste_sheet_header">
                <h2>취향 수정</h2>
                <button type="button" aria-label="닫기" onClick={closeTasteEditor} />
              </header>

              <div className="my_taste_sheet_groups">
                {preferenceGroups.map((group) => (
                  <PreferenceGroupSection
                    key={group.key}
                    group={group}
                    selectedOptions={selectedByGroup[group.key] ?? []}
                    warning={warningByGroup[group.key]}
                    onToggleOption={toggleOption}
                  />
                ))}
              </div>

              <button type="button" className="my_taste_sheet_save" onClick={saveTastePreferences}>저장</button>
            </section>
          </div>
        ) : null}

        <section className="my_points_section" aria-labelledby="my-points-title">
          <div className="my_section_header">
            <h2 id="my-points-title">포인트</h2>
            <button type="button" className="my_link_button" onClick={() => setIsPointExchangeOpen(true)}>교환소</button>
          </div>

          <div className="my_point_card">
            <span>보유 포인트</span>
            <strong>2,840 P</strong>
            <div className="my_point_progress" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span className="is_empty" />
            </div>
            <p>
              파트너 바 시음 체험권까지 <strong>160P</strong> 남았어요
            </p>
          </div>
        </section>

        <nav className="my_setting_list" aria-label="마이페이지 설정">
          <a href="/coupon">
            <span>쿠폰 보관함</span>
            <small>보유한 쿠폰 확인 · 사용</small>
          </a>
          <a href="/profile-setup">
            <span>계정 / 보안 설정</span>
            <small>프로필 편집 · 인증 · 탈퇴</small>
          </a>
          <a href="/home">
            <span>도움말 & 문의</span>
            <small>고객 지원 센터</small>
          </a>
        </nav>
      </div>
    </section>
  )
}
