import { useState } from "react"
import "../styles/category.css"

type CategoryTab = "alcohol" | "food"

type AlcoholGroup = {
  id: string
  label: string
  labelEn: string
  items: string[]
}

const alcoholGroups: AlcoholGroup[] = [
  {
    id: "soju",
    label: "소주",
    labelEn: "Soju",
    items: ["데일리(희석식)", "프리미엄(증류식)", "플레이버"],
  },
  {
    id: "wine",
    label: "와인",
    labelEn: "Wine",
    items: ["레드", "화이트", "로제", "스파클링", "내추럴 와인"],
  },
  {
    id: "beer",
    label: "맥주",
    labelEn: "Beer",
    items: ["라거/필스너", "에일/IPA", "흑맥주(스타우트)", "과일맥주"],
  },
  {
    id: "spirits",
    label: "위스키/증류주",
    labelEn: "Spirits",
    items: ["싱글몰트", "블렌디드", "버번", "진/보드카", "테킬라", "럼"],
  },
  {
    id: "traditional",
    label: "전통주",
    labelEn: "Traditional",
    items: ["막걸리/탁주", "청주/약주", "과실주"],
  },
  {
    id: "other",
    label: "기타",
    labelEn: "Other",
    items: ["하이볼", "칵테일 (Mix)", "논알콜/저도수 (Sober)"],
  },
]

export default function Category() {
  const [activeTab, setActiveTab] = useState<CategoryTab>("alcohol")
  const [activeGroupId, setActiveGroupId] = useState<string>(alcoholGroups[0].id)

  const activeGroup =
    alcoholGroups.find((group) => group.id === activeGroupId) ?? alcoholGroups[0]

  return (
    <section className="category-page page-screen" aria-label="카테고리">
      <header className="category-top-tabs" aria-label="카테고리 탭">
        <button
          className={activeTab === "alcohol" ? "is-active" : ""}
          onClick={() => setActiveTab("alcohol")}
          type="button"
        >
          주류
        </button>
        <button
          className={activeTab === "food" ? "is-active" : ""}
          onClick={() => setActiveTab("food")}
          type="button"
        >
          음식
        </button>
      </header>

      {activeTab === "alcohol" ? (
        <div className="category-layout">
          <aside className="group-nav" aria-label="주류 대분류">
            {alcoholGroups.map((group) => (
              <button
                className={activeGroup.id === group.id ? "is-selected" : ""}
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
                type="button"
              >
                <span>{group.label}</span>
              </button>
            ))}
          </aside>

          <section className="group-content" aria-label="주류 소분류">
            <div className="category-search" role="button" tabIndex={0}>
              검색하기
            </div>

            <div className="group-header">
              <h1>{activeGroup.label}</h1>
              <p>{activeGroup.labelEn}</p>
            </div>

            <div className="subcategory-grid">
              {activeGroup.items.map((item) => (
                <button type="button" key={item}>
                  {item}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="food-placeholder" aria-label="음식 카테고리 준비중">
          <h2>음식 카테고리</h2>
          <p>다음 단계에서 음식 탭을 이어서 구성합니다.</p>
        </div>
      )}
    </section>
  )
}
