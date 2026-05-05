import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { useLocation, useNavigate } from "react-router"
import "../styles/community.css"
import CommunityHeader from "../components/CommunityHeader"
import FeedSegmentTabs from "../components/FeedSegmentTabs"
import CommunityBookmarkPickerModal from "../components/CommunityBookmarkPickerModal"
import RelatedContentPostCard from "../components/RelatedContentPostCard"
import HallOfFamePostCard from "../components/HallOfFamePostCard"
import QuestionPostRow from "../components/QuestionPostRow"
import CommunitySearchInput from "../components/CommunitySearchInput"
import CommunityFeedFilterPopupBody from "../components/CommunityFeedFilterPopupBody"
import FeedWriteRow from "../components/FeedWriteRow"
import { extractPairingTitle, feedPosts as communityFeedPosts, type FeedPost } from "../utils/communityPosts"
import { type FeedFilter, type PopupChipGroup, useCommunityPageData } from "../hooks/useCommunityPageData"
import { includesNormalized, normalizeSearchText } from "../utils/text"
import { useStoredBooleanRecordFromIds, useStoredNumberSet, useStoredStringArray } from "../utils/storage"

// NOTE: The contents of `src/pages/community/*` were inlined into this file so the `community` folder can be deleted.
// This is intentionally a single-file bundle for the Community page (as requested).

// FeedPost is sourced from `src/utils/communityPosts.ts` so list/detail stay consistent.
// Shared helpers live in `src/utils/*` and are imported above.


