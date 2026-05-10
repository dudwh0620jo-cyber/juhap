export type PricePreset = "500k" | "1000k" | null

type PricePresetResult = {
  preset: PricePreset
  range: [number, number]
}

export const resolvePricePresetToggle = (
  currentPreset: PricePreset,
  nextPreset: Exclude<PricePreset, null>,
  priceMin: number,
  priceMax: number,
): PricePresetResult => {
  if (currentPreset === nextPreset) {
    return {
      preset: null,
      range: [priceMin, priceMax],
    }
  }

  if (nextPreset === "500k") {
    return {
      preset: "500k",
      range: [500000, priceMax],
    }
  }

  return {
    preset: "1000k",
    range: [1000000, priceMax],
  }
}
