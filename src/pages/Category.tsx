import { useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import CategorySearch from "../components/CategorySearch"
import GroupNav from "../components/GroupNav"
import SubcategoryCard from "../components/SubcategoryCard"
import "../styles/category.css"

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

export default function Category() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnedGroupLabel = (location.state as { groupLabel?: string } | null)?.groupLabel

  const [activeGroupId, setActiveGroupId] = useState(() => {
    if (returnedGroupLabel) {
      const found = alcoholGroups.find((g) => g.label === returnedGroupLabel)
      if (found) return found.id
    }
    return alcoholGroups[0].id
  })
  const [searchValue, setSearchValue] = useState("")
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const activeGroup = alcoholGroups.find((g) => g.id === activeGroupId) ?? alcoholGroups[0]

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase()
    if (!normalizedQuery) {
      return activeGroup.items.map((itemLabel) => ({
        groupId: activeGroup.id,
        groupLabel: activeGroup.label,
        itemLabel,
      }))
    }

    const matchingGroups = alcoholGroups.filter((group) => group.label.toLowerCase().includes(normalizedQuery))
    if (matchingGroups.length > 0) {
      const uniqueKeySet = new Set<string>()
      return matchingGroups
        .flatMap((group) =>
          group.items.map((itemLabel) => ({ groupId: group.id, groupLabel: group.label, itemLabel }))
        )
        .filter((result) => {
          const key = `${result.groupId}::${result.itemLabel}`
          if (uniqueKeySet.has(key)) return false
          uniqueKeySet.add(key)
          return true
        })
    }

    return activeGroup.items
      .filter((item) => item.toLowerCase().includes(normalizedQuery))
      .map((itemLabel) => ({ groupId: activeGroup.id, groupLabel: activeGroup.label, itemLabel }))
  }, [activeGroup, searchValue])

  const goToCategoryList = (groupLabel: string, subcategoryLabel: string) => {
    const params = new URLSearchParams()
    params.set("group", groupLabel)
    params.set("sub", subcategoryLabel)
    navigate(`/category/list?${params.toString()}`)
  }

  return (
    <section className="category_page page_screen" aria-label="카테고리">
      <div className="category_layout">
        <GroupNav
          groups={alcoholGroups}
          activeGroupId={activeGroup.id}
          onGroupChange={setActiveGroupId}
          ariaLabel="주류 대분류"
        />

        <section className="group_content" aria-label="주류 소분류">
          <CategorySearch ref={searchInputRef} value={searchValue} onChange={setSearchValue} />
          <div className="subcategory_grid">
            {filteredItems.length === 0 ? (
              <p className="category_empty">검색 결과가 없어요.</p>
            ) : null}
            {filteredItems.map((result) => (
              <SubcategoryCard
                key={`${result.groupId}-${result.itemLabel}`}
                result={result}
                isSojuFlavor={result.groupId === "soju" && result.itemLabel === "플레이버"}
                onClick={goToCategoryList}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