const feedPosts: FeedPost[] = communityFeedPosts
/*
  {
    id: 1001,
    authorId: 2003,
    authorName: "서연",
    title: "하이볼 + 삼겹살",
    body: "집에서 해먹을 때는 기름기 있는 부위일수록 도수/탄산 선택이 달라지더라고요. 저만의 기준 공유합니다.",
    createdAt: "2026-05-01T09:12:00+09:00",
    likeCount: 320,
    commentCount: 28,
    popularityScore: 402,
    profile: "30대 / 서울 / 소주 · 맥주 선호",
    locationLabel: "아늑한 내방",
    searchTags: ["기타", "하이볼", "소주토닉", "삼겹살", "가벼운", "톡쏘는", "과일향"],
    drinkType: "기타",
    categories: ["하이볼"],
    features: ["가벼운", "톡쏘는", "과일향"],
    foods: ["삼겹살"],
    priceWon: 15000,
    abv: 9,
  },
  {
    id: 1002,
    authorId: 2001,
    authorName: "민지",
    title: "막걸리 + 해물파전",
    body: "바삭한 전이랑 산미 있는 막걸리 조합이 너무 좋아요. 추천 막걸리 있으면 알려주세요.",
    createdAt: "2026-04-30T21:40:00+09:00",
    likeCount: 188,
    commentCount: 19,
    popularityScore: 260,
    profile: "20대 / 부산 / 전통주 입문",
    locationLabel: "비 오는 베란다",
    searchTags: ["전통주", "막걸리", "해물파전", "부드러운", "가벼운"],
    drinkType: "전통주",
    categories: ["막걸리"],
    features: ["부드러운", "가벼운"],
    foods: ["해물파전"],
    priceWon: 12000,
    abv: 6,
  },
  {
    id: 1003,
    authorId: 2003,
    authorName: "서연",
    title: "첫 위스키 입문 후기 공유해요",
    body: "처음은 버번 하이볼로 시작했는데 생각보다 부담 없고 달달해서 좋았어요. 다음은 스카치도 도전해보려구요.",
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 96,
    commentCount: 34,
    popularityScore: 330,
    profile: "30대 / 경기 / 위스키 관심",
    locationLabel: "자주가는 바",
    isQna: true,
    searchTags: ["위스키", "하이볼", "버번", "부드러운", "무거운", "오크향"],
    drinkType: "위스키",
    categories: ["하이볼"],
    features: ["부드러운", "무거운", "오크향"],
    foods: ["치즈"],
    priceWon: 79000,
    abv: 40,
  },
  {
    id: 1004,
    authorId: 2004,
    authorName: "지훈",
    title: "사케에 잘 맞는 집안주 몇 개 추천",
    body: "사시미 없을 때는 가라아게/오뎅/명란구이 조합이 제일 무난했어요. 차갑게 마시면 기름기도 잘 잡히더라구요.",
    createdAt: "2026-04-29T18:05:00+09:00",
    likeCount: 84,
    commentCount: 21,
    popularityScore: 210,
    profile: "20대 / 인천 / 사케 입문",
    locationLabel: "늦은 밤 식탁",
    isQna: true,
    searchTags: ["사케", "사케준마이", "가라아게", "부드러운", "가벼운", "오뎅", "명란구이"],
    drinkType: "사케",
    categories: ["사케준마이"],
    features: ["부드러운", "가벼운"],
    foods: ["가라아게", "오뎅", "명란구이"],
    priceWon: 33000,
    abv: 15,
  },
  {
    id: 1005,
    authorId: 2001,
    authorName: "민지",
    title: "레드 와인 + 스테이크",
    body: "레어로 구웠을 때 탄닌이 기름을 잡아주는 느낌이 확실히 있어요. 소스는 과하지 않게!",
    createdAt: "2026-04-28T22:15:00+09:00",
    likeCount: 540,
    commentCount: 63,
    popularityScore: 720,
    profile: "30대 / 서울 / 와인 선호",
    locationLabel: "아늑한 우리집",
    searchTags: ["와인", "레드", "스테이크", "오크숙성", "무거운", "오크향"],
    drinkType: "와인",
    categories: ["레드"],
    features: ["무거운", "오크향"],
    foods: ["스테이크"],
    priceWon: 29000,
    abv: 13,
  },
  {
    id: 1006,
    authorId: 2002,
    authorName: "현우",
    title: "IPA + 햄버거",
    body: "홉의 씁쓸함이 느끼함을 잡아주고 향이 치즈랑 잘 맞아요. 추천 IPA도 남겨요.",
    createdAt: "2026-04-27T20:33:00+09:00",
    likeCount: 410,
    commentCount: 40,
    popularityScore: 590,
    profile: "20대 / 대전 / 맥주 러버",
    locationLabel: "햇살 드는 거실",
    searchTags: ["맥주", "IPA", "크래프트", "뉴잉글랜드", "부드러운", "과일향", "햄버거", "치즈"],
    drinkType: "맥주",
    categories: ["IPA", "크래프트"],
    features: ["부드러운", "과일향"],
    foods: ["햄버거", "치즈"],
    priceWon: 9000,
    abv: 6.5,
  },
  {
    id: 1007,
    authorId: 2101,
    authorName: "유나",
    title: "소주 + 족발",
    body: "족발은 기름질 것 같지만 새우젓/마늘이랑 같이 먹으면 소주가 느끼함을 잘 잡아줘요.",
    createdAt: "2026-05-01T08:02:00+09:00",
    likeCount: 66,
    commentCount: 11,
    popularityScore: 120,
    profile: "20대 / 서울 / 소주 · 전통주",
    locationLabel: "우리집 야식상",
    searchTags: ["소주", "증류주", "족발", "부드러운", "무거운"],
    drinkType: "소주",
    categories: ["증류주"],
    features: ["부드러운", "무거운"],
    foods: ["족발"],
    priceWon: 10000,
    abv: 17,
  },
  {
    id: 1008,
    authorId: 2104,
    authorName: "수빈",
    title: "회 먹을 때는 전 사케파예요",
    body: "간장/와사비가 강한 날엔 사케가 감칠맛이랑 잘 맞고, 산뜻하게 먹고 싶으면 화이트 와인도 좋아요. 저는 보통 사케로 갑니다.",
    createdAt: "2026-04-30T23:55:00+09:00",
    likeCount: 51,
    commentCount: 17,
    popularityScore: 160,
    profile: "30대 / 제주 / 와인 · 사케",
    locationLabel: "작은 주방 테이블",
    isQna: true,
    searchTags: ["사케", "사케준마이", "회", "부드러운", "가벼운"],
    drinkType: "사케",
    categories: ["사케준마이"],
    features: ["과일향", "가벼운"],
    foods: ["회"],
    priceWon: 28000,
    abv: 15,
  },
  {
    id: 1009,
    authorId: 2102,
    authorName: "도윤",
    title: "칵테일 + 타코",
    body: "라임/시트러스 계열이 타코의 향신료랑 잘 붙는 느낌. 데킬라 베이스 추천!",
    createdAt: "2026-04-30T12:20:00+09:00",
    likeCount: 140,
    commentCount: 22,
    popularityScore: 310,
    profile: "30대 / 대구 / 위스키 · 칵테일",
    locationLabel: "친구들과 홈파티",
    searchTags: ["기타", "칵테일", "시트러스", "톡쏘는", "과일향", "타코"],
    drinkType: "기타",
    categories: ["칵테일"],
    features: ["톡쏘는", "과일향"],
    foods: ["타코"],
    priceWon: 18000,
    abv: 12,
  },
  {
    id: 1010,
    authorId: 2103,
    authorName: "지민",
    title: "라거 + 감자튀김",
    body: "짭짤함이랑 탄산/청량감 조합은 실패가 없네요. 소금 대신 시즈닝 바꿔도 좋고요.",
    createdAt: "2026-04-29T20:10:00+09:00",
    likeCount: 92,
    commentCount: 9,
    popularityScore: 180,
    profile: "20대 / 광주 / 맥주 · 페어링",
    locationLabel: "퇴근 후 소파 앞",
    searchTags: ["맥주", "라거/필스너", "드라이", "가벼운", "감자튀김"],
    drinkType: "맥주",
    categories: ["라거/필스너"],
    features: ["가벼운"],
    foods: ["감자튀김"],
    priceWon: 8000,
    abv: 5,
  },
  {
    id: 1011,
    authorId: 2019,
    authorName: "연훈",
    title: "버번 + 다크초콜릿",
    body: "달달한 버번이랑 쌉싸름한 다크초콜릿 같이 먹으니까 밸런스가 딱이었어요. 늦은 밤에 한 잔 하기 좋네요.",
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 97,
    commentCount: 34,
    popularityScore: 330,
    profile: "30대 / 경기 / 위스키 관심",
    locationLabel: "잔잔한 밤 방구석",
    isQna: true,
    searchTags: ["위스키", "증류주", "싱글몰트", "무거운", "오크향", "부드러운", "다크초콜릿"],
    drinkType: "위스키",
    categories: ["증류주"],
    features: ["무거운", "오크향", "부드러운"],
    foods: ["다크초콜릿"],
    priceWon: 99000,
    abv: 45,
  },
  {
    id: 1012,
    authorId: 2025,
    authorName: "수연",
    title: "주말 홈파티 페어링 기록",
    body: "라거 + 치킨은 역시 실패가 없고, 막걸리 + 해물파전도 반응이 좋았어요. 다음엔 와인 쪽도 준비해보려구요.",
    createdAt: "2026-05-01T01:10:00+09:00",
    likeCount: 98,
    commentCount: 34,
    popularityScore: 330,
    profile: "30대 / 경기 / 위스키 관심",
    locationLabel: "주말 홈파티",
    isQna: true,
    searchTags: ["맥주", "라거/필스너", "치킨", "가벼운", "톡쏘는", "전통주", "막걸리", "해물파전"],
    drinkType: "맥주",
    categories: ["라거/필스너"],
    features: ["가벼운", "톡쏘는"],
    foods: ["치킨", "해물파전"],
    priceWon: 16000,
    abv: 5,
  },
*/

