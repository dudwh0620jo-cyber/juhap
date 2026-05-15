import products from "./sojuProductsMock.json"

export type SojuProductMock = {
  id: string
  categoryId: "soju"
  subcategory: string
  name: string
  priceWon: number
  abv?: number
  tags: string[]
  keywords: string[]
}

export const sojuProductsMock = products as SojuProductMock[]
