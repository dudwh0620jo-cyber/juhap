import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import AlertModal from "../components/AlertModal"
import ProfileSummaryCard from "../components/ProfileSummaryCard"
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
import {
  EXCHANGE_VISIBLE_LIMIT,
  TASTE_SHEET_CLOSE_MS,
  activityStats,
  discountItems,
  exchangeTabs,
  experienceItems,
  myPagePointsSummary,
  myPageProfileSummary,
  pointMissions,
  tasteBars,
  type ExchangeItem,
} from "../data/myPageContent"
import { bookmarkLists } from "../data/communityFilterConfig"
import { extractPairingTitle, feedPosts, getPairingSummaryText, type FeedPost } from "../utils/communityPosts"
import { COMMUNITY_BOOKMARK_LIST_BY_POST_KEY, COMMUNITY_FOLLOWED_USERS_KEY } from "../utils/communityStorage"
import { useStoredNullableStringRecord, useStoredNumberSet } from "../utils/storage"
import { currentUserMock, defaultFollowedUserIdsMock, usersMockById } from "../utils/usersMock"
import { resolveMyUserAvatar, resolveUserAvatar } from "../utils/userAvatars"
import "../styles/community.css"
import "../styles/my.css"

type ExchangeTab = (typeof exchangeTabs)[number]

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

function toTagLabel(option: string) {
  return `#${option.replace(/\s+/g, "")}`
}

function getTasteTags(tastePreferences: UserTastePreferences) {
  const activeTags = ["drinkType", "situation", "trait", "purchase"]
    .flatMap((key) => tastePreferences[key] ?? [])
    .filter((option) => option && !hiddenTagOptions.has(option))
    .map(toTagLabel)

  const quietTags = (tastePreferences.avoid ?? [])
    .filter((option) => option && !hiddenTagOptions.has(option))
    .map((option) => `기피 ${toTagLabel(option)}`)

  return {
    activeTags: activeTags.length > 0 ? activeTags : ["#취향미설정"],
    quietTags,
  }
}

