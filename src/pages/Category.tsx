import { useState } from "react"
import "../styles/category.css"

type CategoryTab = "alcohol" | "food"

const alcoholGroups = [
  { id: "soju", label: "소주", items: ["데일리(희석식)", "프리미엄(증류식)", "플레이버"] },
  { id: "wine", label: "와인", items: ["레드", "화이트", "로제", "스파클링", "내추럴 와인"] },
  { id: "beer", label: "맥주", items: ["라거/필스너", "에일/IPA", "흑맥주(스타우트)", "과일맥주"] },
  { id: "spirits", label: "위스키", items: ["싱글몰트", "블렌디드", "버번", "진/보드카", "테킬라", "럼"] },
  { id: "traditional", label: "전통주", items: ["막걸리/탁주", "청주/약주", "과실주"] },
  { id: "other", label: "기타", items: ["하이볼", "칵테일 (Mix)", "논알콜/저도수 (Sober)"] },
]

export default function Category() {
  const [activeTab, setActiveTab] = useState<CategoryTab>("alcohol")
  const [activeGroupId, setActiveGroupId] = useState(alcoholGroups[0].id)
  const activeGroup = alcoholGroups.find((g) => g.id === activeGroupId) ?? alcoholGroups[0]

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

      {activeTab === "alcohol" ? (
        <div className="category_layout">
          <aside className="group_nav">
            {alcoholGroups.map((group) => (
              <button
                className={group.id === activeGroup.id ? "is_selected" : ""}
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
                type="button"
              >
                {group.label}
              </button>
            ))}
          </aside>
          <section className="group_content">
            <div className="category_search">검색하기</div>
            <div className="subcategory_grid">
              {activeGroup.items.map((item) => (
                <button key={item} type="button">
                  {item}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="food_placeholder">음식 탭 준비중</div>
      )}
    </section>
  )
}
