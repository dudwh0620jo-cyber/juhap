import rankingBest from "../assets/rankimg/ranking_best.png"
import rankingNumber1 from "../assets/rankimg/ranking_number1.png"
import rankingNumber2 from "../assets/rankimg/ranking_number2.png"
import rankingNumber3 from "../assets/rankimg/ranking_number3.png"
import rankingDrink1 from "../assets/rankimg/ranking_drink1.png"
import rankingDrink2 from "../assets/rankimg/ranking_drink2.png"
import rankingDrink3 from "../assets/rankimg/ranking_drink3.png"
import rankingDrink4 from "../assets/rankimg/ranking_drink4.png"
import rankingDrink5 from "../assets/rankimg/ranking_drink5.png"
import rankingDrink6 from "../assets/rankimg/ranking_drink6.png"
import rankingDrink7 from "../assets/rankimg/ranking_drink7.png"
import rankingDrink8 from "../assets/rankimg/ranking_drink8.png"
import rankingDrink9 from "../assets/rankimg/ranking_drink9.png"
import rankingDrink10 from "../assets/rankimg/ranking_drink10.png"
import rankingDrink11 from "../assets/rankimg/ranking_drink11.png"
import rankingDrink12 from "../assets/rankimg/ranking_drink12.png"
import rankingDrink13 from "../assets/rankimg/ranking_drink13.png"
import rankingDrink14 from "../assets/rankimg/ranking_drink14.png"
import rankingDrink15 from "../assets/rankimg/ranking_drink15.png"
import rankingDrink16 from "../assets/rankimg/ranking_drink16.png"
import rankingDrink17 from "../assets/rankimg/ranking_drink17.png"
import rankingDrink18 from "../assets/rankimg/ranking_drink18.png"
import rankingDrink20 from "../assets/rankimg/ranking_drink20.png"
import rankingDrink21 from "../assets/rankimg/ranking_drink21.png"
import rankingDrinkSoju1 from "../assets/rankimg/ranking_drink_soju1.png"
import rankingDrinkSoju2 from "../assets/rankimg/ranking_drink_soju2.png"
import rankingDrinkSoju3 from "../assets/rankimg/ranking_drink_soju3.png"
import rankingDrinkSoju4 from "../assets/rankimg/ranking_drink_soju4.png"
import rankingDrinkSoju5 from "../assets/rankimg/ranking_drink_soju5.png"
import rankingDrinkSoju6 from "../assets/rankimg/ranking_drink_soju6.png"
import rankingDrinkSoju7 from "../assets/rankimg/ranking_drink_soju7.png"
import rankingDrinkSoju8 from "../assets/rankimg/ranking_drink_soju8.png"

import drinkJinroIsBack from "../assets/drink_jinro_is_back_01.png"
import drinkHwayo25 from "../assets/drink_hwayo_25.png"
import drinkBoksoondogaMakgeolli from "../assets/drink_boksoondoga_makgeolli_01.png"
import drinkCass from "../assets/drink_cass_01.png"
import drinkClaret2010 from "../assets/drink_claret_2010.png"
import drinkMoetChandon from "../assets/drink_moet_chandon_brut_imperial_01.png"
import drinkSlowVillageMakgeolli from "../assets/drink_slow_village_makgeolli_01.png"

import foodSamgyeopsal from "../assets/food_samgyeopsal_01.png"
import foodHoeMuchim from "../assets/food_hoe_muchim_01.png"
import foodHaemulPajeon from "../assets/food_haemul_pajeon_01.png"
import foodFriedChicken from "../assets/food_fried_chicken_01.png"
import foodSirloinSteak from "../assets/food_sirloin_steak_01.png"
import foodChickenNeckSaltGrill from "../assets/food_chicken_neck_salt_grill.png"
import foodTruffleCreamPasta from "../assets/food_truffle_cream_pasta_01.png"
import foodNeurinmaeulGamjajeon from "../assets/recommended_neurinmaeul_gamjajeon.png"
import { feedPosts } from "./communityPosts"
import { resolveReviewImage } from "./reviewImages"

export function getRankingRankBadgeSrc(rank: 1 | 2 | 3) {
  if (rank === 1) return rankingNumber1
  if (rank === 2) return rankingNumber2
  return rankingNumber3
}

export function getRankingBestCharacterSrc() {
  return rankingBest
}

