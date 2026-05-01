import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"
import "../styles/category.css"

type CategoryTab = "alcohol" | "food"

type SubcategorySearchResult = {
  groupId: string
  groupLabel: string
  itemLabel: string
}

const alcoholGroups = [
  {
    id: "soju",
    label: "소주",
    items: ["데일리(희석식)", "프리미엄(증류식)", "플레이버"],
  },
  {
    id: "wine",
    label: "와인",
    items: ["레드", "화이트", "로제", "스파클링", "내추럴 와인"],
  },
  {
    id: "beer",
    label: "맥주",
    items: ["라거/필스너", "에일/IPA", "흑맥주(스타우트)", "과일맥주"],
  },
  {
    id: "spirits",
    label: `위스키/증류주`,
    items: ["싱글몰트", "블렌디드", "버번", "진/보드카", "테킬라", "럼"],
  },
  {
    id: "traditional",
    label: "전통주",
    items: ["막걸리/탁주", "청주/약주", "과실주"],
  },
  {
    id: "sake",
    label: "사케",
    items: ["다이긴죠 / 긴죠", "준마이", "혼죠조 / 일반주"],
  },
  {
    id: "other",
    label: "기타",
    items: ["하이볼", "칵테일 (Mix)", "논알콜/저도수 (Sober)"],
  },
]

const foodGroups = [
  {
    id: "simple",
    label: "간편식",
    items: ["편의점 안주", "배달", "냉동식품", "과자/스낵", "홈파티 핑거푸드", "디저트"],
  },
  {
    id: "korean",
    label: "한식",
    items: ["구이류", "찌개/국물", "회/해산물", "매운맛", "발효류(김치/젓갈)"],
  },
  {
    id: "chinese",
    label: "중식",
    items: ["마라/향신료", "딤섬", "짜장/짬뽕류"],
  },
  {
    id: "japanese",
    label: "일식",
    items: ["스시/회", "라멘", "튀김/카츠", "이자카야류"],
  },
  {
    id: "western",
    label: "양식",
    items: ["파스타", "스테이크", "치즈/샤퀴테리", "피자"],
  },
  {
    id: "global",
    label: "세계",
    items: ["멕시칸", "아시안", "그외"],
  },
]

