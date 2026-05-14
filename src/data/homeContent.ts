import mainScanButton from "../assets/main_scan_button_01.png"
import scanIcon from "../assets/svg/scan.svg"
import todayPairingBanner from "../assets/today_pairing_banner01.png"
import todayPairingBanner02 from "../assets/today_pairing_banner02.png"
import todayPairingBanner03 from "../assets/today_pairing_banner03.png"
import todayPairingBanner04 from "../assets/today_pairing_banner04.png"
import todayPairingMascot from "../assets/today_pairing_mascot_01.png"
import todayQuizBanner from "../assets/today_quiz_banner_01.png"
import todayVoteMascot from "../assets/today_vote_mascot_01.png"
import voteBeerPizza from "../assets/vote_beer_pizza_01.png"
import voteSteakWine from "../assets/vote_steak_wine_01.png"
import voteSojuRamen from "../assets/vote_soju_ramen_01.png"
import voteWineCheese from "../assets/vote_wine_cheese_01.png"
import voteDrinkSoju from "../assets/vote_drink_soju_01.png"
import voteDrinkBeer from "../assets/vote_drink_beer_01.png"
import voteColdCannedBeer from "../assets/vote_cold_canned_beer_01.png"
import voteVodkaMix from "../assets/vote_vodka_mix_01.png"
import voteMakgeolliPajeon from "../assets/vote_makgeolli_pajeon_01.png"
import momentPickSolo from "../assets/situation_solo.png"
import momentPickFriends from "../assets/situation_friends.png"
import momentPickFamily from "../assets/situation_family.png"
import momentPickDate from "../assets/situation_date.png"
import momentPickGroup from "../assets/situation_group.png"
import pairingRedWineCheesePlatter from "../assets/pairing_red_wine_cheese_platter_01.png"
import pairingWhiteWineTomato from "../assets/pairing_white_wine_tomato_01.png"
import weeklyRankingBadge01 from "../assets/weekly_ranking_badge_01.png"
import weeklyRankingBadge02 from "../assets/weekly_ranking_badge_02.png"
import weeklyRankingBadge03 from "../assets/weekly_ranking_badge_03.png"
import weeklyRankingBadge04 from "../assets/weekly_ranking_badge_04.png"
import weeklyRankingBadge05 from "../assets/weekly_ranking_badge_05.png"
import weeklyBestMascot from "../assets/weekly_best_mascot_01.png"
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

export const homeAssets = {
  mainScanButton,
  scanIcon,
  todayPairingBanner,
  todayPairingBanner02,
  todayPairingBanner03,
  todayPairingBanner04,
  todayPairingMascot,
  todayQuizBanner,
  todayVoteMascot,
  voteBeerPizza,
  voteSteakWine,
  voteSojuRamen,
  voteWineCheese,
  voteDrinkSoju,
  voteDrinkBeer,
  voteColdCannedBeer,
  voteVodkaMix,
  voteMakgeolliPajeon,
  momentPickSolo,
  momentPickFriends,
  momentPickFamily,
  momentPickDate,
  momentPickGroup,
  pairingRedWineCheesePlatter,
  pairingWhiteWineTomato,
  weeklyRankingBadge01,
  weeklyRankingBadge02,
  weeklyRankingBadge03,
  weeklyRankingBadge04,
  weeklyRankingBadge05,
  weeklyBestMascot,
  drinkJinroIsBack,
  foodSamgyeopsal,
  drinkHwayo25,
  drinkBoksoondogaMakgeolli,
  drinkCass,
  drinkClaret2010,
  foodHoeMuchim,
  foodHaemulPajeon,
  foodFriedChicken,
  foodSirloinSteak,
} as const

export const homeTodayPairingBanners = [
  homeAssets.todayPairingBanner,
  homeAssets.todayPairingBanner02,
  homeAssets.todayPairingBanner03,
  homeAssets.todayPairingBanner04,
] as const

export const homeTodayPairingCopy = [
  {
    title: "참치타다키 × 하쿠라쿠세이",
    description: "신선함과 산미의 균형,\n깔끔한 맛의 조화",
  },
  {
    title: "복숭아브리치즈 × 소비뇽블랑",
    description: "달콤함과 고소함 사이를 가로지르는\n산뜻한 와인의 터치",
  },
  {
    title: "소세지나초 × 산토리하이볼",
    description: "신선한 탄산과 적절한 산미의 균형으로\n실패 없는 미식 공식",
  },
  {
    title: "보쌈 × 소주",
    description: "맑고 깨끗한 조화, 담백한 보쌈과 투명한\n소주가 만드는 미묘한 미식",
  },
] as const

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()]/g, "")
    .replace(/[쨌/,_-]/g, "")
    .trim()
}