const RANKING_DRINK_BY_RANK: Record<number, string> = {
  1: rankingDrink1,
  2: rankingDrink2,
  3: rankingDrink3,
  4: rankingDrink4,
  5: rankingDrink5,
  6: rankingDrink6,
  7: rankingDrink7,
  8: rankingDrink8,
  9: rankingDrink9,
  10: rankingDrink10,
}

const RANKING_DRINK_BY_ID: Record<number, string> = {
  1005: rankingDrink1,
  1002: rankingDrink2,
  1006: rankingDrink3,
  1025: rankingDrink4,
  1009: rankingDrink5,
  1010: rankingDrink6,
  1001: rankingDrink7,
  1004: rankingDrink4,
  1007: rankingDrink18,
  99003: rankingDrink8,
  1101: rankingDrink9,
  1102: rankingDrink9,
  1003: rankingDrink10,
  1008: rankingDrink17,
  91013: rankingDrink1,
  91012: rankingDrink7,
  99001: rankingDrink20,
  99002: rankingDrink21,
  92003: rankingDrink11,
  92004: rankingDrink12,
  92005: rankingDrink11,
  92006: rankingDrink13,
  92007: rankingDrink14,
  92008: rankingDrink15,
  92009: rankingDrink16,
  92010: rankingDrink13,
}

const RANKING_PHOTO_BY_ID: Record<number, string> = {
  92003: rankingDrinkSoju1,
  92004: rankingDrinkSoju2,
  92005: rankingDrinkSoju3,
  92006: rankingDrinkSoju4,
  92007: rankingDrinkSoju5,
  92008: rankingDrinkSoju6,
  92009: rankingDrinkSoju7,
  92010: rankingDrinkSoju8,
}

export function getRankingDrinkSrcForItem(id: number, rank: number) {
  return RANKING_DRINK_BY_ID[id] ?? RANKING_DRINK_BY_RANK[rank] ?? null
}

export function getRankingPostPhotoSrc(id: number) {
  const dummyPhotoSrc = RANKING_PHOTO_BY_ID[id]
  if (dummyPhotoSrc) return dummyPhotoSrc

  const post = feedPosts.find((item) => item.id === id)
  const photoId = post?.photoIds?.find((item) => item.trim().length > 0)
  return photoId ? (resolveReviewImage(photoId) ?? null) : null
}

const TOP5_THUMB_BY_RANKING_ID: Record<number, { drinkSrc: string; foodSrc: string }> = {
  // weekly top 5 ids (rankingData.ts weekly all top3 + rows rank 4/5)
  1005: { drinkSrc: drinkCass, foodSrc: foodChickenNeckSaltGrill },
  1002: { drinkSrc: drinkMoetChandon, foodSrc: foodTruffleCreamPasta },
  1006: { drinkSrc: drinkSlowVillageMakgeolli, foodSrc: foodNeurinmaeulGamjajeon },
  1025: { drinkSrc: drinkCass, foodSrc: foodFriedChicken },
  1009: { drinkSrc: drinkBoksoondogaMakgeolli, foodSrc: foodHaemulPajeon },
}

const DRINK_THUMB_BY_NAME: Record<string, string> = {
  "진로 이즈백": drinkJinroIsBack,
  "화요25": drinkHwayo25,
  "복순도가 막걸리": drinkBoksoondogaMakgeolli,
  "카스": drinkCass,
  "하이네켄": rankingDrink4,
  "기네스": rankingDrink18,
  "클라렛 2010": drinkClaret2010,
  "샤도네이": rankingDrink17,
  "쥬욘다이 혼마루": rankingDrink20,
  "쿠보타 만쥬": rankingDrink21,
  "닷사이 23": rankingDrink9,
}

const FOOD_THUMB_BY_NAME: Record<string, string> = {
  "삼겹살": foodSamgyeopsal,
  "회무침": foodHoeMuchim,
  "해물파전": foodHaemulPajeon,
  "후라이드 치킨": foodFriedChicken,
  "등심 스테이크": foodSirloinSteak,
}

export function getRankingThumbSrc(kind: "drink" | "food", name: string) {
  const trimmed = name.trim()
  if (!trimmed) return null
  return kind === "drink" ? (DRINK_THUMB_BY_NAME[trimmed] ?? null) : (FOOD_THUMB_BY_NAME[trimmed] ?? null)
}

export function getRankingThumbSrcById(kind: "drink" | "food", id: number) {
  const entry = TOP5_THUMB_BY_RANKING_ID[id]
  if (!entry) return null
  return kind === "drink" ? entry.drinkSrc : entry.foodSrc
}
