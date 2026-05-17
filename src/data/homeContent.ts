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
import voteMakgeolliJeon from "../assets/vote_makgeolli_jeon_01.png"
import voteHighballFries from "../assets/vote_highball_fries_01.png"
import voteMiniWineBottle from "../assets/vote_mini_wine_bottle_01.png"
import momentPickSolo from "../assets/situation_solo.png"
import momentPickFriends from "../assets/situation_friends.png"
import momentPickFamily from "../assets/situation_family.png"
import momentPickDate from "../assets/situation_date.png"
import momentPickGroup from "../assets/situation_group.png"
import momentSoloSake01 from "../assets/moment_solo_sake_01.png"
import momentSoloHighball01 from "../assets/moment_solo_highball_01.png"
import momentGroupSoju01 from "../assets/moment_group_soju_01.png"
import momentGroupBeer01 from "../assets/moment_group_beer_01.png"
import momentFamilySoju01 from "../assets/moment_family_soju_01.png"
import momentFamilyBeer01 from "../assets/moment_family_beer_01.png"
import momentDateRedWine01 from "../assets/moment_date_red_wine_01.png"
import momentDateChampagne01 from "../assets/moment_date_champagne_01.png"
import pairingRedWineCheesePlatter from "../assets/pairing_red_wine_cheese_platter_01.png"
import pairingWhiteWineTomato from "../assets/pairing_white_wine_tomato_01.png"
import weeklyRankingBadge01 from "../assets/weekly_ranking_badge_01.png"
import weeklyRankingBadge02 from "../assets/weekly_ranking_badge_02.png"
import weeklyRankingBadge03 from "../assets/weekly_ranking_badge_03.png"
import weeklyRankingBadge04 from "../assets/weekly_ranking_badge_04.png"
import weeklyRankingBadge05 from "../assets/weekly_ranking_badge_05.png"
import weeklyBestMascot from "../assets/weekly_best_mascot_01.png"
import homeFood01 from "../assets/home_food01.png"
import homeFood02 from "../assets/home_food02.png"
import homeFood03 from "../assets/home_food03.png"
import homeFood04 from "../assets/home_food04.png"
import homeFood05 from "../assets/home_food05.png"
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
import { getRankingPairLabel, rankingDataByPeriod } from "../utils/rankingData"
import { getRankingDrinkSrcForItem } from "../utils/rankingThumbAssets"

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
  voteMakgeolliJeon,
  voteHighballFries,
  voteMiniWineBottle,
  momentPickSolo,
  momentPickFriends,
  momentPickFamily,
  momentPickDate,
  momentPickGroup,
  momentSoloSake01,
  momentSoloHighball01,
  momentGroupSoju01,
  momentGroupBeer01,
  momentFamilySoju01,
  momentFamilyBeer01,
  momentDateRedWine01,
  momentDateChampagne01,
  pairingRedWineCheesePlatter,
  pairingWhiteWineTomato,
  weeklyRankingBadge01,
  weeklyRankingBadge02,
  weeklyRankingBadge03,
  weeklyRankingBadge04,
  weeklyRankingBadge05,
  weeklyBestMascot,
  homeFood01,
  homeFood02,
  homeFood03,
  homeFood04,
  homeFood05,
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
  if (key.includes("하이볼") && (key.includes("감자") || key.includes("감자튀김") || key.includes("후라이")))
    return homeAssets.voteHighballFries
  if (key.includes("소주") && key.includes("라면")) return homeAssets.voteSojuRamen
  if (key.includes("와인") && key.includes("치즈")) return homeAssets.voteWineCheese
  if (key.includes("보드카믹스") || (key.includes("보드카") && key.includes("믹스"))) return homeAssets.voteVodkaMix
  if (key.includes("미니") && key.includes("와인")) return homeAssets.voteMiniWineBottle
  if (key.includes("막걸리") && key.includes("파전")) return homeAssets.voteMakgeolliPajeon
  if (key.includes("막걸리") && key.includes("전")) return homeAssets.voteMakgeolliJeon
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