function getTasteSummary(tastePreferences: UserTastePreferences) {
  const drinkType = (tastePreferences.drinkType ?? []).find((value) => value && !hiddenTagOptions.has(value)) ?? "주류"
  const traits = (tastePreferences.trait ?? []).filter((value) => value && !hiddenTagOptions.has(value))
  const situations = (tastePreferences.situation ?? []).filter((value) => value && !hiddenTagOptions.has(value))

  const traitLine = traits.length > 0 ? traits.join(" · ") : "취향 미설정"
  const situationLine = situations[0] ?? "상황 미설정"
  const summaryTitle = `${drinkType} · ${traitLine}`
  const summaryDescription = `${situationLine} 기준으로 추천을 받고 있어요.`

  return { summaryTitle, summaryDescription }
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
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const profile = readUserProfile()
  const [isProfileEditPreparingOpen, setIsProfileEditPreparingOpen] = useState(false)
  const [isTasteOpen, setIsTasteOpen] = useState(false)
  const [isTasteEditorOpen, setIsTasteEditorOpen] = useState(false)
  const [isTasteEditorClosing, setIsTasteEditorClosing] = useState(false)
  const [isPointExchangeOpen, setIsPointExchangeOpen] = useState(false)
  const [activeExchangeTab, setActiveExchangeTab] = useState<ExchangeTab>("전체")
  const [isExperienceExpanded, setIsExperienceExpanded] = useState(false)
  const myAvatarSrc = resolveMyUserAvatar()
  const [selectedByGroup, setSelectedByGroup] = useState<UserTastePreferences>(() =>
    normalizeTastePreferences(profile.tastePreferences),
  )
  const [savedTastePreferences, setSavedTastePreferences] = useState<UserTastePreferences>(() =>
    normalizeTastePreferences(profile.tastePreferences),
  )
  const [warningByGroup, setWarningByGroup] = useState<Record<string, string>>({})
  const { value: followedUserIds } = useStoredNumberSet(COMMUNITY_FOLLOWED_USERS_KEY, defaultFollowedUserIdsMock)
  const { value: bookmarkListById } = useStoredNullableStringRecord(COMMUNITY_BOOKMARK_LIST_BY_POST_KEY)
  const [userPosts, setUserPosts] = useState<FeedPost[]>([])
  const bookmarkSavedCount = Object.values(bookmarkListById).filter(Boolean).length
  const savedActivityLabel = activityStats[activityStats.length - 1]?.label
  const nickname = profile.personalInfo.nickname.trim() || "이름"
  const { activeTags, quietTags } = getTasteTags(savedTastePreferences)
  const { summaryTitle, summaryDescription } = getTasteSummary(savedTastePreferences)
  const bookmarkListLabelById = useMemo(
    () => Object.fromEntries(bookmarkLists.map((item) => [item.id, item.label])) as Record<string, string>,
    [],
  )
  const isSavedListOpen = searchParams.get("view") === "saved"

  const bookmarkedPosts = useMemo(() => {
    const combinedPosts = [...userPosts, ...feedPosts]
    const postById = new Map<number, FeedPost>()

    combinedPosts.forEach((post) => {
      if (typeof post.id === "number" && Number.isFinite(post.id) && !postById.has(post.id)) {
        postById.set(post.id, post)
      }
    })

    return Object.entries(bookmarkListById)
      .map(([postId, listId]) => {
        if (!listId) return null
        const post = postById.get(Number(postId))
        if (!post) return null
        return { post, listId }
      })
      .filter((item): item is { post: FeedPost; listId: string } => Boolean(item))
      .sort((left, right) => new Date(right.post.createdAt).getTime() - new Date(left.post.createdAt).getTime())
  }, [bookmarkListById, userPosts, bookmarkListLabelById])

  useEffect(() => {
    const handleGoHome = () => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete("view")
        return next
      })
      setIsPointExchangeOpen(false)
    }

    window.addEventListener("my:go-home", handleGoHome)
    return () => window.removeEventListener("my:go-home", handleGoHome)
  }, [setSearchParams])

  const openSavedList = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("view", "saved")
      return next
    })

  const closeSavedList = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete("view")
      return next
    })

  useEffect(() => {
    const readStoredUserPosts = () => {
      try {
        const raw = window.localStorage.getItem("community_user_posts")
        const parsed = raw ? JSON.parse(raw) : []
        setUserPosts(Array.isArray(parsed) ? (parsed as FeedPost[]) : [])
      } catch {
        setUserPosts([])
      }
    }

    readStoredUserPosts()
    window.addEventListener("community:user-posts-updated", readStoredUserPosts)
    return () => window.removeEventListener("community:user-posts-updated", readStoredUserPosts)
  }, [])

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
        nextWarnings[group.key] = "??ぉ???좏깮??二쇱꽭??"
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

  if (isSavedListOpen) {
    return (
      <section className="my_exchange_page my_saved_page" aria-label="저장한 리스트">
        <header className="my_exchange_header">
          <button
            type="button"
            className="my_exchange_back"
            aria-label="마이페이지로 돌아가기"
            onClick={closeSavedList}
          />
          <h1>저장한 리스트</h1>
          <div />
        </header>

        {bookmarkedPosts.length > 0 ? (
          <div className="my_saved_list">
            {bookmarkedPosts.map(({ post, listId }) => {
              const authorId = typeof post.authorId === "number" ? post.authorId : currentUserMock.id
              const authorName = post.authorName?.trim() || usersMockById[authorId]?.name || "익명"
              const title = post.isQna ? post.title : post.pairingSummary?.trim() || extractPairingTitle(post.title)
              const description = post.locationLabel?.trim() || getPairingSummaryText(post)

              return (
                <ProfileSummaryCard
                  key={`${post.id}-${listId}`}
                  avatarSrc={authorId === currentUserMock.id ? resolveMyUserAvatar() : resolveUserAvatar(authorId)}
                  title={title}
                  accentText={authorName}
                  description={description}
                  stats={[
                    { value: bookmarkListLabelById[listId] ?? listId, label: "리스트" },
                    { value: String(post.commentCount ?? 0), label: "댓글" },
                  ]}
                  onClick={() =>
                    navigate(`/community/pairing/${post.id}`, {
                      state: {
                        pairingTitle: extractPairingTitle(post.title),
                        pairingSummary: post.pairingSummary ?? "",
                        body: post.body,
                        authorId,
                        authorName,
                        profile: usersMockById[authorId]?.profile ?? "",
                        locationLabel: post.locationLabel ?? "",
                        drinkType: post.drinkType ?? "",
                        foods: post.foods,
                        features: post.features ?? [],
                        source: post.isQna ? "free" : "feed",
                        feedFilter: post.isQna ? "free" : "review",
                      },
                    })
                  }
                />
              )
            })}
          </div>
        ) : (
          <div className="my_saved_empty" role="status">
            저장한 게시글이 아직 없어요.
          </div>
        )}
      </section>
    )
  }

  if (isPointExchangeOpen) {
    const showDiscount = activeExchangeTab === "전체" || activeExchangeTab === "할인권"
    const showExperience = activeExchangeTab === "전체" || activeExchangeTab === "체험권"
    const showPreparing = activeExchangeTab === "프리미엄" || activeExchangeTab === "광고 적립"
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
          <button
            type="button"
            className="my_exchange_back"
            aria-label="마이페이지로 돌아가기"
            onClick={() => setIsPointExchangeOpen(false)}
          />
          <h1>포인트 교환소</h1>
          <button type="button" className="my_exchange_history">포인트내역</button>
        </header>

      {isProfileEditPreparingOpen ? (
        <AlertModal
          title={"아직 준비 중인 서비스입니다.\n곧 만나보실 수 있어요!"}
          confirmLabel="닫기"
          variant="preparing"
          onConfirm={() => setIsProfileEditPreparingOpen(false)}
        />
      ) : null}

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
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}

          {showPreparing ? (
            <section className="my_exchange_empty" aria-label={`${activeExchangeTab} 준비중`}>
              <p>상품을 준비하고 있어요.</p>
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
        <div className="my_profile_avatar" aria-hidden="true">
          {myAvatarSrc ? <img className="my_profile_avatar_image" src={myAvatarSrc} alt="" aria-hidden="true" /> : null}
        </div>

        <div className="my_profile_identity">
          <h1>{nickname}</h1>
          <div className="my_grade_line">
            <span className="user_grade_badge is_tier3">{myPageProfileSummary.gradeLabel}</span>
          </div>
        </div>

        <div className="my_social_summary" aria-label="팔로우 정보">
          <strong>팔로워 {myPageProfileSummary.followerCount}</strong>
          <span>/</span>
          <strong>팔로잉 {followedUserIds.size}</strong>
        </div>

        <button type="button" className="my_edit_button" onClick={() => setIsProfileEditPreparingOpen(true)}>수정</button>
      </header>

      {isProfileEditPreparingOpen ? (
        <AlertModal
          message="준비중이에요"
          variant="preparing"
          onConfirm={() => setIsProfileEditPreparingOpen(false)}
        />
      ) : null}

      <div className="my_page_body">
        <section className="my_activity_section" aria-labelledby="my-activity-title">
          <h2 id="my-activity-title">활동 데이터</h2>
          <div className="my_activity_grid">
            {activityStats.map((stat) => (
              <article className="my_activity_card" key={stat.label}>
                <strong>{stat.label === savedActivityLabel ? bookmarkSavedCount : stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section
          className="my_taste_summary"
          aria-label="취향 요약"
          role="button"
          tabIndex={0}
          onClick={() => setIsTasteOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              setIsTasteOpen((current) => !current)
            }
          }}
        >
          <span className="my_taste_drop" aria-hidden="true">🍶</span>
          <p>
            <strong>{summaryTitle}</strong>
            <br />
            <span>{summaryDescription}</span>
          </p>
          <button
            type="button"
            className={isTasteOpen ? "my_taste_toggle is_open" : "my_taste_toggle"}
            aria-label={isTasteOpen ? "내 취향 프로필 닫기" : "내 취향 프로필 펼치기"}
            aria-expanded={isTasteOpen}
            aria-controls="my-taste-profile"
            onClick={(event) => {
              event.stopPropagation()
              setIsTasteOpen((current) => !current)
            }}
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
                "빠르게 결정하는 스타일이에요. 가성비 중시로 새로운 경험도 자주 시도해요."
              </p>
            </div>
          </section>
        )}

        {isTasteEditorOpen ? (
          <div
            className={isTasteEditorClosing ? "my_taste_sheet_overlay is_closing" : "my_taste_sheet_overlay"}
            role="presentation"
            onClick={closeTasteEditor}
          >
            <section
              className="my_taste_sheet"
              role="dialog"
              aria-modal="true"
              aria-label="취향 수정"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="my_taste_sheet_header">
                <h2>취향 수정</h2>
                <button type="button" aria-label="닫기" onClick={closeTasteEditor} />
              </header>

      {isProfileEditPreparingOpen ? (
        <AlertModal
          message="준비중이에요"
          variant="preparing"
          onConfirm={() => setIsProfileEditPreparingOpen(false)}
        />
      ) : null}

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
            <strong>{myPagePointsSummary.balance.toLocaleString("ko-KR")} P</strong>
            <div className="my_point_progress" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span className="is_empty" />
            </div>
            <p>
              {myPagePointsSummary.nextRewardLabel}까지 <strong>{myPagePointsSummary.remainingToNextReward}P</strong> 남아있어요.
            </p>
          </div>
        </section>

        <nav className="my_setting_list" aria-label="마이페이지 설정">
          <button type="button" className="my_saved_menu_button" onClick={openSavedList}>
            <span>저장한 리스트</span>
            <small>북마크한 게시글 모아보기</small>
          </button>
          <a href="/coupon">
            <span>쿠폰 보기</span>
            <small>보유 중인 쿠폰 확인 및 사용</small>
          </a>
          <a href="/profile-setup">
            <span>계정 / 보안 설정</span>
            <small>프로필 편집 및 인증, 알림</small>
          </a>
          <a href="/home">
            <span>공지사항 & 문의</span>
            <small>고객 지원 센터</small>
          </a>
        </nav>
      </div>
    </section>
  )
}


