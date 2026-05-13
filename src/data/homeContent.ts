import mainScanButton from "../assets/main_scan_button.png"
import scanIcon from "../assets/svg/scan.svg"
import todayPairingBanner from "../assets/today_pairing_banner01.png"
import todayPairingBanner02 from "../assets/today_pairing_banner02.png"
import todayPairingBanner03 from "../assets/today_pairing_banner03.png"
import todayPairingBanner04 from "../assets/today_pairing_banner04.png"
import todayQuizBanner from "../assets/today_quiz_banner.png"
import todayVoteMascot from "../assets/today_vote_mascot.png"
import voteBeerPizza from "../assets/vote_beer_pizza.png"
import voteSteakWine from "../assets/vote_steak_wine.png"
import momentPickSolo from "../assets/situation_solo.png"
import momentPickFriends from "../assets/situation_friends.png"
import momentPickFamily from "../assets/situation_family.png"
import momentPickDate from "../assets/situation_date.png"
import momentPickGroup from "../assets/situation_group.png"
import pairingRedWineCheesePlatter from "../assets/pairing_red_wine_cheese_platter.svg"
import pairingWhiteWineTomato from "../assets/pairing_white_wine_tomato.svg"
import pairingBestBadge from "../assets/pairing_best_badge.png"
import weeklyRankingBadge01 from "../assets/weekly_ranking_badge_01.png"
import weeklyRankingBadge03 from "../assets/weekly_ranking_badge_03.png"
import weeklyBestMascot from "../assets/weekly_best_mascot.png"
import drinkJinroIsBack from "../assets/drink_jinro_is_back.png"
import foodSamgyeopsal from "../assets/food_samgyeopsal.png"

export const homeAssets = {
  mainScanButton,
  scanIcon,
  todayPairingBanner,
  todayPairingBanner02,
  todayPairingBanner03,
  todayPairingBanner04,
  todayQuizBanner,
  todayVoteMascot,
  voteBeerPizza,
  voteSteakWine,
  momentPickSolo,
  momentPickFriends,
  momentPickFamily,
  momentPickDate,
  momentPickGroup,
  pairingRedWineCheesePlatter,
  pairingWhiteWineTomato,
  pairingBestBadge,
  weeklyRankingBadge01,
  weeklyRankingBadge03,
  weeklyBestMascot,
  drinkJinroIsBack,
  foodSamgyeopsal,
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
    description: "달콤함과 고소함 사이를 가로지르는\n산뜻한 와인의 터치, 훌륭한 미식의 순간",
  },
  {
    title: "소세지나초 × 산토리하이볼",
    description: "신선한 탄산과 적절한 산미의 균형으로 완성된,\n실패 없는 미식 공식",
  },
  {
    title: "보쌈 × 소주",
    description: "맑고 깨끗한 조화, 담백한 보쌈과 투명한 소주가 만드는\n미니멀한 미식",
  },
] as const

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()]/g, "")
    .replace(/[·/,_-]/g, "")
    .trim()
}

export function resolveVoteOptionIconSrc(title: string): string | undefined {
  const key = normalizeKey(title)
  if (!key) return undefined
  if (key.includes("맥주") && key.includes("피자")) return homeAssets.voteBeerPizza
  if (key.includes("스테이크") && key.includes("와인")) return homeAssets.voteSteakWine
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
    title: "레드와인 × 치즈플래터",
    subtitle: "깊은 풍미와 고소함의 조화",
    thumbSrc: homeAssets.pairingRedWineCheesePlatter,
    tags: ["부드러운 맛", "고소함"],
    badgeSrc: homeAssets.pairingBestBadge,
  },
  {
    id: "moment-pick-2",
    title: "화이트와인 × 토마토",
    subtitle: "산뜻한 산미가 깔끔하게",
    thumbSrc: homeAssets.pairingWhiteWineTomato,
    tags: ["상큼함", "깔끔함"],
    badgeSrc: undefined,
  },
] as const

export const homeWeeklyRankingCards = [
  {
    id: "weekly-rank-1",
    badgeSrc: homeAssets.weeklyRankingBadge01,
    title: "진로 이즈백",
    subtitle: "삼겹살",
    drinkSrc: homeAssets.drinkJinroIsBack,
    foodSrc: homeAssets.foodSamgyeopsal,
    scoreLabel: "★ 5",
    isCenter: true,
  },
  {
    id: "weekly-rank-2",
    badgeSrc: homeAssets.weeklyRankingBadge03,
    title: "추천 페어링",
    subtitle: "오늘의 안주",
    drinkSrc: homeAssets.drinkJinroIsBack,
    foodSrc: homeAssets.foodSamgyeopsal,
    scoreLabel: "★ 4.5",
    isCenter: false,
  },
  {
    id: "weekly-rank-3",
    badgeSrc: homeAssets.weeklyRankingBadge03,
    title: "추천 페어링",
    subtitle: "오늘의 안주",
    drinkSrc: homeAssets.drinkJinroIsBack,
    foodSrc: homeAssets.foodSamgyeopsal,
    scoreLabel: "★ 4.9",
    isCenter: false,
  },
] as const