export const homeMomentPickCardsBySituation = {
  solo: [
    {
      id: "moment-pick-solo-1",
      title: "하이볼 × 감자전",
      subtitle: "탄산의 산뜻함과 감자전의 고소한 조화",
      thumbSrc: homeAssets.momentSoloHighball01,
      tags: ["산뜻함", "고소함"],
      badgeText: "BEST",
    },
    {
      id: "moment-pick-solo-2",
      title: "사케 × 연어사시미",
      subtitle: "사케의 은은한 향과 연어의 부드러운 감칠맛",
      thumbSrc: homeAssets.momentSoloSake01,
      tags: ["부드러움", "깔끔함"],
      badgeText: undefined,
    },
  ],
  friends: [
    {
      id: "moment-pick-friends-1",
      title: "레드와인 × 치즈 플래터",
      subtitle: "깊고 진한 풍미, 고소함의 조화",
      thumbSrc: homeAssets.pairingRedWineCheesePlatter,
      tags: ["부드러운맛", "고소함"],
      badgeText: "BEST",
    },
    {
      id: "moment-pick-friends-2",
      title: "화이트와인 × 토마토",
      subtitle: "상큼함이 톡 터지는 순간",
      thumbSrc: homeAssets.pairingWhiteWineTomato,
      tags: ["상큼함", "깔끔함"],
      badgeText: undefined,
    },
  ],
  family: [
    {
      id: "moment-pick-family-1",
      title: "소주 × 삼겹살",
      subtitle: "소주의 깔끔함과 삼겹살의 기름진 풍미",
      thumbSrc: homeAssets.momentFamilySoju01,
      tags: ["고소함", "깔끔함"],
      badgeText: "BEST",
    },
    {
      id: "moment-pick-family-2",
      title: "맥주 × 닭갈비",
      subtitle: "맥주의 청량감과 닭갈비의 매콤달콤 조화",
      thumbSrc: homeAssets.momentFamilyBeer01,
      tags: ["매콤함", "청량함"],
      badgeText: undefined,
    },
  ],
  date: [
    {
      id: "moment-pick-date-1",
      title: "레드와인 × 스테이크",
      subtitle: "깊은 풍미의 스테이크와 육향의 어울림",
      thumbSrc: homeAssets.momentDateRedWine01,
      tags: ["풍부함", "고소함"],
      badgeText: "BEST",
    },
    {
      id: "moment-pick-date-2",
      title: "샴페인 × 딸기치즈케이크",
      subtitle: "샴페인의 산미와 치즈케이크의 달콤한 조화",
      thumbSrc: homeAssets.momentDateChampagne01,
      tags: ["달콤함", "산뜻함"],
      badgeText: undefined,
    },
  ],
  group: [
    {
      id: "moment-pick-group-1",
      title: "맥주 × 치킨",
      subtitle: "시원한 탄산과 치킨의 바삭한 짭짤한 맛",
      thumbSrc: homeAssets.momentGroupBeer01,
      tags: ["바삭함", "청량함"],
      badgeText: "BEST",
    },
    {
      id: "moment-pick-group-2",
      title: "소주 × 보쌈",
      subtitle: "소주의 깔끔한 맛과 보쌈의 담백한 조합",
      thumbSrc: homeAssets.momentGroupSoju01,
      tags: ["담백함", "깔끔함"],
      badgeText: undefined,
    },
  ],
} as const

const homeWeeklyRankingBadges = [
  homeAssets.weeklyRankingBadge01,
  homeAssets.weeklyRankingBadge02,
  homeAssets.weeklyRankingBadge03,
  homeAssets.weeklyRankingBadge04,
  homeAssets.weeklyRankingBadge05,
] as const

const homeWeeklyRankingFoods = [
  homeAssets.homeFood01,
  homeAssets.homeFood05,
  homeAssets.homeFood02,
  homeAssets.homeFood03,
  homeAssets.homeFood04,
] as const

const weeklyRankingData = rankingDataByPeriod.weekly
const weeklyRankingTop5Rows = weeklyRankingData.rows
  .filter((row) => row.rank === 4 || row.rank === 5)
  .sort((a, b) => a.rank - b.rank)

const homeWeeklyRankingTop5 = [...weeklyRankingData.podiumByCategory.all, ...weeklyRankingTop5Rows].slice(0, 5)

const splitRankingPair = (pair: string) => {
  const [drink = "", food = ""] = pair.split("+").map((part) => part.trim())
  return { drink, food }
}

const getHomeWeeklyDrinkClassName = (id: number) => {
  if (id === 1005) return "is_cass"
  if (id === 1025) return "is_heineken"
  return undefined
}

export const homeWeeklyRankingCards = homeWeeklyRankingTop5.map((item, index) => {
  const { drink, food } = splitRankingPair(getRankingPairLabel(item.id))
  const rank = index + 1

  return {
    id: `weekly-rank-${rank}`,
    communityPairingId: item.id,
    badgeSrc: homeWeeklyRankingBadges[index],
    title: drink,
    subtitle: food,
    drinkSrc: getRankingDrinkSrcForItem(item.id, item.rank) ?? homeAssets.drinkJinroIsBack,
    foodSrc: homeWeeklyRankingFoods[index],
    scoreLabel: `${(item.votes ?? 0).toLocaleString("ko-KR")}짠`,
    isCenter: rank === 1,
    drinkClassName: getHomeWeeklyDrinkClassName(item.id),
  }
})
