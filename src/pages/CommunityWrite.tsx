import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import "../styles/community.css"
import CommunityHeader from "../components/CommunityHeader"
import iconX from "../assets/svg/x.svg"
import { useCommunityPageData } from "../hooks/useCommunityPageData"
import { COMMUNITY_USER_POSTS_KEY } from "../utils/communityStorage"
import { loadUserProfile } from "../utils/userProfile"

type WriteMode = "review" | "free"
type ReviewTab = "drink" | "pairing"

const locationSuggestions = [
  "산아래주막",
  "아늑한 내방",
  "아늑한 우리집",
  "퇴근 후 소파 앞",
  "잔잔한 밤 방구석",
  "늦은 밤 식탁",
  "비 오는 베란다",
  "친구들과 홈파티",
  "주말 홈파티",
  "자주가는 바",
  "햇살 드는 거실",
  "우리집 야식상",
  "작은 주방 테이블",
] as const

const situationChips = ["혼술", "파티/모임", "가족", "데이트", "캠핑/여행"] as const
const SAKE_LABEL = "사케"

const getModeFromSearch = (value: string | null): WriteMode => {
  if (value === "free") return "free"
  return "review"
}

function StarRating({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  const normalized = Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const updateFromPointer = (event: React.PointerEvent) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = (event.clientX - rect.left) / rect.width
    const raw = Math.max(0, Math.min(1, pct)) * 5
    const rounded = Math.round(raw * 2) / 2
    onChange(Number.isFinite(rounded) ? rounded : 0)
  }

  useEffect(() => {
    if (!isDragging) return
    const handleUp = () => setIsDragging(false)
    window.addEventListener("pointerup", handleUp)
    window.addEventListener("pointercancel", handleUp)
    return () => {
      window.removeEventListener("pointerup", handleUp)
      window.removeEventListener("pointercancel", handleUp)
    }
  }, [isDragging])

  const stars = Array.from({ length: 5 }).map((_, index) => {
    const slotStart = index
    const fill = Math.max(0, Math.min(1, normalized - slotStart))
    const fillPct = `${Math.round(fill * 100)}%`
    return (
      <span className="write_star_unit" key={index} aria-hidden="true">
        <span className="write_star_base">★</span>
        <span className="write_star_fill" style={{ width: fillPct }}>
          ★
        </span>
      </span>
    )
  })

  return (
    <div className="write_rating_row" aria-label="별점 선택">
      <div
        ref={containerRef}
        className={isDragging ? "write_star_bar is_dragging" : "write_star_bar"}
        role="slider"
        aria-label="별점"
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={normalized}
        aria-valuetext={`${normalized.toFixed(normalized % 1 === 0 ? 0 : 1)}점`}
        tabIndex={0}
        onPointerDown={(e) => {
          setIsDragging(true)
          updateFromPointer(e)
        }}
        onPointerMove={(e) => {
          if (!isDragging) return
          updateFromPointer(e)
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") onChange(Math.max(0, Math.round((normalized - 0.5) * 2) / 2))
          if (e.key === "ArrowRight") onChange(Math.min(5, Math.round((normalized + 0.5) * 2) / 2))
        }}
      >
        {stars}
      </div>
      <span className="write_rating_value">{normalized.toFixed(normalized % 1 === 0 ? 0 : 1)}점(0.5단위)</span>
    </div>
  )
}

