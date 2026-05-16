import products from "./whiskeyProductsMock.json"

export type WhiskeyProductMock = {
  id: string
  categoryId: "whisky"
  subcategory: string
  name: string
  priceWon: number
  abv?: number
  tags: string[]
  keywords: string[]
}

export const whiskeyProductsMock = products as WhiskeyProductMock[]
