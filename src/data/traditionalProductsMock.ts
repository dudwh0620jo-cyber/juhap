import products from "./traditionalProductsMock.json"

export type TraditionalProductMock = {
  id: string
  categoryId: "traditional"
  subcategory: string
  name: string
  priceWon: number
  abv?: number
  tags: string[]
  keywords: string[]
}

export const traditionalProductsMock = products as TraditionalProductMock[]
