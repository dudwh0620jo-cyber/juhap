import { useEffect, useMemo, useState } from "react"
import type { DrinkCategory } from "../data/categoryData"
import type { PricePreset } from "../utils/pricePreset"

type UseCategorySearchFilterStateParams = {
  initialDrinkTypeLabel?: string | null
  initialCategoryChip?: string | null
  initialFeatureChips?: string[]
  priceMin: number
  priceMax: number
  abvMin: number
  abvMax: number
  drinkCategories: DrinkCategory[]
  featureChips: readonly string[]
}

export function useCategorySearchFilterState({
  initialDrinkTypeLabel = null,
  initialCategoryChip = null,
  initialFeatureChips = [],
  priceMin,
  priceMax,
  abvMin,
  abvMax,
  drinkCategories,
  featureChips,
}: UseCategorySearchFilterStateParams) {
  const [selectedDrinkTypeLabel, setSelectedDrinkTypeLabel] = useState<string | null>(initialDrinkTypeLabel)
  const [selectedCategoryChip, setSelectedCategoryChip] = useState<string | null>(initialCategoryChip)
  const [selectedFeatureChips, setSelectedFeatureChips] = useState<Set<string>>(() => new Set(initialFeatureChips))
  const [priceRange, setPriceRange] = useState<[number, number]>([priceMin, priceMax])
  const [pricePreset, setPricePreset] = useState<PricePreset>(null)
  const [abvRange, setAbvRange] = useState<[number, number]>([abvMin, abvMax])

  const overlayFilterGroups = useMemo(() => {
    const drinkTypeChips = drinkCategories.map((category) => category.label)
    const selectedCategory = drinkCategories.find((category) => category.label === selectedDrinkTypeLabel)
    const subcategoryChips = selectedCategory ? selectedCategory.subcategories : []

    return [
      { title: "주종", chips: drinkTypeChips },
      { title: "카테고리", chips: subcategoryChips },
      { title: "특징", chips: [...featureChips] },
    ]
  }, [drinkCategories, featureChips, selectedDrinkTypeLabel])

  useEffect(() => {
    setSelectedFeatureChips((prev) => {
      if (prev.size === 0) return prev
      const allowed = new Set(featureChips)
      const next = new Set<string>()
      prev.forEach((chip) => {
        if (allowed.has(chip)) next.add(chip)
      })
      return next.size === prev.size ? prev : next
    })
  }, [featureChips])

  const toggleFilterChip = (groupTitle: string, chip: string) => {
    if (groupTitle === "주종") {
      setSelectedDrinkTypeLabel((prev) => (prev === chip ? null : chip))
      setSelectedCategoryChip(null)
      setSelectedFeatureChips(new Set())
      return
    }

    if (groupTitle === "카테고리") {
      setSelectedCategoryChip((prev) => (prev === chip ? null : chip))
      setSelectedFeatureChips(new Set())
      return
    }

    if (groupTitle === "특징") {
      setSelectedFeatureChips((prev) => {
        const next = new Set(prev)
        if (next.has(chip)) next.delete(chip)
        else next.add(chip)
        return next
      })
    }
  }

  const isOverlayChipEnabled = (groupTitle: string, _chip: string) => {
    if (groupTitle === "주종") return true
    if (groupTitle === "카테고리") return Boolean(selectedDrinkTypeLabel)
    if (groupTitle === "특징") return Boolean(selectedCategoryChip)
    return true
  }

  const resetOverlayFilters = () => {
    setSelectedDrinkTypeLabel(null)
    setSelectedCategoryChip(null)
    setSelectedFeatureChips(new Set())
    setPriceRange([priceMin, priceMax])
    setPricePreset(null)
    setAbvRange([abvMin, abvMax])
  }

  return {
    selectedDrinkTypeLabel,
    setSelectedDrinkTypeLabel,
    selectedCategoryChip,
    setSelectedCategoryChip,
    selectedFeatureChips,
    setSelectedFeatureChips,
    priceRange,
    setPriceRange,
    pricePreset,
    setPricePreset,
    abvRange,
    setAbvRange,
    overlayFilterGroups,
    toggleFilterChip,
    isOverlayChipEnabled,
    resetOverlayFilters,
  }
}