export default function Community() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    COMMUNITY_FOLLOWED_USERS_KEY,
    COMMUNITY_LIKED_POSTS_KEY,
    COMMUNITY_SEARCH_RECENT_KEY,
    MAX_RECENT_TERMS,
    PRICE_MIN_WON,
    PRICE_MAX_WON,
    ABV_MIN,
    ABV_MAX,
    pairingReviewGrades,
    userGradesByAuthorId,
    feedFilterItems,
    bookmarkLists,
    popupCategoryByDrinkType,
    popupFeaturesByDrinkType,
    popupFoodCategories,
    followedUsersMock,
    hallOfFameTitle,
    hallOfFameRankedSeeds,
  } = useCommunityPageData()

  const [feedFilter, setFeedFilter] = useState<FeedFilter>("review")
  const { value: followedUserIds, toggle: toggleFollowUser } = useStoredNumberSet(
    COMMUNITY_FOLLOWED_USERS_KEY,
    followedUsersMock.map((user) => user.id),
  )
  const { value: likedById, toggle: toggleLike } = useStoredBooleanRecordFromIds(COMMUNITY_LIKED_POSTS_KEY)
  const [bookmarkListById, setBookmarkListById] = useState<Record<number, string | null>>({})
  const [bookmarkPicker, setBookmarkPicker] = useState<{ postId: number; selectedListId: string } | null>(
    null,
  )
  const [isFeedFilterPopupOpen, setIsFeedFilterPopupOpen] = useState(false)
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set())
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(() => new Set())
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(() => new Set())
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN_WON, PRICE_MAX_WON])
  const [abvRange, setAbvRange] = useState<[number, number]>([ABV_MIN, ABV_MAX])
  const [feedSearchValue, setFeedSearchValue] = useState("")
  const [isFeedSearchConfirmed, setIsFeedSearchConfirmed] = useState(false)
  const feedSearchInputRef = useRef<HTMLInputElement | null>(null)
  const [expandedChipGroups, setExpandedChipGroups] = useState<Set<string>>(() => new Set())
  const [collapsibleChipGroups, setCollapsibleChipGroups] = useState<Set<string>>(() => new Set())
  const chipGroupRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const { value: recentSearchTerms, setValue: setRecentSearchTerms } = useStoredStringArray(
    COMMUNITY_SEARCH_RECENT_KEY,
    MAX_RECENT_TERMS,
  )

  const _legacyPopupChipGroups: PopupChipGroup[] = [
    { title: "상황", chips: ["혼술", "데이트", "파티/모임", "홈파티", "기타"] },
    { title: "음식", chips: ["고기류", "튀김", "매운음식", "해산물", "가벼운 안주"] },
    { title: "스타일", chips: ["가볍게", "진하게", "분위기용", "가성비"] },
    { title: "주종", chips: ["소주", "맥주", "와인", "위스키", "전통주", "기타"] },
    { title: "카테고리", chips: ["럼", "진", "꼬냑", "위스키", "보드카", "데킬라", "브랜디"] },
    { title: "상세 카테고리", chips: ["싱글몰트", "그레인", "블렌디드", "블렌디드몰트"] },
    { title: "특징", chips: ["부드러운", "무거운", "가벼운", "톡쏘는", "오크향", "과일향"] },
  ]

  const availableCategories = useMemo(() => {
    if (!selectedDrinkType) return []
    return popupCategoryByDrinkType[selectedDrinkType] ?? []
  }, [selectedDrinkType])

  const availableFeatures = useMemo(() => {
    if (!selectedDrinkType) return []
    if (selectedCategories.size === 0) return []
    return popupFeaturesByDrinkType[selectedDrinkType] ?? []
  }, [selectedCategories, selectedDrinkType])

  const availableFoods = useMemo(() => {
    if (!selectedDrinkType) return []
    return popupFoodCategories
  }, [selectedDrinkType])

  useEffect(() => {
    const valid = new Set(availableFeatures)
    setSelectedFeatures((prev) => new Set(Array.from(prev).filter((item) => valid.has(item))))
  }, [availableFeatures])

  const popupChipGroups: PopupChipGroup[] = useMemo(() => {
    const groups: PopupChipGroup[] = [
      { title: "주종", chips: Object.keys(popupCategoryByDrinkType) },
      { title: "카테고리", chips: availableCategories },
      { title: "특징", chips: availableFeatures },
      {
        title: "음식",
        chips: availableFoods,
      },
    ]

    // Keep group titles visible even when chips are empty (step-by-step funnel UX).
    return groups
  }, [availableCategories, availableFeatures, availableFoods])

  const searchAllChipGroups: PopupChipGroup[] = useMemo(() => {
    const categorySet = new Set<string>()
    for (const list of Object.values(popupCategoryByDrinkType)) {
      for (const item of list) categorySet.add(item)
    }
    const featureSet = new Set<string>()
    for (const list of Object.values(popupFeaturesByDrinkType)) {
      for (const item of list) featureSet.add(item)
    }

    return [
      { title: "주종", chips: Object.keys(popupCategoryByDrinkType) },
      { title: "카테고리", chips: Array.from(categorySet) },
      { title: "특징", chips: Array.from(featureSet) },
      { title: "음식", chips: popupFoodCategories },
    ]
  }, [])

  void _legacyPopupChipGroups

  const filteredPopupChipGroups = useMemo(() => {
      const query = feedSearchValue.trim().toLowerCase()
    if (!isFeedSearchConfirmed || !query) {
      return popupChipGroups
    }

    const results: PopupChipGroup[] = []
    for (const group of searchAllChipGroups) {
      if (group.title.toLowerCase().includes(query)) {
        results.push(group)
        continue
      }

      const chips = group.chips.filter((chip) => includesNormalized(chip, query))
      if (chips.length > 0) {
        results.push({ title: group.title, chips })
      }
    }

    return results
  }, [feedSearchValue, isFeedSearchConfirmed, popupChipGroups, searchAllChipGroups])

  const isPopupSearchNoResults =
    isFeedSearchConfirmed && feedSearchValue.trim() && filteredPopupChipGroups.length === 0

  const isCommunitySearchActive =
    Boolean(feedSearchValue.trim()) ||
    isFeedSearchConfirmed ||
    Boolean(selectedDrinkType) ||
    selectedCategories.size > 0 ||
    selectedFeatures.size > 0 ||
    selectedFoods.size > 0 ||
    priceRange[0] !== PRICE_MIN_WON ||
    priceRange[1] !== PRICE_MAX_WON ||
    abvRange[0] !== ABV_MIN ||
    abvRange[1] !== ABV_MAX

  const posts = useMemo(() => {
    const copy = [...feedPosts]

    if (feedFilter === "review") {
      return copy
        .filter((post) => !post.isQna)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    if (feedFilter === "free") {
      return copy
        .filter((post) => post.isQna)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    if (feedFilter === "follow") {
      return copy
        .filter((post) => followedUserIds.has(post.authorId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return []
  }, [feedFilter, followedUserIds])

  const filteredPosts = useMemo(() => {
    if (!isCommunitySearchActive) {
      return posts
    }

    const query = feedSearchValue.trim()
    return posts.filter((post) => {
      const targets = [
        post.title,
        post.body,
        post.profile ?? "",
        post.drinkType ?? "",
        ...(post.categories ?? []),
        ...(post.features ?? []),
        ...(post.foods ?? []),
        ...(post.searchTags ?? []),
      ]
      const queryMatches = !query || includesNormalized(targets.join(" "), query)

      const drinkTypeMatches = !selectedDrinkType || post.drinkType === selectedDrinkType
      const categoryMatches =
        selectedCategories.size === 0 || (post.categories ?? []).some((item) => selectedCategories.has(item))
      const foodMatches = selectedFoods.size === 0 || (post.foods ?? []).some((item) => selectedFoods.has(item))
      const featureMatches =
        selectedFeatures.size === 0 || (post.features ?? []).some((item) => selectedFeatures.has(item))
      const priceValue = typeof post.priceWon === "number" && Number.isFinite(post.priceWon) ? post.priceWon : 0
      const priceMatches = priceValue >= priceRange[0] && (priceRange[1] >= PRICE_MAX_WON ? true : priceValue <= priceRange[1])
      const abvValue = typeof post.abv === "number" && Number.isFinite(post.abv) ? post.abv : 0
      const abvMatches =
        abvValue >= abvRange[0] && (abvRange[1] >= ABV_MAX ? true : abvValue <= abvRange[1])

      return (
        queryMatches && drinkTypeMatches && categoryMatches && foodMatches && featureMatches && priceMatches && abvMatches
      )
    })
  }, [
    feedSearchValue,
    isCommunitySearchActive,
    posts,
    selectedCategories,
    selectedDrinkType,
    selectedFeatures,
    selectedFoods,
    priceRange,
    abvRange,
  ])

  const searchSuggestionTags = useMemo(() => {
    const query = feedSearchValue.trim()
    if (!query) {
      return []
    }

    const normalizedQuery = normalizeSearchText(query)
    const filterPostWithoutQuery = (post: FeedPost) => {
      const drinkTypeMatches = !selectedDrinkType || post.drinkType === selectedDrinkType
      const categoryMatches =
        selectedCategories.size === 0 || (post.categories ?? []).some((item) => selectedCategories.has(item))
      const foodMatches = selectedFoods.size === 0 || (post.foods ?? []).some((item) => selectedFoods.has(item))
      const featureMatches =
        selectedFeatures.size === 0 || (post.features ?? []).some((item) => selectedFeatures.has(item))
      return drinkTypeMatches && categoryMatches && foodMatches && featureMatches
    }

    const candidates = new Map<string, number>()
    const bump = (tag: string, score: number) => {
      const trimmed = tag.trim()
      if (!trimmed) return
      candidates.set(trimmed, Math.max(candidates.get(trimmed) ?? 0, score))
    }

    for (const post of feedPosts) {
      const tagPool = [
        post.drinkType ?? "",
        ...(post.categories ?? []),
        ...(post.features ?? []),
        ...(post.foods ?? []),
        ...(post.searchTags ?? []),
      ].filter(Boolean)

      const haystack = normalizeSearchText([post.title, post.body, ...tagPool].join(" "))
      const baseScore = haystack.includes(normalizedQuery) ? 3 : 0

      for (const tag of tagPool) {
        const normalizedTag = normalizeSearchText(tag)
        let score = baseScore
        if (normalizedTag.includes(normalizedQuery) || normalizedQuery.includes(normalizedTag)) {
          score += 5
        } else if (normalizedTag && normalizedQuery && (normalizedTag[0] === normalizedQuery[0])) {
          score += 1
        }
        bump(tag, score)
      }
    }

  const hasResultsForTag = (tag: string) => {
      for (const post of feedPosts) {
        if (!filterPostWithoutQuery(post)) continue
        const tagPool = [
          post.title,
          post.body,
          post.drinkType ?? "",
          ...(post.categories ?? []),
          ...(post.features ?? []),
          ...(post.foods ?? []),
          ...(post.searchTags ?? []),
        ].filter(Boolean)

        if (includesNormalized(tagPool.join(" "), tag)) {
          return true
        }
      }
      return false
    }

    return Array.from(candidates.entries())
      .filter(([tag]) => hasResultsForTag(tag))
      .filter(([tag]) => {
        if (selectedDrinkType && tag === selectedDrinkType) return false
        if (selectedCategories.has(tag)) return false
        if (selectedFeatures.has(tag)) return false
        if (selectedFoods.has(tag)) return false
        return true
      })
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 8)
  }, [
    feedSearchValue,
    selectedCategories,
    selectedDrinkType,
    selectedFeatures,
    selectedFoods,
  ])
  const isFeedNoResults = isCommunitySearchActive && filteredPosts.length === 0

  useEffect(() => {
    if (!isFeedFilterPopupOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFeedFilterPopupOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFeedFilterPopupOpen])

  useEffect(() => {
    if (!isFeedFilterPopupOpen) {
      return
    }

    setIsFeedSearchConfirmed(false)
    window.setTimeout(() => feedSearchInputRef.current?.focus(), 0)
  }, [isFeedFilterPopupOpen])

  useEffect(() => {
    const next = new Set<string>()

    for (const group of filteredPopupChipGroups) {
      const el = chipGroupRefs.current.get(group.title)
      if (!el) {
        continue
      }
      if (el.scrollHeight > el.clientHeight + 1) {
        next.add(group.title)
      }
    }

    setCollapsibleChipGroups(next)
  }, [filteredPopupChipGroups, expandedChipGroups])

  const getLikeCount = (post: FeedPost) => post.likeCount + (likedById[post.id] ? 1 : 0)
  const getCommentCount = (post: FeedPost) => post.commentCount

  const openBookmarkPicker = (postId: number) => {
    const currentListId = bookmarkListById[postId]
    setBookmarkPicker({ postId, selectedListId: currentListId ?? bookmarkLists[0].id })
  }

  const confirmBookmark = () => {
    if (!bookmarkPicker) {
      return
    }

    setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: bookmarkPicker.selectedListId }))
    setBookmarkPicker(null)
  }

  const removeBookmark = () => {
    if (!bookmarkPicker) {
      return
    }

    setBookmarkListById((prev) => ({ ...prev, [bookmarkPicker.postId]: null }))
    setBookmarkPicker(null)
  }

  const cancelBookmark = () => setBookmarkPicker(null)

  const goToComments = (postId: number) => {
    const post = feedPosts.find((item) => item.id === postId)
    const pairingTitle = post?.title ? extractPairingTitle(post.title) : ""
    const locationLabel = post?.locationLabel?.trim() ?? ""
    navigate(`/community/pairing/${postId}#comments`, {
      state: post
        ? {
            pairingTitle,
            authorId: post.authorId,
            authorName: post.authorName,
            profile: post.profile ?? "",
            locationLabel,
            drinkType: post.drinkType ?? "",
            source: "feed",
          }
        : undefined,
    })
  }

  const toggleDrinkType = (nextDrinkType: string) => {
    setSelectedDrinkType((prev) => (prev === nextDrinkType ? null : nextDrinkType))
    setSelectedCategories(new Set())
    setSelectedFeatures(new Set())
    setIsFeedSearchConfirmed(true)
  }

  const priceMinPct = useMemo(() => {
    const denom = PRICE_MAX_WON - PRICE_MIN_WON
    if (denom <= 0) return 0
    return Math.round(((priceRange[0] - PRICE_MIN_WON) / denom) * 1000) / 10
  }, [priceRange])

  const priceMaxPct = useMemo(() => {
    const denom = PRICE_MAX_WON - PRICE_MIN_WON
    if (denom <= 0) return 100
    return Math.round(((priceRange[1] - PRICE_MIN_WON) / denom) * 1000) / 10
  }, [priceRange])

  const abvMinPct = useMemo(() => {
    const denom = ABV_MAX - ABV_MIN
    if (denom <= 0) return 0
    return Math.round(((abvRange[0] - ABV_MIN) / denom) * 1000) / 10
  }, [abvRange])

  const abvMaxPct = useMemo(() => {
    const denom = ABV_MAX - ABV_MIN
    if (denom <= 0) return 100
    return Math.round(((abvRange[1] - ABV_MIN) / denom) * 1000) / 10
  }, [abvRange])

  const resetFilters = () => {
    setSelectedDrinkType(null)
    setSelectedCategories(new Set())
    setSelectedFeatures(new Set())
    setSelectedFoods(new Set())
    setPriceRange([PRICE_MIN_WON, PRICE_MAX_WON])
    setAbvRange([ABV_MIN, ABV_MAX])
    setIsFeedSearchConfirmed(Boolean(feedSearchValue.trim()))
  }

  const toggleCategory = (chip: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) {
        next.delete(chip)
      } else {
        next.add(chip)
      }
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const toggleFeature = (chip: string) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) {
        next.delete(chip)
      } else {
        next.add(chip)
      }
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const toggleFood = (chip: string) => {
    setSelectedFoods((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) {
        next.delete(chip)
      } else {
        next.add(chip)
      }
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const setChipGroupRef = useCallback((title: string) => {
    return (element: HTMLDivElement | null) => {
      chipGroupRefs.current.set(title, element)
    }
  }, [])

  const toggleChipGroupExpanded = (title: string) => {
    setExpandedChipGroups((prev) => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  const openFeedFilterPopup = () => setIsFeedFilterPopupOpen(true)

  const confirmFeedSearch = (term?: string) => {
    const query = (term ?? feedSearchValue).trim()
    if (!query) {
      return
    }

    setFeedSearchValue(query)
    setIsFeedSearchConfirmed(true)
    setRecentSearchTerms((prev) => {
      const normalized = query.toLowerCase()
      const next = [query, ...prev.filter((item) => item.toLowerCase() !== normalized)]
      return next.slice(0, MAX_RECENT_TERMS)
    })
    feedSearchInputRef.current?.blur()
  }

  const changeFeedFilter = (nextFilter: FeedFilter) => {
    setFeedFilter(nextFilter)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    const state = (location.state ?? {}) as { initialFilter?: FeedFilter; scrollToTop?: boolean }
    if (state.initialFilter) {
      setFeedFilter(state.initialFilter)
    }
    if (state.scrollToTop || state.initialFilter) {
      window.scrollTo(0, 0)
    }
  }, [location.state])

  const hallOfFamePosts = useMemo(() => {
    const rankedById = new Map(hallOfFameRankedSeeds.map((seed) => [seed.postId, seed]))
    const candidates = feedPosts
      .filter((post) => !post.isQna)
      .filter((post) => rankedById.has(post.id))
      .map((post) => ({ post, seed: rankedById.get(post.id)! }))

    const shuffled = [...candidates]
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      const temp = shuffled[index]
      shuffled[index] = shuffled[swapIndex]
      shuffled[swapIndex] = temp
    }

    return shuffled.slice(0, 3).map((item) => item)
  }, [])

  const feedSectionTitle = feedFilter === "review" ? "페어링 후기" : feedFilter === "free" ? "질문" : "팔로우"

  return (
    <section className="community_page page_screen" aria-label="커뮤니티">
      <CommunityHeader
        title="커뮤니티"
        topTab="feed"
        openFilterAriaLabel="검색 필터 열기"
        onOpenFilter={openFeedFilterPopup}
        onOpenNotifications={() => {}}
      />

      {isFeedFilterPopupOpen ? (
        <div
          className="feed_filter_overlay"
          role="presentation"
          onClick={() => setIsFeedFilterPopupOpen(false)}
        >
          <div
            className="feed_filter_popup"
            role="dialog"
            aria-modal="true"
            aria-label="커뮤니티 검색"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="feed_filter_popup_top">
              
              <CommunitySearchInput
                shellAriaLabel="커뮤니티 검색"
                inputAriaLabel="커뮤니티 검색어 입력"
                clearAriaLabel="검색어 지우기"
                placeholder="조합, 주류, 안주 검색"
                value={feedSearchValue}
                inputRef={feedSearchInputRef}
                onChange={(nextValue) => {
                  setFeedSearchValue(nextValue)
                  setIsFeedSearchConfirmed(Boolean(nextValue.trim()))
                }}
                onEnter={confirmFeedSearch}
                onClear={() => {
                  setFeedSearchValue("")
                  setIsFeedSearchConfirmed(false)
                }}
              />
              <button
                type="button"
                className="feed_filter_close_button"
                aria-label="취소"
                onClick={() => setIsFeedFilterPopupOpen(false)}
              >
                취소
              </button>
            </div>

            {isPopupSearchNoResults ? (
              <p className="feed_filter_no_results" role="status">
                검색 결과가 없어요
              </p>
            ) : null}

            <CommunityFeedFilterPopupBody
              groups={filteredPopupChipGroups}
              collapsibleGroupTitles={collapsibleChipGroups}
              expandedGroupTitles={expandedChipGroups}
              setGroupRef={setChipGroupRef}
              onToggleGroupExpanded={toggleChipGroupExpanded}
              selectedDrinkType={selectedDrinkType}
              selectedCategories={selectedCategories}
              selectedFeatures={selectedFeatures}
              selectedFoods={selectedFoods}
              onChipClick={(groupTitle, chip) => {
                if (groupTitle === "주종") {
                  toggleDrinkType(chip)
                  return
                }
                if (groupTitle === "카테고리") {
                  toggleCategory(chip)
                  return
                }
                if (groupTitle === "특징") {
                  toggleFeature(chip)
                  return
                }
                if (groupTitle === "음식") {
                  toggleFood(chip)
                }
              }}
              recentSearchTerms={recentSearchTerms}
              onSelectRecentSearch={(term) => confirmFeedSearch(term)}
              onDeleteRecentSearch={(term) => {
                setRecentSearchTerms((prev) => prev.filter((item) => item !== term))
              }}
            />

            <div className="feed_filter_range_group" aria-label="가격 필터">
              <h3 className="feed_filter_group_title">가격</h3>
              <p className="feed_filter_range_label">
                {priceRange[0].toLocaleString()}원 ~ {priceRange[1] >= PRICE_MAX_WON ? `${PRICE_MAX_WON.toLocaleString()}원 이상` : `${priceRange[1].toLocaleString()}원`}
              </p>
              <div
                className="dual_range"
                style={
                  {
                    ["--min-pct" as string]: `${priceMinPct}%`,
                    ["--max-pct" as string]: `${priceMaxPct}%`,
                  } as CSSProperties
                }
              >
                <input
                  className="dual_range_input"
                  type="range"
                  min={PRICE_MIN_WON}
                  max={PRICE_MAX_WON}
                  step={1000}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const nextMin = Math.min(Number(e.target.value), priceRange[1])
                    setPriceRange([nextMin, priceRange[1]])
                  }}
                  aria-label="최소 가격"
                />
                <input
                  className="dual_range_input"
                  type="range"
                  min={PRICE_MIN_WON}
                  max={PRICE_MAX_WON}
                  step={1000}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const nextMax = Math.max(Number(e.target.value), priceRange[0])
                    setPriceRange([priceRange[0], nextMax])
                  }}
                  aria-label="최대 가격"
                />
              </div>
              <div className="feed_filter_quick_row">
                <button type="button" onClick={() => setPriceRange([500000, PRICE_MAX_WON])}>50만원 이상</button>
                <button type="button" onClick={() => setPriceRange([1000000, PRICE_MAX_WON])}>100만원 이상</button>
              </div>
            </div>

            <div className="feed_filter_range_group" aria-label="도수 필터">
              <h3 className="feed_filter_group_title">도수</h3>
              <p className="feed_filter_range_label">
                {abvRange[0]}% ~ {abvRange[1] >= ABV_MAX ? `${ABV_MAX}% 이상` : `${abvRange[1]}%`}
              </p>
              <div
                className="dual_range"
                style={
                  {
                    ["--min-pct" as string]: `${abvMinPct}%`,
                    ["--max-pct" as string]: `${abvMaxPct}%`,
                  } as CSSProperties
                }
              >
                <input
                  className="dual_range_input"
                  type="range"
                  min={ABV_MIN}
                  max={ABV_MAX}
                  step={1}
                  value={abvRange[0]}
                  onChange={(e) => {
                    const nextMin = Math.min(Number(e.target.value), abvRange[1])
                    setAbvRange([nextMin, abvRange[1]])
                  }}
                  aria-label="최소 도수"
                />
                <input
                  className="dual_range_input"
                  type="range"
                  min={ABV_MIN}
                  max={ABV_MAX}
                  step={1}
                  value={abvRange[1]}
                  onChange={(e) => {
                    const nextMax = Math.max(Number(e.target.value), abvRange[0])
                    setAbvRange([abvRange[0], nextMax])
                  }}
                  aria-label="최대 도수"
                />
              </div>
            </div>

            <div className="feed_filter_footer">
              <button type="button" className="feed_filter_reset" onClick={resetFilters}>
                선택 초기화
              </button>
              <button
                type="button"
                className="feed_filter_apply"
                onClick={() => {
                  setIsFeedFilterPopupOpen(false)
                  setIsFeedSearchConfirmed(true)
                }}
              >
                선택 완료
                <br />
                검색하기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <FeedSegmentTabs
        ariaLabel="커뮤니티 탭"
        items={feedFilterItems}
        activeKey={feedFilter}
        onChange={(key) => changeFeedFilter(key as FeedFilter)}
      />

      {feedFilter === "free" || feedFilter === "review" ? (
        <FeedWriteRow
          ariaLabel="글 작성"
          mode={feedFilter}
          onClick={() => {
            const modeParam = feedFilter === "free" ? "free" : "review"
            navigate(`/community/write?mode=${modeParam}`)
          }}
        />
      ) : null}

      {feedFilter === "review" ? (
        <>
          <h4 className="community_section_title">{hallOfFameTitle}</h4>
          <div className="feed_cards" aria-label="명예의 전당 목록">
            {hallOfFamePosts.map(({ post, seed }) => {
              const chips = [
                { key: `rank-${post.id}`, label: `랭킹 ${seed.rank}위`, variant: "rank" as const },
                { key: `liquor-${post.id}`, label: seed.liquor },
                { key: `situation-${post.id}`, label: seed.situation },
              ]

              return (
                <HallOfFamePostCard
                  key={post.id}
                  postId={post.id}
                  linkTo={`/community/pairing/${post.id}`}
               linkState={{
                 pairingTitle: extractPairingTitle(post.title),
                 body: post.body,
                 authorId: post.authorId,
                 authorName: post.authorName,
                 profile: post.profile ?? "",
                 locationLabel: post.locationLabel?.trim() ?? "",
                 drinkType: post.drinkType ?? "",
                 source: "free",
               }}
                  chips={chips}
                  title={extractPairingTitle(post.title)}
                  body={post.body}
                  likeActive={Boolean(likedById[post.id])}
                  likeAriaLabel={likedById[post.id] ? "좋아요 취소" : "좋아요"}
                  likeText={`${getLikeCount(post)}`}
                  onToggleLike={() => toggleLike(post.id)}
                  commentText={`${getCommentCount(post)}`}
                  onViewComments={() => goToComments(post.id)}
                  bookmarkActive={Boolean(bookmarkListById[post.id])}
                  bookmarkAriaLabel={bookmarkListById[post.id] ? "북마크 변경" : "북마크"}
                  onOpenBookmarkPicker={() => openBookmarkPicker(post.id)}
                />
              )
            })}
          </div>
        </>
      ) : null}

      <h4 className="community_section_title">{feedSectionTitle}</h4>
      <div className={feedFilter === "free" ? "question_list" : "feed_cards"} aria-label="커뮤니티 글 목록">
        {isFeedNoResults ? (
          <div className="search_no_results" role="status">
            <p className="search_no_results_title">검색 결과가 없어요</p>
            {searchSuggestionTags.length > 0 ? (
              <div className="search_suggestion_row" aria-label="추천 태그">
                {searchSuggestionTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="search_suggestion_chip"
                    onClick={() => {
                      setFeedSearchValue(tag)
                      setIsFeedSearchConfirmed(true)
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {feedFilter === "free"
          ? filteredPosts.map((post, index) => (
            <QuestionPostRow
              key={post.id}
              postId={post.id}
              title={post.title}
              body={post.body}
              createdAt={post.createdAt}
              likeCount={getLikeCount(post)}
              commentCount={getCommentCount(post)}
              likeActive={Boolean(likedById[post.id])}
              likeAriaLabel={likedById[post.id] ? "좋아요 취소" : "좋아요"}
              onToggleLike={() => toggleLike(post.id)}
              onViewComments={() => goToComments(post.id)}
              linkTo={`/community/pairing/${post.id}`}
              linkState={{
                pairingTitle: extractPairingTitle(post.title),
                authorId: post.authorId,
                authorName: post.authorName,
                profile: post.profile ?? "",
                locationLabel: post.locationLabel?.trim() ?? "",
                drinkType: post.drinkType ?? "",
                source: "feed",
              }}
              thumbVariant={index % 3 === 1 ? "bottle" : index % 3 === 2 ? "photo" : "none"}
            />
          ))
          : filteredPosts.map((post) => (
            <RelatedContentPostCard
              key={post.id}
              postId={post.id}
              isQna={post.isQna}
              authorName={post.authorName}
              profile={post.profile}
              badgeClassName={
                userGradesByAuthorId[post.authorId]?.pairingReviewTier === 5
                  ? "feed_post_badge is_tier5"
                  : userGradesByAuthorId[post.authorId]?.pairingReviewTier === 4
                    ? "feed_post_badge is_tier4"
                    : userGradesByAuthorId[post.authorId]?.pairingReviewTier === 3
                      ? "feed_post_badge is_tier3"
                      : userGradesByAuthorId[post.authorId]?.pairingReviewTier === 2
                        ? "feed_post_badge is_tier2"
                        : userGradesByAuthorId[post.authorId]?.pairingReviewTier === 1
                          ? "feed_post_badge is_tier1"
                          : "feed_post_badge"
              }
              badgeText={pairingReviewGrades[(userGradesByAuthorId[post.authorId]?.pairingReviewTier ?? 1) - 1]}
              followButtonClassName={
                followedUserIds.has(post.authorId) ? "follow_toggle_button is_following" : "follow_toggle_button"
              }
              followAriaLabel={
                feedFilter === "follow"
                  ? "언팔로우"
                  : followedUserIds.has(post.authorId)
                    ? "언팔로잉"
                    : "팔로우"
              }
              followText={
                feedFilter === "follow" ? "언팔로우" : followedUserIds.has(post.authorId) ? "언팔로잉" : "팔로우"
              }
              onToggleFollow={() => toggleFollowUser(post.authorId)}
              linkTo={`/community/pairing/${post.id}`}
              linkState={{
                pairingTitle: extractPairingTitle(post.title),
                authorId: post.authorId,
                authorName: post.authorName,
                profile: post.profile ?? "",
                locationLabel: post.locationLabel?.trim() ?? "",
                drinkType: post.drinkType ?? "",
                source: "feed",
              }}
              title={post.isQna ? post.title : extractPairingTitle(post.title)}
              body={post.body}
              answerCount={post.answerCount}
              answerPreview={post.answerPreview}
              likeActive={Boolean(likedById[post.id])}
              likeAriaLabel={likedById[post.id] ? "좋아요 취소" : "좋아요"}
              likeText={`${getLikeCount(post)}`}
              onToggleLike={() => toggleLike(post.id)}
              commentText={`${getCommentCount(post)}`}
              onViewComments={() => goToComments(post.id)}
              bookmarkActive={Boolean(bookmarkListById[post.id])}
              bookmarkAriaLabel={bookmarkListById[post.id] ? "북마크 변경" : "북마크"}
              onOpenBookmarkPicker={() => openBookmarkPicker(post.id)}
            />
          ))}
      </div>

      {bookmarkPicker ? (
        <CommunityBookmarkPickerModal
          picker={bookmarkPicker}
          lists={bookmarkLists}
          ariaLabel="북마크 리스트 선택"
          titleText={
            bookmarkListById[bookmarkPicker.postId] ? "북마크를 어디로 옮길까요?" : "어느 리스트에 저장할까요?"
          }
          listPickerAriaLabel="북마크 리스트"
          secondaryLabel={bookmarkListById[bookmarkPicker.postId] ? "해제" : "취소"}
          primaryLabel="확인"
          onDismiss={cancelBookmark}
          onSelectList={(listId) => setBookmarkPicker({ ...bookmarkPicker, selectedListId: listId })}
          onSecondary={bookmarkListById[bookmarkPicker.postId] ? removeBookmark : cancelBookmark}
          onPrimary={confirmBookmark}
        />
      ) : null}
    </section>
  )
}







