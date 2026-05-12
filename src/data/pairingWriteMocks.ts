import autoPairingDrink01Image from "../assets/auto_pairing_drink_01.png"
import autoPairingFood01Image from "../assets/auto_pairing_food_01.png"

export type PairingWriteDrinkMock = {
  name: string
  englishName: string
  parentCategory: string
  subCategory: string
  country: string
  rating: number
  reviewCount: number
  imageSrc: string
}

export type PairingWriteFoodMock = {
  name: string
  parentCategory: string
  rating: number
  reviewCount: number
  imageSrc: string
}

export const pairingWriteDrinkMocks: PairingWriteDrinkMock[] = [
  {
    name: "하이네켄",
    englishName: "heineken",
    parentCategory: "맥주",
    subCategory: "라거 / 필스너",
    country: "네덜란드",
    rating: 4.2,
    reviewCount: 13422,
    imageSrc: autoPairingDrink01Image,
  },
]

export const pairingWriteFoodMocks: PairingWriteFoodMock[] = [
  {
    name: "토마토 파스타",
    parentCategory: "양식",
    rating: 4.8,
    reviewCount: 17212,
    imageSrc: autoPairingFood01Image,
  },
]

