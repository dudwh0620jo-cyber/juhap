import { useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import CategoryItemCard, { type CategoryListItem } from "../components/CategoryItemCard"
import CategoryItemGroup from "../components/CategoryItemGroup"
import CategoryListSearch from "../components/CategoryListSearch"
import SuggestionChips from "../components/SuggestionChips"
import { useCategoryListPageData } from "../hooks/useCategoryListPageData"
import "../styles/category-list.css"

export default function CategoryList() {
  const { relatedTermsBySubcategory, mockItemsByKey, createFallbackItems } = useCategoryListPageData()
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
  }, [group, sub, relatedTermsBySubcategory])

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
