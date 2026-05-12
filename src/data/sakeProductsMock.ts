import { READY_SUBCATEGORY } from "./categoryData"
import products from "./sakeProductsMock.json"

export type SakeProductMock = {
  id: string
  categoryId: "sake"
  subcategory: string
  name: string
  subtitle: string
  priceWon: number
  tags: string[]
  keywords: string[]
  chat: {
    notes: string[]
    tastingNotes: string[]
    awards: string[]
    pairingFoods: string[]
    tips: string[]
  }
}

export const SAKE_READY_SUBCATEGORY = READY_SUBCATEGORY
export const sakeProductsMock = products as SakeProductMock[]