export default function CommunityWrite() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = getModeFromSearch(searchParams.get("mode"))
  const { popupCategoryByDrinkType, popupFeaturesByDrinkType, popupFoodCategories } = useCommunityPageData()
  const isQuestionWrite = mode === "free"

  const [reviewTab, setReviewTab] = useState<ReviewTab>("drink")

  const [selectedSituation, setSelectedSituation] = useState<string | null>(null)
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(null)
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string | null>(null)
  const [isDrinkPickerOpen, setIsDrinkPickerOpen] = useState(false)
  const [isFoodPickerOpen, setIsFoodPickerOpen] = useState(false)

  // 술만 후기 쓰기(또는 질문 글쓰기 공용)
  const [drinkName, setDrinkName] = useState("")
  const [drinkRating, setDrinkRating] = useState(0)
  const [drinkTasteTags, setDrinkTasteTags] = useState<Set<string>>(() => new Set())
  const [photoIds, setPhotoIds] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  // 페어링 후기 쓰기
  const [pairingLocationSearch, setPairingLocationSearch] = useState("")
  const [pairingLocationTags, setPairingLocationTags] = useState<string[]>([])
  const [pairingTasteTags, setPairingTasteTags] = useState<Set<string>>(() => new Set())
  const [pairingPrice, setPairingPrice] = useState("")
  const [pairingSummary, setPairingSummary] = useState("")
  const [pairingBody, setPairingBody] = useState("")
  const [pairingPhotoIds, setPairingPhotoIds] = useState<string[]>([])

  const headerTitle = "글쓰기"

  const canSubmit = useMemo(() => {
    if (mode === "free") return Boolean(title.trim()) && Boolean(body.trim())
    if (reviewTab === "pairing") return Boolean(pairingSummary.trim()) && Boolean(pairingBody.trim())
    return Boolean(title.trim()) && Boolean(body.trim())
  }, [body, mode, pairingBody, pairingSummary, reviewTab, title])

  const drinkTypeItems = useMemo(() => Object.keys(popupCategoryByDrinkType), [popupCategoryByDrinkType])
  const sakeItems = useMemo(() => popupCategoryByDrinkType[SAKE_LABEL] ?? [], [popupCategoryByDrinkType])

  const availableFeatureChips = useMemo(() => {
    if (!selectedDrinkType) return []
    return popupFeaturesByDrinkType[selectedDrinkType] ?? []
  }, [popupFeaturesByDrinkType, selectedDrinkType])

  // 술만 후기: 술 선택은 세부 카테고리(사케)만 허용 → 주종 자동 선택
  useEffect(() => {
    if (mode !== "review") return
    if (reviewTab !== "drink") return
    const normalized = drinkName.trim()
    if (!normalized) return
    if (!sakeItems.includes(normalized)) return
    if (selectedDrinkType !== SAKE_LABEL) setSelectedDrinkType(SAKE_LABEL)
  }, [drinkName, mode, reviewTab, sakeItems, selectedDrinkType])

  const filteredPairingLocationSuggestions = useMemo(() => {
    const query = pairingLocationSearch.trim().toLowerCase()
    if (!query) return locationSuggestions as unknown as string[]
    return (locationSuggestions as unknown as string[]).filter((item) => item.toLowerCase().includes(query))
  }, [pairingLocationSearch])

  const pairingHasSituation = Boolean(selectedSituation?.trim())
  const pairingHasDrinkAndFood = Boolean(selectedDrinkType?.trim() && selectedFoodCategory?.trim())
  const pairingHasTasteTags = pairingTasteTags.size > 0
  const pairingHasPrice = Boolean(pairingPrice.trim())
  const pairingHasBodyInput = Boolean(pairingBody.trim())

  function handleShare() {
    const now = new Date()
    const nickname = loadUserProfile()?.nickname?.trim() || "익명"

    if (mode === "free") {
      if (!canSubmit) return

      const nextPost = {
        id: Date.now(),
        authorId: 2001,
        authorName: nickname,
        title: title.trim(),
        body: body.trim(),
        createdAt: now.toISOString(),
        likeCount: 0,
        commentCount: 0,
        popularityScore: 0,
        locationLabel: undefined,
        isQna: true,
        drinkType: selectedDrinkType ?? undefined,
        categories: selectedDrinkType ? [selectedDrinkType] : undefined,
        foods: selectedFoodCategory ? [selectedFoodCategory] : undefined,
        searchTags: [selectedDrinkType, selectedFoodCategory, selectedSituation, "질문"].filter(
          (v): v is string => Boolean(v),
        ),
      }

      try {
        const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        const next = Array.isArray(parsed) ? [nextPost, ...parsed] : [nextPost]
        window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
      } catch {
        // ignore storage errors
      }

      navigate("/community?filter=free")
      return
    }

    if (reviewTab === "drink") {
      const normalizedDrinkName = drinkName.trim()
      const normalizedTitle = title.trim()
      const normalizedBody = body.trim()

      if (!normalizedDrinkName) {
        window.alert("술을 선택해 주세요.")
        return
      }
      if (!selectedDrinkType?.trim()) {
        window.alert("주종을 선택해 주세요.")
        return
      }
      if (drinkRating <= 0) {
        window.alert("별점을 선택해 주세요.")
        return
      }
      if (!normalizedTitle) {
        window.alert("타이틀을 입력해 주세요.")
        return
      }
      if (normalizedBody.length < 30) {
        window.alert("상세 후기는 30자 이상 입력해 주세요.")
        return
      }
      if (!canSubmit) return

      const nextPost = {
        id: Date.now(),
        authorId: 2001,
        authorName: nickname,
        title: normalizedTitle,
        body: normalizedBody,
        createdAt: now.toISOString(),
        likeCount: 0,
        commentCount: 0,
        popularityScore: 0,
        drinkType: selectedDrinkType ?? undefined,
        categories: selectedDrinkType ? [selectedDrinkType] : undefined,
        features: drinkTasteTags.size > 0 ? Array.from(drinkTasteTags) : undefined,
        searchTags: [selectedDrinkType, ...Array.from(drinkTasteTags), "후기"].filter((v): v is string => Boolean(v)),
        rating: drinkRating,
        drinkName: normalizedDrinkName,
        photoIds: photoIds.length > 0 ? photoIds.slice(0, 3) : undefined,
      }

      try {
        const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        const next = Array.isArray(parsed) ? [nextPost, ...parsed] : [nextPost]
        window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
      } catch {
        // ignore storage errors
      }

      navigate("/community?filter=review")
      return
    }

    const normalizedPairingBody = pairingBody.trim()
    if (!selectedSituation?.trim()) {
      window.alert("상황 키워드를 선택해 주세요.")
      return
    }
    if (!selectedDrinkType?.trim() || !selectedFoodCategory?.trim()) {
      window.alert("술 & 음식(필수)을 선택해 주세요.")
      return
    }
    if (!pairingPrice.trim()) {
      window.alert("가격을 입력해 주세요.")
      return
    }
    if (!pairingSummary.trim()) {
      window.alert("페어링 한줄 요약을 입력해 주세요.")
      return
    }
    if (normalizedPairingBody.length < 30) {
      window.alert("상세 후기는 30자 이상 입력해 주세요.")
      return
    }
    if (!canSubmit) return

    const pairingTitleText = `${selectedDrinkType} + ${selectedFoodCategory}`
      const nextPost = {
      id: Date.now(),
      authorId: 2001,
      authorName: nickname,
      title: pairingTitleText,
      body: `${pairingSummary.trim()}\n\n${normalizedPairingBody}`.trim(),
      createdAt: now.toISOString(),
      likeCount: 0,
      commentCount: 0,
      popularityScore: 0,
      locationLabel: pairingLocationTags.length > 0 ? pairingLocationTags.join(" · ") : undefined,
      drinkType: selectedDrinkType ?? undefined,
      categories: selectedDrinkType ? [selectedDrinkType] : undefined,
      features: pairingTasteTags.size > 0 ? Array.from(pairingTasteTags) : undefined,
      foods: selectedFoodCategory ? [selectedFoodCategory] : undefined,
      searchTags: [
        selectedDrinkType,
        selectedFoodCategory,
        selectedSituation,
        ...Array.from(pairingTasteTags),
        "후기",
      ].filter((v): v is string => Boolean(v)),
      pairingPriceWon: pairingPrice.trim(),
      pairingSummary: pairingSummary.trim(),
      photoIds: pairingPhotoIds.length > 0 ? pairingPhotoIds.slice(0, 3) : undefined,
    }

    try {
      const raw = window.localStorage.getItem(COMMUNITY_USER_POSTS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      const next = Array.isArray(parsed) ? [nextPost, ...parsed] : [nextPost]
      window.localStorage.setItem(COMMUNITY_USER_POSTS_KEY, JSON.stringify(next.slice(0, 50)))
    } catch {
      // ignore storage errors
    }

    navigate("/community?filter=review")
  }

  // Keep feature selection consistent in event handlers (avoid setState in effects).

  if (isQuestionWrite) {
    return (
      <section
        className="community_page page_screen"
        aria-label="글쓰기"
        onMouseDown={(event) => {
          if ((event.target as HTMLElement | null)?.closest(".write_sheet")) return
          navigate("/community?filter=free")
        }}
      >
        <CommunityHeader
          title="글쓰기"
          topTab="feed"
          openFilterAriaLabel="검색"
          openNotificationsAriaLabel="알림"
          onOpenFilter={() => {}}
          onOpenNotifications={() => {}}
        />

        <div className="write_sheet" aria-label="글쓰기 폼">
          <div className="write_sheet_inner">
            <div className="write_section">
              <div className="write_section_header">
                <h4 className="write_section_title">질문 작성</h4>
                <button
                  type="button"
                  className="write_section_close"
                  aria-label="글쓰기 닫기"
                  onClick={() => navigate("/community?filter=free")}
                >
                  <img src={iconX} alt="" aria-hidden="true" />
                </button>
              </div>

              <label className="write_field">
                <span className="write_field_label">제목</span>
                <input
                  className="write_input"
                  value={title}
                  placeholder="질문 제목을 입력해 주세요"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <label className="write_field">
                <span className="write_field_label">본문</span>
                <textarea
                  className="write_textarea"
                  value={body}
                  placeholder="질문 내용을 입력해 주세요"
                  onChange={(e) => setBody(e.target.value)}
                />
                <span className="write_field_counter">{Math.min(300, body.length)}/300</span>
              </label>
            </div>

            <div className="write_bottom_actions" aria-label="작성 액션">
              <button
                type="button"
                className={canSubmit ? "write_primary_button" : "write_primary_button is_disabled"}
                disabled={!canSubmit}
                onClick={handleShare}
              >
                공유하기
              </button>
              <button type="button" className="write_secondary_button" onClick={() => navigate(-1)}>
                임시 저장
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="community_page page_screen"
      aria-label="글쓰기"
      onMouseDown={(event) => {
        if ((event.target as HTMLElement | null)?.closest(".write_sheet")) return
        navigate("/community?filter=review")
      }}
    >
      <CommunityHeader
        title={headerTitle}
        topTab="feed"
        openFilterAriaLabel="검색 열기"
        openNotificationsAriaLabel="알림 열기"
        onOpenFilter={() => {}}
        onOpenNotifications={() => {}}
      />

      <div className="write_sheet" aria-label="글쓰기 폼">
        <div className="write_sheet_inner">
          <div className="write_section">
            <div className="write_section_header">
              <h4 className="write_section_title">후기 작성</h4>
              <button
                type="button"
                className="write_section_close"
                aria-label="글쓰기 닫기"
                onClick={() => navigate("/community?filter=review")}
              >
                <img src={iconX} alt="" aria-hidden="true" />
              </button>
            </div>

            <div className="write_review_tabs" aria-label="후기 탭">
              <button
                type="button"
                className={reviewTab === "drink" ? "write_review_tab is_active" : "write_review_tab"}
                onClick={() => setReviewTab("drink")}
              >
                술만 후기 쓰기
              </button>
              <button
                type="button"
                className={reviewTab === "pairing" ? "write_review_tab is_active" : "write_review_tab"}
                onClick={() => setReviewTab("pairing")}
              >
                페어링 후기 쓰기
              </button>
            </div>
          </div>

          {reviewTab === "drink" ? (
            <>
              <div className="write_section">
                <label className="write_field">
                  <span className="write_field_label">술 선택 (필수)</span>
                  <input
                    className="write_input"
                    value={drinkName}
                    placeholder="술 이름을 검색하거나 태그를 선택하세요"
                    onChange={(e) => setDrinkName(e.target.value)}
                  />
                </label>

                <div className="write_chip_row" aria-label="술 태그 선택">
                  {sakeItems.slice(0, 12).map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className={drinkName === chip ? "write_chip is_active" : "write_chip"}
                        onClick={() => setDrinkName(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                </div>
              </div>

              <div className="write_section">
                <h4 className="write_section_title">주종 선택 (필수, 단일선택)</h4>
                <div className="write_chip_row" aria-label="주종 선택">
                  {drinkTypeItems.map((drinkType) => (
                    <button
                      key={drinkType}
                      type="button"
                      disabled={drinkType !== SAKE_LABEL}
                      className={
                        drinkType !== SAKE_LABEL
                          ? "write_chip is_disabled"
                          : selectedDrinkType === drinkType
                            ? "write_chip is_active"
                            : "write_chip"
                      }
                      onClick={() => {
                        setSelectedDrinkType(drinkType)
                        setDrinkTasteTags((prev) => {
                          if (prev.size === 0) return prev
                          const valid = new Set(popupFeaturesByDrinkType[drinkType] ?? [])
                          const next = new Set(Array.from(prev).filter((item) => valid.has(item)))
                          return next
                        })
                      }}
                    >
                      {drinkType}
                    </button>
                  ))}
                </div>
              </div>

              <div className="write_section">
                <h4 className="write_section_title">별점 (필수)</h4>
                <StarRating value={drinkRating} onChange={setDrinkRating} />
              </div>

              <div className="write_section">
                <h4 className="write_section_title">맛 태그 (중복선택가능)</h4>
                {selectedDrinkType ? (
                  <div className="write_chip_row" aria-label="맛 태그 선택">
                    {availableFeatureChips.map((chip) => {
                      const active = drinkTasteTags.has(chip)
                      return (
                        <button
                          key={chip}
                          type="button"
                          className={active ? "write_chip is_active" : "write_chip"}
                          onClick={() =>
                            setDrinkTasteTags((prev) => {
                              const next = new Set(prev)
                              if (next.has(chip)) {
                                next.delete(chip)
                                return next
                              }
                              if (next.size >= 2) {
                                window.alert("맛 태그는 최대 2개까지 선택할 수 있어요.")
                                return prev
                              }
                              next.add(chip)
                              return next
                            })
                          }
                        >
                          {chip}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="write_empty_slot" aria-label="주종 선택 후 태그 표시" />
                )}
              </div>

              <div className="write_section">
                <h4 className="write_section_title">포토후기 (선택, 최대3장)</h4>
                <div className="write_photo_row" aria-label="사진 추가">
                  {photoIds.slice(0, 3).map((photoId, index) => (
                    <button
                      key={photoId}
                      type="button"
                      className="write_photo_thumb"
                      aria-label={`사진 ${index + 1}`}
                      onClick={() => setPhotoIds((prev) => prev.filter((id) => id !== photoId))}
                    >
                      <span className="write_photo_remove" aria-hidden="true">
                        ×
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className={photoIds.length >= 3 ? "write_photo_add is_disabled" : "write_photo_add"}
                    aria-label="사진 추가"
                    disabled={photoIds.length >= 3}
                    onClick={() => setPhotoIds((prev) => (prev.length >= 3 ? prev : [...prev, `photo-${Date.now()}`]))}
                  >
                    +
                  </button>
                </div>

                <label className="write_field">
                  <span className="write_field_label">타이틀 (필수)</span>
                  <input
                    className="write_input"
                    value={title}
                    placeholder="제목을 입력해 주세요"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>

                <label className="write_field">
                  <span className="write_field_label">상세 후기 (필수)</span>
                  <textarea
                    className="write_textarea"
                    value={body}
                    placeholder="30자 이상 입력해 주세요."
                    onChange={(e) => setBody(e.target.value)}
                  />
                  <span className="write_field_counter">{Math.min(300, body.length)}/300</span>
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="write_section">
                <label className="write_field">
                  <span className="write_field_label">위치 (선택)</span>
                  <input
                    className="write_input"
                    value={pairingLocationSearch}
                    placeholder="위치를 검색하세요"
                    onChange={(e) => setPairingLocationSearch(e.target.value)}
                  />
                </label>

                <div className="write_chip_row" aria-label="위치 태그 선택">
                  {filteredPairingLocationSuggestions.slice(0, 12).map((chip) => {
                    const active = pairingLocationTags.includes(chip)
                    return (
                      <button
                        key={chip}
                        type="button"
                        className={active ? "write_chip is_active" : "write_chip"}
                        onClick={() =>
                          setPairingLocationTags((prev) => {
                            if (prev.includes(chip)) return prev.filter((item) => item !== chip)
                            return [...prev, chip]
                          })
                        }
                      >
                        {chip}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="write_section">
                <h4 className="write_section_title">상황 키워드 (필수)</h4>
                <div className="write_pill_grid" aria-label="상황 선택">
                  {situationChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className={selectedSituation === chip ? "write_pill is_active" : "write_pill"}
                      onClick={() => setSelectedSituation((prev) => (prev === chip ? null : chip))}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={pairingHasSituation ? "write_section write_reveal is_visible" : "write_section write_reveal"}
              >
                <h4 className="write_section_title">술 & 음식 (필수)</h4>
                <div className="write_pick_cards" aria-label="술과 음식 선택">
                  <button
                    type="button"
                    className={selectedDrinkType ? "write_pick_card is_compact is_selected" : "write_pick_card is_compact"}
                    aria-label="술 선택"
                    onClick={() => setIsDrinkPickerOpen(true)}
                  >
                    {selectedDrinkType ? (
                      <div className="write_pick_card_selected" aria-label="선택됨">
                        <strong className="write_pick_card_title">{selectedDrinkType}</strong>
                        <span className="write_pick_card_selected_badge">선택됨</span>
                      </div>
                    ) : (
                      <div className="write_pick_card_plus" aria-hidden="true">
                        +
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    className={
                      selectedFoodCategory ? "write_pick_card is_compact is_selected" : "write_pick_card is_compact"
                    }
                    aria-label="음식 선택"
                    onClick={() => setIsFoodPickerOpen(true)}
                  >
                    {selectedFoodCategory ? (
                      <div className="write_pick_card_selected" aria-label="선택됨">
                        <strong className="write_pick_card_title">{selectedFoodCategory}</strong>
                        <span className="write_pick_card_selected_badge">선택됨</span>
                      </div>
                    ) : (
                      <div className="write_pick_card_plus" aria-hidden="true">
                        +
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <div
                className={
                  pairingHasSituation && pairingHasDrinkAndFood
                    ? "write_section write_reveal is_visible"
                    : "write_section write_reveal"
                }
              >
                <h4 className="write_section_title">취향키워드</h4>
                {selectedDrinkType ? (
                  <div className="write_chip_row" aria-label="취향 키워드 선택">
                    {availableFeatureChips.map((chip) => {
                      const active = pairingTasteTags.has(chip)
                      return (
                        <button
                          key={chip}
                          type="button"
                          className={active ? "write_chip is_active" : "write_chip"}
                          onClick={() =>
                            setPairingTasteTags((prev) => {
                              const next = new Set(prev)
                              if (next.has(chip)) {
                                next.delete(chip)
                                return next
                              }
                              if (next.size >= 2) {
                                window.alert("취향 키워드는 최대 2개까지 선택할 수 있어요.")
                                return prev
                              }
                              next.add(chip)
                              return next
                            })
                          }
                        >
                          {chip}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="write_empty_slot" aria-label="술 선택 후 키워드 표시" />
                )}
              </div>

              <div
                className={
                  pairingHasSituation && pairingHasDrinkAndFood && pairingHasTasteTags
                    ? "write_section write_reveal is_visible"
                    : "write_section write_reveal"
                }
              >
                <label className="write_field">
                  <span className="write_field_label">가격 (필수)</span>
                  <div className="write_input_suffix_row" aria-label="가격 입력">
                    <input
                      className="write_input"
                      inputMode="numeric"
                      value={pairingPrice}
                      placeholder="가격을 입력하세요"
                      onChange={(e) => setPairingPrice(e.target.value.replace(/[^\d]/g, ""))}
                    />
                    <span className="write_input_suffix" aria-hidden="true">
                      원
                    </span>
                  </div>
                </label>
              </div>

              <div
                className={
                  pairingHasSituation && pairingHasDrinkAndFood && pairingHasTasteTags && pairingHasPrice
                    ? "write_section write_reveal is_visible"
                    : "write_section write_reveal"
                }
              >
                <label className="write_field">
                  <span className="write_field_label">페어링 한줄 요약 (필수)</span>
                  <input
                    className="write_input"
                    value={pairingSummary}
                    placeholder="텍스트를 입력하세요"
                    onChange={(e) => setPairingSummary(e.target.value)}
                  />
                </label>
              </div>

              <div
                className={
                  pairingHasSituation &&
                  pairingHasDrinkAndFood &&
                  pairingHasTasteTags &&
                  pairingHasPrice &&
                  Boolean(pairingSummary.trim())
                    ? "write_section write_reveal is_visible"
                    : "write_section write_reveal"
                }
              >
                <label className="write_field">
                  <span className="write_field_label">상세 후기 (필수)</span>
                  <textarea
                    className="write_textarea"
                    value={pairingBody}
                    placeholder="30자 이상 입력해 주세요."
                    onChange={(e) => setPairingBody(e.target.value)}
                  />
                  <span className="write_field_counter">{Math.min(300, pairingBody.length)}/300</span>
                </label>
              </div>

              <div
                className={
                  pairingHasSituation &&
                  pairingHasDrinkAndFood &&
                  pairingHasTasteTags &&
                  pairingHasPrice &&
                  Boolean(pairingSummary.trim()) &&
                  pairingHasBodyInput
                    ? "write_section write_reveal is_visible"
                    : "write_section write_reveal"
                }
              >
                <h4 className="write_section_title">포토후기 (선택, 최대3장)</h4>
                <div className="write_photo_row" aria-label="사진 추가">
                  {pairingPhotoIds.slice(0, 3).map((photoId, index) => (
                    <button
                      key={photoId}
                      type="button"
                      className="write_photo_thumb"
                      aria-label={`사진 ${index + 1}`}
                      onClick={() => setPairingPhotoIds((prev) => prev.filter((id) => id !== photoId))}
                    >
                      <span className="write_photo_remove" aria-hidden="true">
                        ×
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className={pairingPhotoIds.length >= 3 ? "write_photo_add is_disabled" : "write_photo_add"}
                    aria-label="사진 추가"
                    disabled={pairingPhotoIds.length >= 3}
                    onClick={() =>
                      setPairingPhotoIds((prev) =>
                        prev.length >= 3 ? prev : [...prev, `photo-${Date.now()}`],
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="write_bottom_actions" aria-label="작성 액션">
            <button
              type="button"
              className={canSubmit ? "write_primary_button" : "write_primary_button is_disabled"}
              disabled={!canSubmit}
              onClick={handleShare}
            >
              공유하기
            </button>
            <button type="button" className="write_secondary_button" onClick={() => navigate("/community")}>
              임시 저장
            </button>
          </div>
        </div>
      </div>

      {isDrinkPickerOpen ? (
        <div
          className="write_modal_backdrop"
          role="presentation"
          onMouseDown={(event) => {
            event.stopPropagation()
            setIsDrinkPickerOpen(false)
          }}
        >
          <div
            className="write_modal_panel"
            role="dialog"
            aria-modal="true"
            aria-label="술 선택"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="write_modal_header">
              <h4 className="write_modal_title">술 선택</h4>
              <button type="button" className="write_modal_close" aria-label="닫기" onClick={() => setIsDrinkPickerOpen(false)}>
                <img src={iconX} alt="" aria-hidden="true" />
              </button>
            </div>
            <div className="write_modal_body" aria-label="술 목록">
              <div className="write_chip_row">
                {drinkTypeItems.map((drinkType) => (
                  <button
                    key={drinkType}
                    type="button"
                    disabled={drinkType !== SAKE_LABEL}
                    className={
                      drinkType !== SAKE_LABEL
                        ? "write_chip is_disabled"
                        : selectedDrinkType === drinkType
                          ? "write_chip is_active"
                          : "write_chip"
                    }
                    onClick={() => {
                      setSelectedDrinkType(drinkType)
                      setDrinkTasteTags((prev) => {
                        if (prev.size === 0) return prev
                        const valid = new Set(popupFeaturesByDrinkType[drinkType] ?? [])
                        return new Set(Array.from(prev).filter((item) => valid.has(item)))
                      })
                      setPairingTasteTags((prev) => {
                        if (prev.size === 0) return prev
                        const valid = new Set(popupFeaturesByDrinkType[drinkType] ?? [])
                        return new Set(Array.from(prev).filter((item) => valid.has(item)))
                      })
                      setIsDrinkPickerOpen(false)
                    }}
                  >
                    {drinkType}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isFoodPickerOpen ? (
        <div
          className="write_modal_backdrop"
          role="presentation"
          onMouseDown={(event) => {
            event.stopPropagation()
            setIsFoodPickerOpen(false)
          }}
        >
          <div
            className="write_modal_panel"
            role="dialog"
            aria-modal="true"
            aria-label="음식 선택"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="write_modal_header">
              <h4 className="write_modal_title">음식 선택</h4>
              <button type="button" className="write_modal_close" aria-label="닫기" onClick={() => setIsFoodPickerOpen(false)}>
                <img src={iconX} alt="" aria-hidden="true" />
              </button>
            </div>
            <div className="write_modal_body" aria-label="음식 목록">
              <div className="write_chip_row">
                {popupFoodCategories.map((food) => (
                  <button
                    key={food}
                    type="button"
                    className={selectedFoodCategory === food ? "write_chip is_active" : "write_chip"}
                    onClick={() => {
                      setSelectedFoodCategory(food)
                      setIsFoodPickerOpen(false)
                    }}
                  >
                    {food}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
