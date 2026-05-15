import products from "./etcProductsMock.json"

export type EtcProductMock = {
  id: string
  categoryId: "etc"
  subcategory: string
  name: string
  priceWon: number
  abv?: number
  tags: string[]
  keywords: string[]
}

export const etcProductsMock = products as EtcProductMock[]
