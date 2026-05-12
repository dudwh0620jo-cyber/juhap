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
    name: "닷사이 23",
    englishName: "dassai 23",
    parentCategory: "사케",
    subCategory: "준마이 다이긴죠 / 다이긴죠",
    country: "일본",
    rating: 4.8,
    reviewCount: 22134,
    imageSrc: autoPairingDrink01Image,
  },
]

export const pairingWriteFoodMocks: PairingWriteFoodMock[] = [
  {
    name: "닭꼬치",
    parentCategory: "일식",
    rating: 4.7,
    reviewCount: 14821,
    imageSrc: autoPairingFood01Image,
  },
]
