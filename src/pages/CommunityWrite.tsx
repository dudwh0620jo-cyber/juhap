import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { useNavigate, useSearchParams } from "react-router"
import "../styles/community.css"
import CommunityHeader from "../components/CommunityHeader"

type WriteMode = "review" | "free"

type SituationItem = { key: string; label: string }
type KeywordItem = { key: string; label: string }

const situationItems: SituationItem[] = [
  { key: "friends", label: "친구와 함께" },
  { key: "date", label: "데이트" },
  { key: "alone", label: "혼술" },
  { key: "camping", label: "캠핑" },
  { key: "party", label: "홈파티" },
]

const keywordItems: KeywordItem[] = [
  { key: "sweet", label: "달달한" },
  { key: "clean", label: "깔끔한" },
  { key: "fruity", label: "과일향" },
  { key: "rich", label: "묵직한" },
  { key: "spicy", label: "고소한" },
]

const getModeFromSearch = (value: string | null): WriteMode => {
  if (value === "free") return "free"
  return "review"
}

export default function CommunityWrite() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = getModeFromSearch(searchParams.get("mode"))

  const [selectedSituations, setSelectedSituations] = useState<Set<string>>(() => new Set())
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(() => new Set())
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [rating, setRating] = useState(4)

  const headerTitle = "글쓰기"
  const subtitleLabel = mode === "review" ? "후기" : "질문"

  const canSubmit = Boolean(title.trim()) && Boolean(body.trim())

  const toggleSetItem = (setValue: Dispatch<SetStateAction<Set<string>>>, key: string) => {
    setValue((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectedKeywordLabels = useMemo(() => {
    return keywordItems.filter((item) => selectedKeywords.has(item.key)).map((item) => item.label)
  }, [selectedKeywords])

  return (
    <section className="community_page page_screen" aria-label="글쓰기">
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
            <h4 className="write_section_title">기본 정보</h4>
            <button type="button" className="write_pick_row" aria-label="장소 선택">
              <span className="write_pick_label">산아래주막</span>
              <span className="write_pick_arrow" aria-hidden="true">
                ›
              </span>
            </button>
          </div>

          <div className="write_section">
            <h4 className="write_section_title">상황 & 취향</h4>
            <div className="write_pill_grid" aria-label="상황 선택">
              {situationItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={selectedSituations.has(item.key) ? "write_pill is_active" : "write_pill"}
                  onClick={() => toggleSetItem(setSelectedSituations, item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="write_section">
            <h4 className="write_section_title">취향 키워드 (선택)</h4>
            <div className="write_chip_row" aria-label="키워드 선택">
              {keywordItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={selectedKeywords.has(item.key) ? "write_chip is_active" : "write_chip"}
                  onClick={() => toggleSetItem(setSelectedKeywords, item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="write_section">
            <h4 className="write_section_title">술 & 음식</h4>
            <div className="write_pick_cards" aria-label="술과 음식 선택">
              <button type="button" className="write_pick_card" aria-label="술 선택">
                <div className="write_pick_card_media is_drink" aria-hidden="true" />
                <div className="write_pick_card_text">
                  <span className="write_pick_card_label">술 선택</span>
                  <strong className="write_pick_card_title">하이네켄</strong>
                  <span className="write_pick_card_meta">★ 4.2 (12,345)</span>
                </div>
              </button>
              <button type="button" className="write_pick_card" aria-label="음식 선택">
                <div className="write_pick_card_media is_food" aria-hidden="true" />
                <div className="write_pick_card_text">
                  <span className="write_pick_card_label">음식 선택</span>
                  <strong className="write_pick_card_title">치킨 & 감자튀김</strong>
                  <span className="write_pick_card_meta">★ 4.3 (8,921)</span>
                </div>
              </button>
            </div>
          </div>

          <div className="write_section">
            <h4 className="write_section_title">사진 & 후기</h4>
            <div className="write_photo_row" aria-label="사진 추가">
              <button type="button" className="write_photo_thumb" aria-label="사진 1">
                <span className="write_photo_remove" aria-hidden="true">
                  ×
                </span>
              </button>
              <button type="button" className="write_photo_thumb" aria-label="사진 2">
                <span className="write_photo_remove" aria-hidden="true">
                  ×
                </span>
              </button>
              <button type="button" className="write_photo_thumb" aria-label="사진 3">
                <span className="write_photo_remove" aria-hidden="true">
                  ×
                </span>
              </button>
              <button type="button" className="write_photo_add" aria-label="사진 추가">
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

          {selectedKeywordLabels.length > 0 ? (
            <p className="write_selected_hint" aria-label="선택된 키워드">
              {selectedKeywordLabels.join(" · ")}
            </p>
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
    </section>
  )
}
