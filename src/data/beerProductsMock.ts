import products from "./beerProductsMock.json"

export type BeerProductMock = {
  id: string
  categoryId: "beer"
  subcategory: string
  name: string
  priceWon: number
  abv?: number
  tags: string[]
  keywords: string[]
}

export const beerProductsMock = products as BeerProductMock[]