export function resolveVoteOptionIconSrc(title: string): string | undefined {
  const key = normalizeKey(title)
  if (!key) return undefined
  if (key.includes("맥주") && (key.includes("피자") || key.includes("치킨"))) return homeAssets.voteBeerPizza
  if (key.includes("스테이크") && key.includes("와인")) return homeAssets.voteSteakWine
  if (key.includes("소주") && key.includes("라면")) return homeAssets.voteSojuRamen
  if (key.includes("와인") && key.includes("치즈")) return homeAssets.voteWineCheese
  if (key.includes("보드카믹스") || (key.includes("보드카") && key.includes("믹스"))) return homeAssets.voteVodkaMix
  if (key.includes("막걸리") && (key.includes("파전") || (key.includes("전") && key.includes("시장"))))
    return homeAssets.voteMakgeolliPajeon
  if (key.includes("캔맥주") || key.includes("캔")) return homeAssets.voteColdCannedBeer
  if (key === "소주" || (key.includes("소주") && !key.includes("라면"))) return homeAssets.voteDrinkSoju
  if (key === "맥주" || (key.includes("맥주") && !key.includes("피자") && !key.includes("치킨"))) return homeAssets.voteDrinkBeer
  return undefined
}

export const homeMomentPickItems = [
  { key: "solo", label: "혼술", iconSrc: homeAssets.momentPickSolo },
  { key: "friends", label: "친구/파티", iconSrc: homeAssets.momentPickFriends },
  { key: "family", label: "가족", iconSrc: homeAssets.momentPickFamily },
  { key: "date", label: "데이트", iconSrc: homeAssets.momentPickDate },
  { key: "group", label: "모임/단체", iconSrc: homeAssets.momentPickGroup },
] as const

export const homeMomentPickCards = [
  {
    id: "moment-pick-1",
    title: "레드와인 × 치즈 플래터",
    subtitle: "깊고 진한 풍미, 고소함의 조화",
    thumbSrc: homeAssets.pairingRedWineCheesePlatter,
    tags: ["부드러운맛", "고소함"],
    badgeText: "BEST",
  },
  {
    id: "moment-pick-2",
    title: "화이트와인 × 토마토",
    subtitle: "상큼함이 톡 터지는 순간",
    thumbSrc: homeAssets.pairingWhiteWineTomato,
    tags: ["상큼함", "깔끔함"],
    badgeText: undefined,
  },
] as const

export const homeWeeklyRankingCards = [
  {
    id: "weekly-rank-2",
    badgeSrc: homeAssets.weeklyRankingBadge02,
    title: "화요25",
    subtitle: "회무침",
    drinkSrc: homeAssets.drinkHwayo25,
    foodSrc: homeAssets.foodHoeMuchim,
    scoreLabel: "6,124짠",
    isCenter: false,
  },
  {
    id: "weekly-rank-3",
    badgeSrc: homeAssets.weeklyRankingBadge03,
    title: "복순도가 막걸리",
    subtitle: "해물파전",
    drinkSrc: homeAssets.drinkBoksoondogaMakgeolli,
    foodSrc: homeAssets.foodHaemulPajeon,
    scoreLabel: "6,321짠",
    isCenter: false,
  },
  {
    id: "weekly-rank-1",
    badgeSrc: homeAssets.weeklyRankingBadge01,
    title: "진로 이즈백",
    subtitle: "삼겹살",
    drinkSrc: homeAssets.drinkJinroIsBack,
    foodSrc: homeAssets.foodSamgyeopsal,
    scoreLabel: "7,621짠",
    isCenter: true,
  },
  {
    id: "weekly-rank-4",
    badgeSrc: homeAssets.weeklyRankingBadge04,
    title: "카스",
    subtitle: "후라이드 치킨",
    drinkSrc: homeAssets.drinkCass,
    foodSrc: homeAssets.foodFriedChicken,
    scoreLabel: "5,921짠",
    isCenter: false,
  },
  {
    id: "weekly-rank-5",
    badgeSrc: homeAssets.weeklyRankingBadge05,
    title: "클라렛 2010",
    subtitle: "등심 스테이크",
    drinkSrc: homeAssets.drinkClaret2010,
    foodSrc: homeAssets.foodSirloinSteak,
    scoreLabel: "5,421짠",
    isCenter: false,
  },
] as const