export default function Category() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<CategoryTab>("alcohol")
  const [activeAlcoholGroupId, setActiveAlcoholGroupId] = useState(alcoholGroups[0].id)
  const [activeFoodGroupId, setActiveFoodGroupId] = useState(foodGroups[0].id)
  const [isSojuFlavorInfoVisible, setIsSojuFlavorInfoVisible] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const sojuFlavorInfoTimeoutRef = useRef<number | null>(null)

  const groups = activeTab === "alcohol" ? alcoholGroups : foodGroups
  const activeGroupId = activeTab === "alcohol" ? activeAlcoholGroupId : activeFoodGroupId
  const activeGroup = groups.find((group) => group.id === activeGroupId) ?? groups[0]

  const filteredItems = useMemo<SubcategorySearchResult[]>(() => {
    const normalizedQuery = searchValue.trim().toLowerCase()
    if (!normalizedQuery) {
      return activeGroup.items.map((itemLabel) => ({
        groupId: activeGroup.id,
        groupLabel: activeGroup.label,
        itemLabel,
      }))
    }

    if (activeTab === "alcohol") {
      const matchingGroups = alcoholGroups.filter((group) => group.label.toLowerCase().includes(normalizedQuery))
      if (matchingGroups.length > 0) {
        const results = matchingGroups.flatMap((group) =>
          group.items.map((itemLabel) => ({
            groupId: group.id,
            groupLabel: group.label,
            itemLabel,
          })),
        )
        const uniqueKeySet = new Set<string>()
        return results.filter((result) => {
          const key = `${result.groupId}::${result.itemLabel}`
          if (uniqueKeySet.has(key)) {
            return false
          }
          uniqueKeySet.add(key)
          return true
        })
      }
    }

    return activeGroup.items
      .filter((item) => item.toLowerCase().includes(normalizedQuery))
      .map((itemLabel) => ({
        groupId: activeGroup.id,
        groupLabel: activeGroup.label,
        itemLabel,
      }))
  }, [activeGroup.id, activeGroup.items, activeGroup.label, activeTab, searchValue])

  useEffect(() => {
    return () => {
      if (sojuFlavorInfoTimeoutRef.current) {
        window.clearTimeout(sojuFlavorInfoTimeoutRef.current)
      }
    }
  }, [])

  const openSojuFlavorInfo = () => {
    if (sojuFlavorInfoTimeoutRef.current) {
      window.clearTimeout(sojuFlavorInfoTimeoutRef.current)
    }

    setIsSojuFlavorInfoVisible(true)
    sojuFlavorInfoTimeoutRef.current = window.setTimeout(() => {
      setIsSojuFlavorInfoVisible(false)
    }, 5000)
  }

  const goToCategoryList = (groupLabel: string, subcategoryLabel: string) => {
    const params = new URLSearchParams()
    params.set("group", groupLabel)
    params.set("sub", subcategoryLabel)
    navigate(`/category/list?${params.toString()}`)
  }

  return (
    <section className="category_page page_screen" aria-label="카테고리">
      <header className="category_top_tabs">
        <button
          className={activeTab === "alcohol" ? "is_active" : ""}
          onClick={() => setActiveTab("alcohol")}
          type="button"
        >
          주류
        </button>
        <button
          className={activeTab === "food" ? "is_active" : ""}
          onClick={() => setActiveTab("food")}
          type="button"
        >
          음식
        </button>
      </header>

      <div className="category_layout">
        <aside className="group_nav" aria-label={activeTab === "alcohol" ? "주류 대분류" : "음식 대분류"}>
          {groups.map((group) => (
            <button
              className={group.id === activeGroup.id ? "is_selected" : ""}
              key={group.id}
              onClick={() =>
                activeTab === "alcohol" ? setActiveAlcoholGroupId(group.id) : setActiveFoodGroupId(group.id)
              }
              type="button"
            >
              {group.label}
            </button>
          ))}
        </aside>

        <section className="group_content" aria-label={activeTab === "alcohol" ? "주류 소분류" : "음식 소분류"}>
          <div className="category_search">
            <input
              className="category_search_input"
              ref={searchInputRef}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="검색하기"
              aria-label="카테고리 검색"
            />
            {searchValue.trim() ? (
              <button
                type="button"
                className="category_search_confirm"
                aria-label="검색 확인"
                onClick={() => searchInputRef.current?.blur()}
              >
                확인
              </button>
            ) : null}
          </div>
          <div className="subcategory_grid">
            {filteredItems.length === 0 ? (
              <p className="category_empty">검색 결과가 없어요.</p>
            ) : null}
            {filteredItems.map((result) => {
              const isSojuFlavor =
                activeTab === "alcohol" && result.groupId === "soju" && result.itemLabel === "플레이버"
              if (!isSojuFlavor) {
                return (
                  <div className="subcategory_card" key={`${result.groupId}-${result.itemLabel}`}>
                    <button
                      className="subcategory_card_button"
                      type="button"
                      onClick={() => goToCategoryList(result.groupLabel, result.itemLabel)}
                    >
                      {result.itemLabel}
                    </button>
                  </div>
                )
              }

              return (
                <div className="subcategory_card" key={`${result.groupId}-${result.itemLabel}`}>
                  <button
                    className="subcategory_card_button"
                    type="button"
                    onClick={() => goToCategoryList(result.groupLabel, result.itemLabel)}
                  >
                    {result.itemLabel}
                  </button>
                  <button
                    type="button"
                    className="subcategory_info_button"
                    aria-label="플레이버 안내"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      openSojuFlavorInfo()
                    }}
                  >
                    i
                  </button>

                  <div
                    className={
                      isSojuFlavorInfoVisible ? "subcategory_info_bubble is_visible" : "subcategory_info_bubble"
                    }
                    role="status"
                    aria-live="polite"
                  >
                    과일향이나 특정 향/맛이 가향된 소주를 말해요.
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </section>
  )
}
