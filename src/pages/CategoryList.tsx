import { useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import CategoryItemCard, { type CategoryListItem } from "../components/CategoryItemCard"
import CategoryItemGroup from "../components/CategoryItemGroup"
import CategoryListSearch from "../components/CategoryListSearch"
import SuggestionChips from "../components/SuggestionChips"
import "../styles/category-list.css"

const relatedTermsBySubcategory: Record<string, string[]> = {
  레드: ["레드와인", "red", "레드", "드라이", "탄닌"],
  화이트: ["화이트와인", "white", "화이트", "산뜻", "시트러스"],
  로제: ["로제", "rose", "핑크와인"],
  스파클링: ["스파클링", "sparkling", "샴페인", "버블"],
  "내추럴 와인": ["내추럴", "natural", "오렌지와인", "내추럴와인"],
  "라거/필스너": ["라거", "lager", "필스너", "pilsner"],
  "에일/IPA": ["에일", "ale", "ipa", "홉", "홉향"],
  "흑맥주(스타우트)": ["흑맥주", "스타우트", "stout", "포터", "porter"],
  과일맥주: ["과일맥주", "프루티", "fruit", "상큼"],
  "다이긴죠 / 긴죠": ["다이긴죠", "긴죠", "ginjo", "daiginjo", "향"],
  준마이: ["준마이", "junmai", "쌀", "감칠맛"],
  "혼죠조 / 일반주": ["혼죠조", "honjozo", "일반주", "데일리"],
}

const mockItemsByKey: Record<string, CategoryListItem[]> = {
  "와인>레드": [
    {
      id: "wine-red-1",
      name: "케이머스 나파 밸리 카버네 소비뇽 2023",
      subGroup: "카버네 소비뇽",
      tags: ["레드와인", "탄닌", "8만원대"],
      keywords: ["나파", "cabernet", "dry", "오크"],
    },
    {
      id: "wine-red-2",
      name: "메를로 보르도 리저브 2021",
      subGroup: "메를로",
      tags: ["레드와인", "바디", "4만원대"],
      keywords: ["보르도", "merlot", "플럼", "초콜릿"],
    },
    {
      id: "wine-red-3",
      name: "피노 누아 부르고뉴 빌라쥬 2022",
      subGroup: "피노 누아",
      tags: ["레드와인", "산미", "6만원대"],
      keywords: ["부르고뉴", "pinot", "체리", "실키"],
    },
    {
      id: "wine-red-4",
      name: "쉬라 호주 바로사 2020",
      subGroup: "쉬라/시라",
      tags: ["레드와인", "스파이시", "5만원대"],
      keywords: ["barossa", "shiraz", "후추", "진한맛"],
    },
    {
      id: "wine-red-5",
      name: "말벡 아르헨티나 멘도사 2021",
      subGroup: "말벡",
      tags: ["레드와인", "진한맛", "3만원대"],
      keywords: ["mendoza", "malbec", "블랙베리", "바닐라"],
    },
    {
      id: "wine-red-6",
      name: "산지오베제 키안티 클라시코 2021",
      subGroup: "산지오베제",
      tags: ["레드와인", "산미", "3만원대"],
      keywords: ["chianti", "tomato", "허브", "드라이"],
    },
    {
      id: "wine-red-7",
      name: "까베르네 프랑 루아르 2022",
      subGroup: "까베르네 프랑",
      tags: ["레드와인", "허브", "4만원대"],
      keywords: ["loire", "cabernet franc", "그린", "산뜻"],
    },
    {
      id: "wine-red-8",
      name: "블렌드 레드 하우스 셀렉션 2022",
      subGroup: "블렌드",
      tags: ["레드와인", "입문", "2만원대"],
      keywords: ["blend", "밸런스", "데일리", "무난"],
    },
  ],
  "와인>화이트": [
    {
      id: "wine-white-1",
      name: "샤블리 샤르도네 2022",
      subGroup: "샤르도네",
      tags: ["화이트와인", "산뜻", "5만원대"],
      keywords: ["chablis", "citrus", "미네랄", "dry"],
    },
    {
      id: "wine-white-2",
      name: "리슬링 모젤 2021",
      subGroup: "리슬링",
      tags: ["화이트와인", "향", "3만원대"],
      keywords: ["riesling", "peach", "산미", "약간달콤"],
    },
    {
      id: "wine-white-3",
      name: "소비뇽 블랑 말보로 2023",
      subGroup: "소비뇨 블랑",
      tags: ["화이트와인", "시트러스", "3만원대"],
      keywords: ["sauvignon", "자몽", "허브", "상큼"],
    },
    {
      id: "wine-white-4",
      name: "피노 그리지오 이탈리아 2022",
      subGroup: "피노 그리지오",
      tags: ["화이트와인", "가벼움", "2만원대"],
      keywords: ["pinot grigio", "레몬", "데일리", "깔끔"],
    },
    {
      id: "wine-white-5",
      name: "게뷔르츠트라미너 알자스 2021",
      subGroup: "게뷔르츠트라미너",
      tags: ["화이트와인", "향", "4만원대"],
      keywords: ["alsace", "lychee", "장미", "아로마"],
    },
    {
      id: "wine-white-6",
      name: "비오니에 론 밸리 2022",
      subGroup: "비오니에",
      tags: ["화이트와인", "바디", "4만원대"],
      keywords: ["viognier", "살구", "풍미", "오일리"],
    },
    {
      id: "wine-white-7",
      name: "세미용 블렌드 화이트 2022",
      subGroup: "블렌드",
      tags: ["화이트와인", "무난", "2만원대"],
      keywords: ["semillon", "꿀", "부드러움", "데일리"],
    },
    {
      id: "wine-white-8",
      name: "모스카토 프리시안테 2023",
      subGroup: "모스카토",
      tags: ["화이트와인", "달콤", "2만원대"],
      keywords: ["moscato", "frizzante", "과일향", "가벼움"],
    },
  ],
  "맥주>라거/필스너": [
    {
      id: "beer-lager-1",
      name: "필스너 스타일 라거 500ml",
      subGroup: "필스너",
      tags: ["라거", "청량", "편의점"],
      keywords: ["pilsner", "깔끔", "탄산", "데일리"],
    },
    {
      id: "beer-lager-2",
      name: "독일식 헬레스 라거",
      subGroup: "헬레스",
      tags: ["라거", "몰티", "3천원대"],
      keywords: ["helles", "몰트", "부드러움", "밸런스"],
    },
    {
      id: "beer-lager-3",
      name: "체코식 필스너 클래식",
      subGroup: "필스너",
      tags: ["라거", "홉", "4천원대"],
      keywords: ["czech", "hop", "쌉싸름", "클래식"],
    },
    {
      id: "beer-lager-4",
      name: "드라이 라거 355ml",
      subGroup: "드라이 라거",
      tags: ["라거", "깔끔", "캔맥주"],
      keywords: ["dry", "청량", "가벼움", "차갑게"],
    },
    {
      id: "beer-lager-5",
      name: "필스너 라이트 라거",
      subGroup: "라이트",
      tags: ["라거", "가벼움", "저칼로리"],
      keywords: ["light", "가볍게", "운동", "입문"],
    },
    {
      id: "beer-lager-6",
      name: "라거 생맥주 스타일",
      subGroup: "생맥",
      tags: ["라거", "생맥", "청량"],
      keywords: ["draft", "거품", "부드러움", "펍"],
    },
    {
      id: "beer-lager-7",
      name: "필스너 홉 라거",
      subGroup: "홉 라거",
      tags: ["라거", "홉향", "5천원대"],
      keywords: ["hop", "aroma", "쌉싸름", "상쾌"],
    },
    {
      id: "beer-lager-8",
      name: "필스너/라거 믹스 팩",
      subGroup: "믹스",
      tags: ["라거", "입문", "세트"],
      keywords: ["mix", "추천", "다양", "테이스팅"],
    },
  ],
  "소주>플레이버": [
    {
      id: "soju-flavor-1",
      name: "자몽향 플레이버 소주 360ml",
      subGroup: "자몽",
      tags: ["플레이버", "과일향", "편의점"],
      keywords: ["자몽", "상큼", "가향", "저도수"],
    },
    {
      id: "soju-flavor-2",
      name: "청포도향 플레이버 소주 360ml",
      subGroup: "청포도",
      tags: ["플레이버", "달콤", "편의점"],
      keywords: ["청포도", "가향", "과일", "깔끔"],
    },
    {
      id: "soju-flavor-3",
      name: "복숭아향 플레이버 소주 360ml",
      subGroup: "복숭아",
      tags: ["플레이버", "향", "편의점"],
      keywords: ["복숭아", "과일향", "가향", "부드러움"],
    },
    {
      id: "soju-flavor-4",
      name: "레몬향 플레이버 소주 360ml",
      subGroup: "레몬",
      tags: ["플레이버", "시트러스", "편의점"],
      keywords: ["레몬", "상큼", "하이볼", "가향"],
    },
    {
      id: "soju-flavor-5",
      name: "라임향 플레이버 소주 360ml",
      subGroup: "라임",
      tags: ["플레이버", "상큼", "편의점"],
      keywords: ["라임", "가향", "칵테일", "청량"],
    },
    {
      id: "soju-flavor-6",
      name: "요구르트향 플레이버 소주 360ml",
      subGroup: "요구르트",
      tags: ["플레이버", "부드러움", "편의점"],
      keywords: ["요구르트", "가향", "달콤", "디저트"],
    },
    {
      id: "soju-flavor-7",
      name: "딸기향 플레이버 소주 360ml",
      subGroup: "딸기",
      tags: ["플레이버", "달콤", "편의점"],
      keywords: ["딸기", "과일향", "가향", "파티"],
    },
    {
      id: "soju-flavor-8",
      name: "혼합 과일향 플레이버 소주 360ml",
      subGroup: "믹스",
      tags: ["플레이버", "입문", "편의점"],
      keywords: ["믹스", "과일향", "가향", "무난"],
    },
  ],
  default: Array.from({ length: 8 }).map((_, index) => ({
    id: `mock-${index + 1}`,
    name: "소분류에 맞춘 더미 상품",
    subGroup: ["대표", "입문", "가성비", "프리미엄"][index % 4],
    tags: ["소분류", "라벨", "가격대"],
    keywords: ["추천", "테이스팅", "분류"],
  })),
}

const createFallbackItems = (group: string, sub: string): CategoryListItem[] => {
  const safeGroup = group || "카테고리"
  const safeSub = sub || "소분류"
  const baseTags = [safeGroup, safeSub].filter(Boolean)

  return Array.from({ length: 8 }).map((_, index) => ({
    id: `fallback-${safeGroup}-${safeSub}-${index + 1}`,
    name: `${safeSub} 추천 더미 상품 ${index + 1}`,
    subGroup: safeSub,
    tags: [...baseTags, `${index % 2 === 0 ? "입문" : "추천"}`],
    keywords: [...baseTags, safeSub.replaceAll(" ", ""), safeGroup.replaceAll(" ", "")],
  }))
}

export default function CategoryList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const group = searchParams.get("group") ?? ""
  const sub = searchParams.get("sub") ?? ""
  const title = group && sub ? `${group}>${sub}` : "카테고리"
  const [searchValue, setSearchValue] = useState("")
  const [isSearchConfirmed, setIsSearchConfirmed] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const key = group && sub ? `${group}>${sub}` : "default"
  const items = mockItemsByKey[key] ?? createFallbackItems(group, sub)
  const queryContextKeywords = useMemo(() => {
    const relatedTerms = relatedTermsBySubcategory[sub] ?? []
    return [group, sub, ...relatedTerms].filter(Boolean)
  }, [group, sub])

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return items

    return items.filter((item) => {
      if (item.name.toLowerCase().includes(query)) return true
      if (item.subGroup.toLowerCase().includes(query)) return true
      return (
        item.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        item.keywords.some((keyword) => keyword.toLowerCase().includes(query)) ||
        queryContextKeywords.some((keyword) => keyword.toLowerCase().includes(query))
      )
    })
  }, [items, queryContextKeywords, searchValue])

  const shouldShowNoResults = useMemo(() => {
    const query = searchValue.trim()
    if (!query) return false
    return isSearchConfirmed && filteredItems.length === 0
  }, [filteredItems.length, isSearchConfirmed, searchValue])

  const groupedItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return null

    const scoreItem = (item: CategoryListItem) => {
      const name = item.name.toLowerCase()
      const subGroup = item.subGroup.toLowerCase()
      const tagText = item.tags.join(" ").toLowerCase()
      const keywordText = item.keywords.join(" ").toLowerCase()
      const contextText = queryContextKeywords.join(" ").toLowerCase()

      if (name.includes(query)) return 5
      if (subGroup.includes(query)) return 4
      if (tagText.includes(query)) return 3
      if (keywordText.includes(query)) return 2
      if (contextText.includes(query)) return 1
      return 0
    }

    const bucketMap = new Map<string, { subGroup: string; items: CategoryListItem[]; scoreSum: number }>()

    for (const item of filteredItems) {
      const current = bucketMap.get(item.subGroup) ?? { subGroup: item.subGroup, items: [], scoreSum: 0 }
      current.items.push(item)
      current.scoreSum += scoreItem(item)
      bucketMap.set(item.subGroup, current)
    }

    const buckets = Array.from(bucketMap.values())
    buckets.sort((a, b) => (b.scoreSum !== a.scoreSum ? b.scoreSum - a.scoreSum : a.subGroup.localeCompare(b.subGroup)))

    for (const bucket of buckets) {
      bucket.items.sort((a, b) => {
        const scoreDiff = scoreItem(b) - scoreItem(a)
        if (scoreDiff !== 0) return scoreDiff
        return a.name.localeCompare(b.name)
      })
    }

    return buckets
  }, [filteredItems, queryContextKeywords, searchValue])

  const suggestions = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return []

    const pool = new Set<string>()
    for (const item of items) {
      pool.add(item.subGroup)
      for (const tag of item.tags) pool.add(tag)
    }

    return Array.from(pool)
      .filter((candidate) => candidate.toLowerCase().includes(query))
      .slice(0, 6)
  }, [items, searchValue])

  return (
    <section className="category_list_page page_screen" aria-label="카테고리 리스트">
      <CategoryListSearch
        ref={searchInputRef}
        value={searchValue}
        onChange={(value) => {
          setSearchValue(value)
          setIsSearchConfirmed(false)
        }}
        onConfirm={() => setIsSearchConfirmed(true)}
      />

      <div className="category_list_title_row">
        <button type="button" className="back_button" onClick={() => navigate("/category", { state: { groupLabel: group } })}>←</button>
        <h2 className="category_list_title">{title}</h2>
      </div>

      <div className="category_list_cards" aria-label="카테고리 상품 목록">
        {groupedItems ? (
          groupedItems.length === 0 ? (
            <>
              {shouldShowNoResults && suggestions.length > 0 ? (
                <SuggestionChips
                  suggestions={suggestions}
                  onSelect={(suggestion) => {
                    setSearchValue(suggestion)
                    setIsSearchConfirmed(false)
                  }}
                />
              ) : null}
              {items.map((item) => (
                <CategoryItemCard key={item.id} item={item} />
              ))}
            </>
          ) : (
            groupedItems.map((itemGroup) => (
              <CategoryItemGroup key={itemGroup.subGroup} group={itemGroup} />
            ))
          )
        ) : (
          filteredItems.map((item) => (
            <CategoryItemCard key={item.id} item={item} />
          ))
        )}
      </div>
    </section>
  )
}
