import products from "./spiritsProductsMock.json"

export type SpiritsProductMock = {
  id: string
  categoryId: "spirits"
  subcategory: string
  name: string
  priceWon: number
  abv?: number
  tags: string[]
  keywords: string[]
}

export const spiritsProductsMock = products as SpiritsProductMock[]
