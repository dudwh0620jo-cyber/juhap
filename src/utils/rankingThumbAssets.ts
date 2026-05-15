import weeklyRankingBadge01 from "../assets/weekly_ranking_badge_01.png"
import weeklyRankingBadge02 from "../assets/weekly_ranking_badge_02.png"
import weeklyRankingBadge03 from "../assets/weekly_ranking_badge_03.png"

import drinkJinroIsBack from "../assets/drink_jinro_is_back_01.png"
import drinkHwayo25 from "../assets/drink_hwayo_25.png"
import drinkBoksoondogaMakgeolli from "../assets/drink_boksoondoga_makgeolli_01.png"
import drinkCass from "../assets/drink_cass_01.png"
import drinkClaret2010 from "../assets/drink_claret_2010.png"

import foodSamgyeopsal from "../assets/food_samgyeopsal_01.png"
import foodHoeMuchim from "../assets/food_hoe_muchim_01.png"
import foodHaemulPajeon from "../assets/food_haemul_pajeon_01.png"
import foodFriedChicken from "../assets/food_fried_chicken_01.png"
import foodSirloinSteak from "../assets/food_sirloin_steak_01.png"

export function getRankingRankBadgeSrc(rank: 1 | 2 | 3) {
  if (rank === 1) return weeklyRankingBadge01
  if (rank === 2) return weeklyRankingBadge02
  return weeklyRankingBadge03
}

const TOP5_THUMB_BY_RANKING_ID: Record<number, { drinkSrc: string; foodSrc: string }> = {
  // weekly top 5 ids (rankingData.ts weekly all top3 + rows rank 4/5)
  1005: { drinkSrc: drinkJinroIsBack, foodSrc: foodSamgyeopsal },
  1002: { drinkSrc: drinkHwayo25, foodSrc: foodHoeMuchim },
  1006: { drinkSrc: drinkBoksoondogaMakgeolli, foodSrc: foodHaemulPajeon },
  1025: { drinkSrc: drinkCass, foodSrc: foodFriedChicken },
  1010: { drinkSrc: drinkClaret2010, foodSrc: foodSirloinSteak },
}

const DRINK_THUMB_BY_NAME: Record<string, string> = {
  "진로 이즈백": drinkJinroIsBack,
  "화요25": drinkHwayo25,
  "복순도가 막걸리": drinkBoksoondogaMakgeolli,
  "카스": drinkCass,
  "클라렛 2010": drinkClaret2010,
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
