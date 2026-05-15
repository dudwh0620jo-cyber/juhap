import products from "./wineProductsMock.json"

export type WineProductMock = {
  id: string
  categoryId: "wine"
  subcategory: string
  name: string
  priceWon: number
  abv?: number
  tags: string[]
  keywords: string[]
}

export const wineProductsMock = products as WineProductMock[]
