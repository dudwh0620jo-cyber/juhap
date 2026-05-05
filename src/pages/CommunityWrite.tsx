import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import "../styles/community.css"
import CommunityHeader from "../components/CommunityHeader"
import iconX from "../assets/svg/x.svg"
import { useCommunityPageData } from "../hooks/useCommunityPageData"

type WriteMode = "review" | "free"

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

const situationChips = ["친구와 함께", "데이트", "혼술", "캠핑", "홈파티"] as const

const getModeFromSearch = (value: string | null): WriteMode => {
  if (value === "free") return "free"
  return "review"
}

export default function CommunityWrite() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = getModeFromSearch(searchParams.get("mode"))
  const { popupCategoryByDrinkType, popupFeaturesByDrinkType, popupFoodCategories } = useCommunityPageData()

  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(false)
  const [locationValue, setLocationValue] = useState("산아래주막")
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(null)
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string | null>(null)
  const [isDrinkPickerOpen, setIsDrinkPickerOpen] = useState(false)
  const [isFoodPickerOpen, setIsFoodPickerOpen] = useState(false)
  const [photoIds, setPhotoIds] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [rating, setRating] = useState(4)

  const headerTitle = "글쓰기"
  const subtitleLabel = mode === "review" ? "후기" : "질문"

  const canSubmit = Boolean(title.trim()) && Boolean(body.trim())

  const drinkTypeItems = useMemo(() => Object.keys(popupCategoryByDrinkType), [popupCategoryByDrinkType])

  const availableFeatureChips = useMemo(() => {
    if (!selectedDrinkType) return []
    return popupFeaturesByDrinkType[selectedDrinkType] ?? []
  }, [popupFeaturesByDrinkType, selectedDrinkType])

  useEffect(() => {
    if (!selectedFeature) return
    if (!availableFeatureChips.includes(selectedFeature)) {
      setSelectedFeature(null)
    }
  }, [availableFeatureChips])


  return (
    <section
      className="community_page page_screen"
      aria-label="글쓰기"
      onMouseDown={(event) => {
        if ((event.target as HTMLElement | null)?.closest(".write_sheet")) return
        navigate(-1)
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
              <h4 className="write_section_title">기본 정보</h4>
              <button
                type="button"
                className="write_section_close"
                aria-label="글쓰기 닫기"
                onClick={() => navigate(-1)}
              >
                <img src={iconX} alt="" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              className="write_pick_row"
              aria-label="기본 정보 열기"
              onClick={() => setIsBasicInfoOpen(true)}
            >
              <span className="write_pick_label">{locationValue || "장소 선택"}</span>
              <span className="write_pick_arrow" aria-hidden="true">
                ›
              </span>
            </button>
          </div>

          <div className="write_section">
            <h4 className="write_section_title">상황 & 취향</h4>
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

          <div className="write_section">
            <h4 className="write_section_title">취향 키워드 (선택)</h4>
            {selectedDrinkType ? (
              <div className="write_chip_row" aria-label="취향 키워드 선택">
                {availableFeatureChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className={selectedFeature === chip ? "write_chip is_active" : "write_chip"}
                    onClick={() => setSelectedFeature((prev) => (prev === chip ? null : chip))}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            ) : (
              <div className="write_empty_slot" aria-label="술 선택 후 키워드 표시" />
            )}
          </div>

          <div className="write_section">
            <h4 className="write_section_title">술 & 음식</h4>
            <div className="write_pick_cards" aria-label="술과 음식 선택">
              <button
                type="button"
                className="write_pick_card"
                aria-label="술 선택"
                onClick={() => setIsDrinkPickerOpen(true)}
              >
                <div className="write_pick_card_media is_drink" aria-hidden="true" />
                <div className="write_pick_card_text">
                  <span className="write_pick_card_label">술 선택</span>
                  <strong className="write_pick_card_title">{selectedDrinkType ?? "선택 안됨"}</strong>
                  <span className="write_pick_card_meta">★ 4.2 (12,345)</span>
                </div>
              </button>
              <button
                type="button"
                className="write_pick_card"
                aria-label="음식 선택"
                onClick={() => setIsFoodPickerOpen(true)}
              >
                <div className="write_pick_card_media is_food" aria-hidden="true" />
                <div className="write_pick_card_text">
                  <span className="write_pick_card_label">음식 선택</span>
                  <strong className="write_pick_card_title">{selectedFoodCategory ?? "선택 안됨"}</strong>
                  <span className="write_pick_card_meta">★ 4.3 (8,921)</span>
                </div>
              </button>
            </div>
          </div>

          <div className="write_section">
            <h4 className="write_section_title">사진 & 후기</h4>
            <div className="write_photo_row" aria-label="사진 추가">
              {photoIds.map((photoId, index) => (
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
                className="write_photo_add"
                aria-label="사진 추가"
                onClick={() => setPhotoIds((prev) => [...prev, `photo-${Date.now()}`])}
              >
                +
              </button>
            </div>

            <label className="write_field">
              <span className="write_field_label">제목</span>
              <input
                className="write_input"
                value={title}
                placeholder={`${subtitleLabel} 제목을 입력해 주세요`}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="write_field">
              <span className="write_field_label">본문</span>
              <textarea
                className="write_textarea"
                value={body}
                placeholder={`${subtitleLabel} 내용을 입력해 주세요`}
                onChange={(e) => setBody(e.target.value)}
              />
              <span className="write_field_counter">{Math.min(300, body.length)}/300</span>
            </label>
          </div>

          {mode === "review" ? (
            <div className="write_section">
              <h4 className="write_section_title">별점</h4>
              <div className="write_rating_row" aria-label="별점 선택">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={value <= rating ? "write_star is_active" : "write_star"}
                    onClick={() => setRating(value)}
                    aria-label={`${value}점`}
                  >
                    ★
                  </button>
                ))}
                <span className="write_rating_value">{rating.toFixed(1)}</span>
              </div>
            </div>
          ) : null}

          <div className="write_bottom_actions" aria-label="작성 액션">
            <button
              type="button"
              className={canSubmit ? "write_primary_button" : "write_primary_button is_disabled"}
              disabled={!canSubmit}
              onClick={() => navigate("/community")}
            >
              공유하기
            </button>
            <button type="button" className="write_secondary_button" onClick={() => navigate("/community")}>
              임시 저장
            </button>
          </div>
        </div>
      </div>

      {isBasicInfoOpen ? (
        <div
          className="write_modal_backdrop"
          role="presentation"
          onMouseDown={(event) => {
            event.stopPropagation()
            setIsBasicInfoOpen(false)
          }}
        >
          <div
            className="write_modal_panel"
            role="dialog"
            aria-modal="true"
            aria-label="기본 정보"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="write_modal_header">
              <h4 className="write_modal_title">기본 정보</h4>
              <button
                type="button"
                className="write_modal_close"
                aria-label="닫기"
                onClick={() => setIsBasicInfoOpen(false)}
              >
                <img src={iconX} alt="" aria-hidden="true" />
              </button>
            </div>

            <div className="write_modal_body">
              <label className="write_field">
                <span className="write_field_label">장소</span>
                <input
                  className="write_input"
                  value={locationValue}
                  placeholder="장소를 입력해 주세요"
                  onChange={(e) => setLocationValue(e.target.value)}
                />
              </label>

              <div className="write_chip_row" aria-label="장소 추천">
                {locationSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className={locationValue === suggestion ? "write_chip is_active" : "write_chip"}
                    onClick={() => setLocationValue(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
                    className={selectedDrinkType === drinkType ? "write_chip is_active" : "write_chip"}
                    onClick={() => {
                      setSelectedDrinkType(drinkType)
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
