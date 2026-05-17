import { useEffect, useMemo, useRef, useState } from "react"
import { useLayoutEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { AnimatePresence, motion } from "motion/react"
import ProfileEditModal from "../components/ProfileEditModal"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import PreferenceGroupSection from "../components/PreferenceGroupSection"
import RelatedContentPostCard from "../components/RelatedContentPostCard"
import TierInfoPopover from "../components/TierInfoPopover"
import {
  MAX_MULTI_SELECTIONS,
  NONE_OPTION,
  preferenceGroups,
  type PreferenceGroup,
} from "../data/setupContent"
import {
  readUserProfile,
  updateUserTastePreferences,
  type UserTastePreferences,
} from "../data/userProfile"
import {
  TASTE_SHEET_CLOSE_MS,
  activityStats,
  tasteBars,
  discountItems,
  exchangeTabs,
  experienceItems,
  myPagePointsSummary,
  myPageProfileSummary,
  pointMissions,
  type ExchangeItem,
} from "../data/myPageContent"
import { bookmarkLists } from "../data/communityFilterConfig"
import { drinkReviews } from "../data/productReviewsMock"
import { extractPairingTitle, feedPosts, getPairingSummaryText, type FeedPost } from "../utils/communityPosts"
import { COMMUNITY_BOOKMARK_LIST_BY_POST_KEY, COMMUNITY_FOLLOWED_USERS_KEY } from "../utils/communityStorage"
import { useStoredNullableStringRecord, useStoredNumberSet } from "../utils/storage"
import { currentUserMock, defaultFollowedUserIdsMock, getFollowingCount, usersMockById } from "../utils/usersMock"
import { isMyWrittenPost } from "../utils/myWrittenPosts"
import { getPairingTierByUserId, getPairingTierLabelByUserId } from "../utils/pairingTier"
import { getTierClassName } from "../utils/tier"
import { resolveMyUserAvatar } from "../utils/userAvatars"
import iconCaretRight from "../assets/svg/caretright.svg"
import iconDotsThreeVertical from "../assets/svg/dotsthreevertical.svg"
import iconCaretDown from "../assets/svg/caretdown.png"
import iconGearSix from "../assets/svg/gearsix.svg"
import iconX from "../assets/svg/x.svg"
import iconWarning from "../assets/svg/worning_r.svg"
import iconCheck from "../assets/svg/check_g.svg"
import myPointCoinImage from "../assets/my_point_coin.png"
import myPointMascotImage from "../assets/my_point_mascot_01.png"
import myMissionRecordSave from "../assets/my_record_save_01.png"
import myMissionVoteJoin from "../assets/my_vote_join_01.png"
import myMissionReviewWrite from "../assets/my_review_write_01.svg"
import myMissionAdWatch from "../assets/my_ad_watch_01.png"
import "../styles/community.css"
import "../styles/my.css"
import { pointHistoryItems } from "../data/myPageContent"
import { ALL_SUBCATEGORY, getCategoryListItems } from "../hooks/useCategoryListPageData"
import { readSavedAlcoholProductIds, removeSavedAlcoholProductId } from "../utils/savedAlcohol"
import iconBookmarkActive from "../assets/svg/bookmarksimple_active.svg"

type ExchangeTab = (typeof exchangeTabs)[number]

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setPrefersReduced(media.matches)
    update()

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update)
      return () => media.removeEventListener("change", update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  return prefersReduced
}

function normalizeTastePreferences(tastePreferences: UserTastePreferences) {
  return preferenceGroups.reduce<UserTastePreferences>((nextPreferences, group) => {
    const selectedOptions = tastePreferences[group.key] ?? []

    if (group.type === "single") {
      nextPreferences[group.key] = selectedOptions.slice(0, 1)
      return nextPreferences
    }

    if (selectedOptions.includes(NONE_OPTION)) {
      nextPreferences[group.key] = [NONE_OPTION]
      return nextPreferences
    }

    nextPreferences[group.key] = selectedOptions.slice(0, group.maxSelections ?? MAX_MULTI_SELECTIONS)
    return nextPreferences
  }, {})
}

const hiddenTagOptions = new Set(["기타", NONE_OPTION])

function toTagLabel(option: string) {
  return `#${option.replace(/\s+/g, "")}`
}

function getTasteTags(tastePreferences: UserTastePreferences) {
  const activeTags = ["drinkType", "situation", "trait", "purchase"]
    .flatMap((key) => tastePreferences[key] ?? [])
    .filter((option) => option && !hiddenTagOptions.has(option))
    .map(toTagLabel)

  const quietTags = (tastePreferences.avoid ?? [])
    .filter((option) => option && !hiddenTagOptions.has(option))
    .map(toTagLabel)

  return {
    activeTags: activeTags.length > 0 ? activeTags : ["#취향미설정"],
    quietTags,
  }
}

function getTasteSummary(tastePreferences: UserTastePreferences) {
  const drinkType = (tastePreferences.drinkType ?? []).find((value) => value && !hiddenTagOptions.has(value)) ?? "주류"
  const traits = (tastePreferences.trait ?? []).filter((value) => value && !hiddenTagOptions.has(value))
  const situations = (tastePreferences.situation ?? []).filter((value) => value && !hiddenTagOptions.has(value))

  const traitLine = traits.length > 0 ? traits.join(" · ") : "취향 미설정"
  const situationLine = situations[0] ?? "상황 미설정"
  const summaryTitle = `${drinkType} · ${traitLine}`
  const summaryDescription = `기준으로 추천을 받고 있어요.`

  return { summaryTitle, summaryDescription, situationLine }
}

function ExchangeItemCard({
  item,
  tone,
  onActionClick,
}: {
  item: ExchangeItem
  tone?: "discount" | "experience"
  onActionClick?: (item: ExchangeItem) => void
}) {
  const tagToneClass = tone === "experience" ? " is_experience" : ""
  const isDisabled = Boolean(item.actionDisabled)
  return (
    <article className="my_exchange_item">
      <div className="my_exchange_item_body">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className={`my_exchange_item_tags${tagToneClass}`}>
          {item.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="my_exchange_item_action">
        <button
          type="button"
          className="my_exchange_item_download"
          disabled={isDisabled}
          aria-disabled={isDisabled}
          aria-label={item.actionDisabled ? "발급 완료" : "교환하기"}
          onClick={() => {
            if (isDisabled) return
            onActionClick?.(item)
          }}
        />
        <span className="my_exchange_item_status">{item.statusLabel ?? `${item.point} 차감`}</span>
      </div>
    </article>
  )
}

function CoinConfetti({ seed }: { seed: number }) {
  const pieceCount = 10
  const pieces = Array.from({ length: pieceCount }).map((_, index) => {
    const t = (seed + 1) * 997 + (index + 1) * 263
    const angle = ((t % 360) * Math.PI) / 180
    const dist = 15 + (t % 18)
    const dx = Math.cos(angle) * dist * 2.25
    const dy = Math.sin(angle) * dist * 0.85 - 18
    const rotate = (t * 13) % 360
    const delay = (0.06 + (t % 120) / 1000).toFixed(3)
    const duration = 0.9 + ((t % 36) / 100)
    const colors = ["#D77636", "#E8BC1D", "#CCD277", "#FB8C5A", "#7CC6D9"]
    const color = colors[t % colors.length]

    return {
      key: index,
      dx,
      dy,
      rotate,
      delay: Number(delay),
      duration,
      color,
    }
  })

  return (
    <span className="my_point_confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <motion.span
          key={piece.key}
          className="my_point_confetti_piece"
          style={{ background: piece.color }}
          initial={{ opacity: 0, x: "-50%", y: "-50%", scale: 0.65, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: ["-50%", `calc(-50% + ${piece.dx.toFixed(1)}px)`],
            y: [
              "-50%",
              `calc(-50% + ${piece.dy.toFixed(1)}px)`,
              `calc(-50% + ${(piece.dy + 18).toFixed(1)}px)`,
            ],
            scale: [0.65, 1, 0.95],
            rotate: [0, piece.rotate, piece.rotate + 40],
          }}
          transition={{
            delay: piece.delay,
            duration: piece.duration,
            times: [0, 0.22, 1],
            ease: ["easeOut", "easeIn"],
          }}
        />
      ))}
    </span>
  )
}

function PointCoinBurst({ seed, imageSrc, onCoinTap }: { seed: number; imageSrc: string; onCoinTap?: () => void }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const burstRef = useRef<HTMLDivElement | null>(null)
  const [coinSizePx, setCoinSizePx] = useState<number | null>(null)

  useLayoutEffect(() => {
    const root = burstRef.current
    if (!root) return

    const coin = root.querySelector(".my_point_coin")
    if (!(coin instanceof HTMLElement)) return

    const rect = coin.getBoundingClientRect()
    if (rect.width > 0) setCoinSizePx(rect.width)
  }, [seed, prefersReducedMotion])

  const confettiPadPx = useMemo(() => {
    const base = coinSizePx ?? 59
    return Math.min(14, Math.max(8, Math.round(base * 0.2)))
  }, [coinSizePx])

  if (prefersReducedMotion) {
    return (
      <div
        ref={burstRef}
        className="my_point_coin_burst"
        aria-hidden="true"
        style={
          {
            "--my-point-coin-size": coinSizePx ? `${coinSizePx}px` : undefined,
            "--my-point-confetti-pad": `${confettiPadPx}px`,
          } as any
        }
      >
        <div className="my_point_coin">
          <button type="button" className="my_point_coin_tap" aria-label="포인트 코인" onClick={onCoinTap}>
            <img src={imageSrc} alt="" aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={burstRef}
      className="my_point_coin_burst"
      aria-hidden="true"
      style={
        {
          "--my-point-coin-size": coinSizePx ? `${coinSizePx}px` : undefined,
          "--my-point-confetti-pad": `${confettiPadPx}px`,
        } as any
      }
    >
      <motion.div
        className="my_point_coin_burst_motion"
        key={`coin-${seed}`}
        initial={{ scale: 0.9, y: 6, rotate: -2 }}
        animate={{ scale: [0.9, 1.03, 1], y: [6, -3, 0], rotate: [-2, 1.2, 0] }}
        transition={{
          duration: 0.72,
          ease: [0.25, 0.95, 0.25, 1],
        }}
      >
        <AnimatePresence mode="wait">
          <CoinConfetti seed={seed} key={`confetti-${seed}`} />
        </AnimatePresence>
        <div className="my_point_coin">
          <button type="button" className="my_point_coin_tap" aria-label="포인트 코인" onClick={onCoinTap}>
            <img src={imageSrc} alt="" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}

const MISSION_ICON_SRC_BY_TITLE: Record<string, string> = {
  "기록 저장": myMissionRecordSave,
  "투표 참여": myMissionVoteJoin,
  "후기 작성": myMissionReviewWrite,
  "광고 시청": myMissionAdWatch,
}

const getDrinkReviewBookmarkPostId = (reviewId: string) => {
  if (!/^\d+$/.test(reviewId)) return NaN
  return Number(`9${reviewId}`)
}

const findAuthorIdByName = (name: string) => {
  const entry = Object.entries(usersMockById).find(([, user]) => user?.name === name)
  if (!entry) return currentUserMock.id
  return Number(entry[0])
}

export default function MyPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const profile = readUserProfile()
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false)
  const [isCouponVaultOpen, setIsCouponVaultOpen] = useState(false)
  const [isTasteOpen, setIsTasteOpen] = useState(true)
  const [tasteChartRunId, setTasteChartRunId] = useState(0)
  const [isTasteEditorOpen, setIsTasteEditorOpen] = useState(false)
  const [isTasteEditorClosing, setIsTasteEditorClosing] = useState(false)
  const [isPointExchangeOpen, setIsPointExchangeOpen] = useState(false)
  const [savedListTab, setSavedListTab] = useState<"alcohol" | "pairing">("alcohol")
  const savedTabsRef = useRef<HTMLDivElement | null>(null)
  const savedTabRefs = useRef<Record<"alcohol" | "pairing", HTMLButtonElement | null>>({
    alcohol: null,
    pairing: null,
  })
  const [savedTabsGlider, setSavedTabsGlider] = useState({ x: 0, width: 0 })
  const [pointExchangeTopTab, setPointExchangeTopTab] = useState<"exchange" | "history">("exchange")
  const [activeExchangeTab, setActiveExchangeTab] = useState<ExchangeTab>("전체")
  const [exchangeCoinBurstId, setExchangeCoinBurstId] = useState(0)
  const exchangeTopPillRef = useRef<HTMLDivElement | null>(null)
  const exchangeTopTabRefs = useRef<Record<"exchange" | "history", HTMLButtonElement | null>>({
    exchange: null,
    history: null,
  })
  const [exchangeTopGlider, setExchangeTopGlider] = useState({ x: 4, width: 0 })
  const exchangeTabsRef = useRef<HTMLElement | null>(null)
  const exchangeTabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [exchangeTabsGlider, setExchangeTabsGlider] = useState({ x: 0, width: 0 })
  const [myAlertToast, setMyAlertToast] = useState<{ tone: "success" | "warning"; message: string } | null>(null)
  const myAlertToastTimerRef = useRef<number | null>(null)
  const [livePointHistoryItems, setLivePointHistoryItems] = useState(pointHistoryItems)
  const [exchangeBalance, setExchangeBalance] = useState(myPagePointsSummary.balance)
  const [liveDiscountItems, setLiveDiscountItems] = useState(discountItems)
  const [liveExperienceItems, setLiveExperienceItems] = useState(experienceItems)
  const [coinTapCount, setCoinTapCount] = useState(0)
  const myAvatarSrc = resolveMyUserAvatar()
  const [selectedByGroup, setSelectedByGroup] = useState<UserTastePreferences>(() =>
    normalizeTastePreferences(profile.tastePreferences),
  )
  const [savedTastePreferences, setSavedTastePreferences] = useState<UserTastePreferences>(() =>
    normalizeTastePreferences(profile.tastePreferences),
  )
  const [savedAlcoholIds, setSavedAlcoholIds] = useState<string[]>(() => readSavedAlcoholProductIds())
  const [pendingRemoveSavedAlcohol, setPendingRemoveSavedAlcohol] = useState<{ id: string; name: string } | null>(null)
  const [warningByGroup, setWarningByGroup] = useState<Record<string, string>>({})
  const { value: followedUserIds } = useStoredNumberSet(COMMUNITY_FOLLOWED_USERS_KEY, defaultFollowedUserIdsMock)
  const followingCount = useMemo(() => getFollowingCount(followedUserIds), [followedUserIds])
  const { value: bookmarkListById } = useStoredNullableStringRecord(COMMUNITY_BOOKMARK_LIST_BY_POST_KEY)
  const [userPosts, setUserPosts] = useState<FeedPost[]>([])
  const bookmarkSavedCount = Object.values(bookmarkListById).filter(Boolean).length
  const savedActivityLabel = activityStats[activityStats.length - 1]?.label
  const nickname = profile.personalInfo.nickname.trim() || "이름"
  const myTierLabel = getPairingTierLabelByUserId(currentUserMock.id)
  const { activeTags, quietTags } = getTasteTags(savedTastePreferences)
  const { summaryTitle, summaryDescription, situationLine } = getTasteSummary(savedTastePreferences)
  const tasteSheetGroupsRef = useRef<HTMLDivElement | null>(null)
  const [tasteSheetFade, setTasteSheetFade] = useState({ top: false, bottom: false })
  const bookmarkListLabelById = useMemo(
    () => Object.fromEntries(bookmarkLists.map((item) => [item.id, item.label])) as Record<string, string>,
    [],
  )
  const isSavedListOpen = searchParams.get("view") === "saved"
  const isExchangeViewOpen = searchParams.get("view") === "exchange"
  const exchangeQueryTab = searchParams.get("tab")

  const openPointExchange = () => {
    setPointExchangeTopTab("exchange")
    setActiveExchangeTab("전체")
    setIsPointExchangeOpen(true)
  }

  useEffect(() => {
    if (!isExchangeViewOpen) return
    setPointExchangeTopTab(exchangeQueryTab === "history" ? "history" : "exchange")
    setActiveExchangeTab("전체")
    setIsPointExchangeOpen(true)
  }, [isExchangeViewOpen, exchangeQueryTab])

  const handleMissionAction = (missionTitle: string) => {
    if (missionTitle === "기록 저장") {
      navigate("/my/record")
      return
    }
    if (missionTitle === "투표 참여") {
      navigate("/home", { state: { scrollToHomeVote: true } })
      return
    }
    if (missionTitle === "후기 작성") {
      const params = new URLSearchParams()
      params.set("group", "사케")
      params.set("sub", "전체")
      navigate(`/category/list?${params.toString()}`)
    }
  }

  const showMyAlertToast = (tone: "success" | "warning", message: string) => {
    if (myAlertToast) return
    setMyAlertToast({ tone, message })
    if (myAlertToastTimerRef.current) window.clearTimeout(myAlertToastTimerRef.current)
    myAlertToastTimerRef.current = window.setTimeout(() => {
      setMyAlertToast(null)
      myAlertToastTimerRef.current = null
    }, 5000)
  }

  const handleExchangeItemAction = (item: ExchangeItem) => {
    if (item.actionDisabled) {
      showMyAlertToast("warning", "가지고 있는 포인트로는 교환할 수 없어요.")
      return
    }

    const requiredPoint = Number(item.point.replace(/[^\d]/g, ""))
    if (Number.isFinite(requiredPoint) && exchangeBalance < requiredPoint) {
      showMyAlertToast("warning", "가지고 있는 포인트로는 교환할 수 없어요.")
      return
    }

    if (Number.isFinite(requiredPoint) && requiredPoint > 0) {
      setExchangeBalance((prev) => Math.max(0, prev - requiredPoint))
      setLivePointHistoryItems((prev) => [
        {
          title: item.title,
          dateLabel: "오늘",
          pointLabel: `-${requiredPoint.toLocaleString("ko-KR")} P`,
          tone: "negative",
        },
        ...prev,
      ])
    }
    setLiveDiscountItems((prev) =>
      prev.map((entry) => (entry.title === item.title ? { ...entry, actionDisabled: true, statusLabel: "발급 완료" } : entry)),
    )
    setLiveExperienceItems((prev) =>
      prev.map((entry) => (entry.title === item.title ? { ...entry, actionDisabled: true, statusLabel: "발급 완료" } : entry)),
    )

    showMyAlertToast("success", "교환이 완료됐어요!")
  }

  const handleCoinTapReset = () => {
    setCoinTapCount((prev) => {
      const next = prev + 1
      if (next < 4) return next
      setExchangeBalance(myPagePointsSummary.balance)
      setLiveDiscountItems(discountItems)
      setLiveExperienceItems(experienceItems)
      setLivePointHistoryItems(pointHistoryItems)
      showMyAlertToast("success", "초기 상태로 되돌렸어요.")
      return 0
    })
  }

  const renderMyAlertToast = () =>
    myAlertToast ? (
      <div className="app_alert_toast" role="status" aria-live="polite">
        <span className={myAlertToast.tone === "success" ? "app_alert_toast_icon is_success" : "app_alert_toast_icon is_warning"}>
          <img src={myAlertToast.tone === "success" ? iconCheck : iconWarning} alt="" aria-hidden="true" />
        </span>
        <p>{myAlertToast.message}</p>
        <button
          type="button"
          className="app_alert_toast_close"
          aria-label="닫기"
          onClick={() => {
            if (myAlertToastTimerRef.current) {
              window.clearTimeout(myAlertToastTimerRef.current)
              myAlertToastTimerRef.current = null
            }
            setMyAlertToast(null)
          }}
        >
          <img src={iconX} alt="" aria-hidden="true" />
        </button>
      </div>
    ) : null

  useEffect(() => {
    return () => {
      if (myAlertToastTimerRef.current) window.clearTimeout(myAlertToastTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isPointExchangeOpen) return
    setExchangeCoinBurstId((value) => value + 1)
  }, [isPointExchangeOpen])

  useEffect(() => {
    if (!isPointExchangeOpen) return

    const scrollToTop = () => {
      window.scrollTo({ top: 0 })
      const viewport = document.querySelector(".app_viewport")
      if (viewport instanceof HTMLElement) viewport.scrollTo({ top: 0 })
    }

    const raf = window.requestAnimationFrame(scrollToTop)
    return () => window.cancelAnimationFrame(raf)
  }, [isPointExchangeOpen])

  useEffect(() => {
    if (!isTasteOpen) return
    setTasteChartRunId((value) => value + 1)
  }, [isTasteOpen])

  useLayoutEffect(() => {
    if (!isSavedListOpen) return

    function updateSavedTabsGlider() {
      const activeTab = savedTabRefs.current[savedListTab]
      if (!activeTab) return
      setSavedTabsGlider({
        x: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      })
    }

    updateSavedTabsGlider()

    const observer =
      typeof ResizeObserver === "undefined" || !savedTabsRef.current
        ? null
        : new ResizeObserver(() => updateSavedTabsGlider())

    if (savedTabsRef.current) observer?.observe(savedTabsRef.current)
    window.addEventListener("resize", updateSavedTabsGlider)

    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", updateSavedTabsGlider)
    }
  }, [isSavedListOpen, savedListTab])

  useLayoutEffect(() => {
    if (!isPointExchangeOpen) return

    function updateGlider() {
      const activeTab = exchangeTopTabRefs.current[pointExchangeTopTab]
      if (!activeTab) return

      setExchangeTopGlider({
        x: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      })
    }

    updateGlider()

    const observer =
      typeof ResizeObserver === "undefined" || !exchangeTopPillRef.current
        ? null
        : new ResizeObserver(() => updateGlider())

    if (exchangeTopPillRef.current) observer?.observe(exchangeTopPillRef.current)
    window.addEventListener("resize", updateGlider)

    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", updateGlider)
    }
  }, [isPointExchangeOpen, pointExchangeTopTab])

  useLayoutEffect(() => { 
    if (!isPointExchangeOpen) return 

    function updateGlider() { 
      const activeTab = exchangeTabRefs.current[activeExchangeTab] 
      const row = exchangeTabsRef.current
      if (!activeTab || !(row instanceof HTMLElement)) return 

      setExchangeTabsGlider({ 
        x: activeTab.offsetLeft, 
        width: activeTab.offsetWidth, 
      }) 

      const targetCenter = activeTab.offsetLeft + activeTab.offsetWidth / 2
      const nextScrollLeft = Math.max(0, targetCenter - row.clientWidth / 2)
      const maxScrollLeft = Math.max(0, row.scrollWidth - row.clientWidth)
      row.scrollTo({
        left: Math.min(maxScrollLeft, nextScrollLeft),
        behavior: "smooth",
      })
    } 

    updateGlider()

    const observer =
      typeof ResizeObserver === "undefined" || !exchangeTabsRef.current ? null : new ResizeObserver(() => updateGlider())

    if (exchangeTabsRef.current) observer?.observe(exchangeTabsRef.current)
    window.addEventListener("resize", updateGlider)

    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", updateGlider)
    }
  }, [isPointExchangeOpen, activeExchangeTab])

  function updateTasteSheetFade() {
    const el = tasteSheetGroupsRef.current
    if (!el) return
    const canScroll = el.scrollHeight - el.clientHeight > 2
    if (!canScroll) {
      setTasteSheetFade({ top: false, bottom: false })
      return
    }

    const top = el.scrollTop > 2
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 2
    setTasteSheetFade({ top, bottom })
  }

  useEffect(() => {
    if (!isTasteEditorOpen) return
    const raf = window.requestAnimationFrame(() => updateTasteSheetFade())
    return () => window.cancelAnimationFrame(raf)
  }, [isTasteEditorOpen])

  const bookmarkedPosts = useMemo(() => {
    const combinedPosts = [...userPosts, ...feedPosts]
    const postById = new Map<number, FeedPost>()

    combinedPosts.forEach((post) => {
      if (typeof post.id === "number" && Number.isFinite(post.id) && !postById.has(post.id)) {
        postById.set(post.id, post)
      }
    })

    drinkReviews.forEach((review) => {
      const reviewPostId = getDrinkReviewBookmarkPostId(review.id)
      if (!Number.isFinite(reviewPostId) || postById.has(reviewPostId)) return
      const authorId = findAuthorIdByName(review.author.name)
      postById.set(reviewPostId, {
        id: reviewPostId,
        authorId,
        authorName: review.author.name,
        authorProfile: review.author.preference,
        title: review.title,
        pairingSummary: review.title,
        body: review.body,
        imageSrc: review.images[0] ?? "",
        imageSrcs: review.images,
        createdAt: review.createdAt,
        likeCount: review.likes,
        commentCount: review.comments,
        popularityScore: review.recommendScore,
        rating: Number.parseFloat(review.rating) || undefined,
        locationLabel: review.location ?? "",
        searchTags: review.tags.map((tag) => tag.replace(/^#/, "")),
        drinkType: review.alcoholTag ?? "주류",
        drinkName: review.alcoholTag ?? "",
        sourceType: "drink-review",
      })
    })

    return Object.entries(bookmarkListById)
      .map(([postId, listId]) => {
        if (!listId) return null
        const post = postById.get(Number(postId))
        if (!post) return null
        return { post, listId }
      })
      .filter((item): item is { post: FeedPost; listId: string } => Boolean(item))
      .sort((left, right) => new Date(right.post.createdAt).getTime() - new Date(left.post.createdAt).getTime())
  }, [bookmarkListById, userPosts, bookmarkListLabelById])

  const savedAlcoholItems = useMemo(() => {
    if (savedAlcoholIds.length === 0) return []
    const allItems = [
      ...getCategoryListItems("사케", ALL_SUBCATEGORY),
      ...getCategoryListItems("소주", ALL_SUBCATEGORY),
      ...getCategoryListItems("와인", ALL_SUBCATEGORY),
      ...getCategoryListItems("맥주", ALL_SUBCATEGORY),
      ...getCategoryListItems("위스키", ALL_SUBCATEGORY),
      ...getCategoryListItems("증류주", ALL_SUBCATEGORY),
      ...getCategoryListItems("전통주", ALL_SUBCATEGORY),
      ...getCategoryListItems("기타", ALL_SUBCATEGORY),
    ]
    const byId = new Map(allItems.map((item) => [item.id, item]))
    return savedAlcoholIds.map((id) => byId.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item))
  }, [savedAlcoholIds])
  const savedActivityCount = bookmarkSavedCount + savedAlcoholItems.length

  const handleRemoveSavedAlcohol = (productId: string) => {
    const isRemoved = removeSavedAlcoholProductId(productId)
    if (!isRemoved) return
    setSavedAlcoholIds((prev) => prev.filter((id) => id !== productId))
  }

  const confirmRemoveSavedAlcohol = () => {
    if (!pendingRemoveSavedAlcohol) return
    handleRemoveSavedAlcohol(pendingRemoveSavedAlcohol.id)
    setPendingRemoveSavedAlcohol(null)
  }

  const myWrittenPostCount = useMemo(() => {
    const combinedPosts = [...userPosts, ...feedPosts]
    const postById = new Map<number, FeedPost>()

    combinedPosts.forEach((post) => {
      if (typeof post.id === "number" && Number.isFinite(post.id) && !postById.has(post.id)) {
        postById.set(post.id, post)
      }
    })

    return Array.from(postById.values()).filter(isMyWrittenPost).length
  }, [userPosts])

  const tasteValueByKey = useMemo(() => {
    return Object.fromEntries(
      tasteBars.map((item) => [item.className, Math.max(0, Math.min(100, item.value))]),
    ) as Record<string, number>
  }, [])

  const buildArcMetric = (radius: number, value: number) => {
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - value / 100)
    return { radius, circumference, offset }
  }

  useEffect(() => {
    const handleGoHome = () => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete("view")
        return next
      })
      setIsPointExchangeOpen(false)
    }

    window.addEventListener("my:go-home", handleGoHome)
    return () => window.removeEventListener("my:go-home", handleGoHome)
  }, [setSearchParams])

  const openSavedList = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("view", "saved")
      return next
    })

  const closeSavedList = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete("view")
      return next
    })

  const closePointExchangeView = () => {
    if (isExchangeViewOpen) {
      if (window.history.length > 1) {
        navigate(-1)
        return
      }

      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete("view")
        next.delete("tab")
        return next
      })
      setIsPointExchangeOpen(false)
      return
    }

    setIsPointExchangeOpen(false)
  }

  useEffect(() => {
    const readStoredUserPosts = () => {
      try {
        const raw = window.localStorage.getItem("community_user_posts")
        const parsed = raw ? JSON.parse(raw) : []
        setUserPosts(Array.isArray(parsed) ? (parsed as FeedPost[]) : [])
      } catch {
        setUserPosts([])
      }
    }

    readStoredUserPosts()
    window.addEventListener("community:user-posts-updated", readStoredUserPosts)
    return () => window.removeEventListener("community:user-posts-updated", readStoredUserPosts)
  }, [])

  function openTasteEditor() {
    setIsTasteEditorClosing(false)
    setIsTasteEditorOpen(true)
  }

  function closeTasteEditor() {
    setIsTasteEditorClosing(true)
    window.setTimeout(() => {
      setIsTasteEditorOpen(false)
      setIsTasteEditorClosing(false)
    }, TASTE_SHEET_CLOSE_MS)
  }

  function toggleOption(group: PreferenceGroup, option: string) {
    setWarningByGroup((current) => ({ ...current, [group.key]: "" }))

    setSelectedByGroup((current) => {
      if (group.type === "single") return { ...current, [group.key]: [option] }

      const selectedOptions = current[group.key] ?? []
      if (option === NONE_OPTION) {
        return { ...current, [group.key]: selectedOptions.includes(NONE_OPTION) ? [] : [NONE_OPTION] }
      }

      const selectedWithoutNone = selectedOptions.filter((selectedOption) => selectedOption !== NONE_OPTION)
      if (selectedWithoutNone.includes(option)) {
        return {
          ...current,
          [group.key]: selectedWithoutNone.filter((selectedOption) => selectedOption !== option),
        }
      }

      const maxSelections = group.maxSelections ?? MAX_MULTI_SELECTIONS
      if (selectedWithoutNone.length >= maxSelections) {
        return current
      }

      return { ...current, [group.key]: [...selectedWithoutNone, option] }
    })
  }

  function saveTastePreferences() {
    const nextWarnings: Record<string, string> = {}
    preferenceGroups.forEach((group) => {
      if ((selectedByGroup[group.key] ?? []).length === 0) {
        nextWarnings[group.key] = "답변을 선택해 주세요"
      }
    })

    if (Object.keys(nextWarnings).length > 0) {
      setWarningByGroup((current) => ({ ...current, ...nextWarnings }))
      return
    }

    const hasCoreTasteChanged =
      JSON.stringify(savedTastePreferences.drinkType ?? []) !== JSON.stringify(selectedByGroup.drinkType ?? []) ||
      JSON.stringify(savedTastePreferences.trait ?? []) !== JSON.stringify(selectedByGroup.trait ?? [])

    updateUserTastePreferences(selectedByGroup)
    setSavedTastePreferences(selectedByGroup)
    if (hasCoreTasteChanged) {
      setTasteChartRunId((value) => value + 1)
    }
    closeTasteEditor()
  }

  function selectExchangeTab(tab: ExchangeTab) {
    setActiveExchangeTab(tab)
  }

  const bodyArc = buildArcMetric(46, tasteValueByKey.body ?? 0)
  const bitterArc = buildArcMetric(36, tasteValueByKey.bitter ?? 0)
  const sweetArc = buildArcMetric(26, tasteValueByKey.sweet ?? 0)
  const sparkleArc = buildArcMetric(16, tasteValueByKey.sparkle ?? 0)

  if (isSavedListOpen) {
    const showSavedAlcohol = savedListTab === "alcohol"
    return (
      <section className="my_exchange_page my_saved_page" aria-label="저장한 리스트">
        <header className="my_exchange_header">
          <button
            type="button"
            className="my_exchange_back"
            aria-label="마이페이지로 돌아가기"
            onClick={closeSavedList}
          />
          <h1>저장한 리스트</h1>
          <div />
        </header>
        <div ref={savedTabsRef} className="my_saved_tabs" role="tablist" aria-label="저장 리스트 탭">
          <motion.span
            className="my_saved_tabs_glider"
            animate={savedTabsGlider}
            initial={false}
            transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
            aria-hidden="true"
          />
          <button
            type="button"
            role="tab"
            aria-selected={showSavedAlcohol}
            className={showSavedAlcohol ? "my_saved_tab is_active" : "my_saved_tab"}
            onClick={() => setSavedListTab("alcohol")}
            ref={(node) => {
              savedTabRefs.current.alcohol = node
            }}
          >
            주류 상품
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!showSavedAlcohol}
            className={!showSavedAlcohol ? "my_saved_tab is_active" : "my_saved_tab"}
            onClick={() => setSavedListTab("pairing")}
            ref={(node) => {
              savedTabRefs.current.pairing = node
            }}
          >
            페어링 후기
          </button>
        </div>

        <div className="my_saved_content">
          {showSavedAlcohol ? savedAlcoholItems.length > 0 ? (
            <div className="my_saved_product_list" aria-label="저장한 주류 상품 목록">
              {savedAlcoholItems.map((item) => (
                <div
                  key={item.id}
                  className="my_saved_product_card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/product/${item.id}`)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return
                    event.preventDefault()
                    navigate(`/product/${item.id}`)
                  }}
                  aria-label={`${item.name} 상세 보기`}
                >
                  <div className="my_saved_product_thumb" aria-hidden="true">
                    <img src={item.imageSrc} alt="" />
                  </div>
                  <div className="my_saved_product_body">
                    <strong>{item.name}</strong>
                    <p>{`${item.price.toLocaleString("ko-KR")}원`}</p>
                    <div className="my_saved_product_tags">
                      {(item.tags ?? []).slice(0, 3).map((tag) => (
                        <span key={`${item.id}-${tag}`}>{`#${tag}`}</span>
                      ))}
                      {typeof item.abv === "number" ? <span>{`#${item.abv}도`}</span> : null}
                    </div>
                  </div>
                  <img className="my_saved_product_arrow" src={iconCaretRight} alt="" aria-hidden="true" />
                  <button
                    type="button"
                    className="my_saved_product_bookmark"
                    aria-label={`${item.name} 저장 해제`}
                    onClick={(event) => {
                      event.stopPropagation()
                      setPendingRemoveSavedAlcohol({ id: item.id, name: item.name })
                    }}
                  >
                    <img src={iconBookmarkActive} alt="" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="my_saved_empty" role="status">
              저장한 주류 상품이 아직 없어요.
            </div>
          ) : bookmarkedPosts.length > 0 ? (
            <div className="feed_cards my_saved_list" aria-label="저장한 게시글 목록">
            {bookmarkedPosts.map(({ post, listId }) => {
              const authorId = typeof post.authorId === "number" ? post.authorId : currentUserMock.id
              const authorName = post.authorName?.trim() || usersMockById[authorId]?.name || "익명"
              const profile = usersMockById[authorId]?.profile ?? post.authorProfile ?? ""
              const pairingTitle = extractPairingTitle(post.title)
              const title = post.isQna ? post.title : post.pairingSummary?.trim() || pairingTitle
              const description = post.locationLabel?.trim() || getPairingSummaryText(post)
              const listLabel = bookmarkListLabelById[listId] ?? listId

              return (
                <RelatedContentPostCard
                  key={`${post.id}-${listId}`}
                  postId={post.id}
                  isQna={Boolean(post.isQna)}
                  authorName={authorName}
                  profile={profile}
                  badgeClassName={getTierClassName(getPairingTierByUserId(authorId), "feed_post_badge")}
                  badgeText={getPairingTierLabelByUserId(authorId)}
                  followButtonClassName="follow_toggle_button"
                  followAriaLabel="팔로우"
                  followText="팔로우"
                  onToggleFollow={() => {}}
                  linkTo={`/community/pairing/${post.id}`}
                  linkState={{
                    pairingTitle,
                    pairingSummary: post.pairingSummary ?? "",
                    body: post.body,
                    authorId,
                    authorName,
                    profile,
                    locationLabel: post.locationLabel ?? "",
                    drinkType: post.drinkType ?? "",
                    foods: post.foods,
                    features: post.features ?? [],
                    source: post.isQna ? "free" : "feed",
                    feedFilter: post.isQna ? "free" : "review",
                  }}
                  title={title}
                  body={`${listLabel} · ${description}`}
                  showImages={true}
                  photoIds={post.photoIds}
                  imageSrcs={post.imageSrcs}
                  answerCount={post.answerCount}
                  answerPreview={post.answerPreview}
                  likeActive={false}
                  likeAriaLabel="좋아요"
                  likeText="0"
                  onToggleLike={() => {}}
                  commentText={`${post.commentCount ?? 0}`}
                  onViewComments={() =>
                    navigate(`/community/pairing/${post.id}`, {
                      state: {
                        pairingTitle,
                        pairingSummary: post.pairingSummary ?? "",
                        body: post.body,
                        authorId,
                        authorName,
                        profile,
                        locationLabel: post.locationLabel ?? "",
                        drinkType: post.drinkType ?? "",
                        foods: post.foods,
                        features: post.features ?? [],
                        source: post.isQna ? "free" : "feed",
                        feedFilter: post.isQna ? "free" : "review",
                      },
                    })
                  }
                  bookmarkActive={true}
                  bookmarkAriaLabel="북마크"
                  onOpenBookmarkPicker={() => {}}
                />
              )
            })}
            </div>
          ) : (
            <div className="my_saved_empty" role="status">
              저장한 게시글이 아직 없어요.
            </div>
          )}
        </div>
        {pendingRemoveSavedAlcohol ? (
          <PurchaseConfirmModal
            ariaLabel="저장 해제 확인"
            message={`${pendingRemoveSavedAlcohol.name}을(를)\n저장한 리스트에서 삭제할까요?`}
            cancelLabel="취소"
            confirmLabel="삭제"
            onCancel={() => setPendingRemoveSavedAlcohol(null)}
            onConfirm={confirmRemoveSavedAlcohol}
          />
        ) : null}
      </section>
    )
  }

  if (isPointExchangeOpen) {
    const showDiscount = activeExchangeTab === "전체" || activeExchangeTab === "할인권"
    const showExperience = activeExchangeTab === "전체" || activeExchangeTab === "체험권"
    const showPreparing = activeExchangeTab === "프리미엄" || activeExchangeTab === "광고 적립"
    const visibleDiscountItems = liveDiscountItems
    const visibleExperienceItems = liveExperienceItems

    return (
      <section className="my_exchange_page" aria-label="포인트 교환소">
        <header className="my_exchange_header">
          <button
            type="button"
            className="my_exchange_back"
            aria-label="마이페이지로 돌아가기"
            onClick={closePointExchangeView}
          />
          <h1 className="my_exchange_title">포인트</h1>
          <div />
        </header>

        <div ref={exchangeTopPillRef} className="my_exchange_top_tabs" role="tablist" aria-label="포인트 탭">
          <motion.span
            className="my_exchange_top_tabs_glider"
            animate={exchangeTopGlider}
            initial={false}
            transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
            aria-hidden="true"
          />
          <button
            type="button"
            role="tab"
            aria-selected={pointExchangeTopTab === "exchange"}
            className={pointExchangeTopTab === "exchange" ? "is_active" : ""}
            onClick={() => setPointExchangeTopTab("exchange")}
            ref={(node) => {
              exchangeTopTabRefs.current.exchange = node
            }}
          >
            포인트 교환소
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pointExchangeTopTab === "history"}
            className={pointExchangeTopTab === "history" ? "is_active" : ""}
            onClick={() => setPointExchangeTopTab("history")}
            ref={(node) => {
              exchangeTopTabRefs.current.history = node
            }}
          >
            포인트 내역
          </button>
        </div>

        {pointExchangeTopTab === "exchange" ? (
          <>
            <section className="my_exchange_balance my_point_card" aria-label="보유 포인트">
              <div className="my_point_card_head">
                <div className="my_point_card_meta">
                  <span>보유 포인트</span>
                  <strong>{exchangeBalance.toLocaleString("ko-KR")} P</strong>
                </div>
                <PointCoinBurst seed={exchangeCoinBurstId} imageSrc={myPointCoinImage} onCoinTap={handleCoinTapReset} />
              </div>
              <small className="my_point_card_reset_hint">코인 4번 탭하면 초기화 ({coinTapCount}/4)</small>
              <p>교환 시 포인트가 차감돼요</p>
            </section>

            <nav ref={exchangeTabsRef} className="my_exchange_tabs" aria-label="교환소 카테고리">
              <motion.span
                className="my_exchange_tabs_glider"
                animate={exchangeTabsGlider}
                initial={false}
                transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
                aria-hidden="true"
              />
              {exchangeTabs.map((tab) => (
                <button
                  type="button"
                  className={activeExchangeTab === tab ? "is_active" : ""}
                  key={tab}
                  onClick={() => selectExchangeTab(tab)}
                  ref={(node) => {
                    exchangeTabRefs.current[tab] = node
                  }}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="my_exchange_sections">
              {showDiscount ? (
                <section className="my_exchange_section" aria-labelledby="exchange-discount">
                  <h2 id="exchange-discount">할인권</h2>
                  <div className="my_exchange_item_list">
                    {visibleDiscountItems.map((item) => (
                      <ExchangeItemCard item={item} tone="discount" key={item.title} onActionClick={handleExchangeItemAction} />
                    ))}
                  </div>
                </section>
              ) : null}

              {showExperience ? (
                <section className="my_exchange_section" aria-labelledby="exchange-experience">
                  <h2 id="exchange-experience">체험권</h2>
                  <div className="my_exchange_item_list">
                    {visibleExperienceItems.map((item) => (
                      <ExchangeItemCard item={item} tone="experience" key={item.title} onActionClick={handleExchangeItemAction} />
                    ))}
                  </div>
                </section>
              ) : null}

              {showPreparing ? (
                <section className="my_exchange_empty" aria-label={`${activeExchangeTab} 준비중`}>
                  <p>상품을 준비하고 있어요.</p>
                </section>
              ) : null}
            </div>

            <section className="my_exchange_missions" aria-labelledby="my-exchange-missions-title">
              <div className="my_exchange_missions_card">
                <h2 id="my-exchange-missions-title">미션하고 포인트 모으기</h2>
                <div className="my_exchange_mission_list">
                <img className="my_exchange_missions_mascot" src={myPointMascotImage} alt="" aria-hidden="true" />
                  {pointMissions.map((mission) => {
                    const iconSrc = MISSION_ICON_SRC_BY_TITLE[mission.title]
                    const isDisabled = mission.title === "광고 시청"

                    return (
                      <article className="my_exchange_mission" key={mission.title}>
                        <span className="my_exchange_mission_icon" aria-hidden="true">
                          {iconSrc ? <img src={iconSrc} alt="" aria-hidden="true" /> : null}
                        </span>
                        <div className="my_exchange_mission_meta">
                          <strong className="my_exchange_mission_title">{mission.title}</strong>
                          <span className="my_exchange_mission_reward">{mission.reward}</span>
                        </div>
                        <button
                          type="button"
                          className={isDisabled ? "is_disabled" : ""}
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) {
                              showMyAlertToast("warning", "현재 지원되지 않는 기능이에요.")
                              return
                            }
                            handleMissionAction(mission.title)
                          }}
                        >
                          {mission.action}
                        </button>
                      </article>
                    )
                  })}
                </div>
              </div>
            </section>
            {renderMyAlertToast()}
          </>
        ) : (
          <section className="my_point_history" aria-label="포인트 내역">
            <div className="my_point_history_list">
              {livePointHistoryItems.map((item) => (
                <article className="my_point_history_item" key={`${item.title}-${item.dateLabel}-${item.pointLabel}`}>
                  <div className="my_point_history_meta">
                    <strong className="my_point_history_title">{item.title}</strong>
                    <span className="my_point_history_date">{item.dateLabel}</span>
                  </div>
                  <strong
                    className={
                      item.tone === "negative"
                        ? "my_point_history_amount is_negative"
                        : "my_point_history_amount is_positive"
                    }
                  >
                    {item.pointLabel}
                  </strong>
                </article>
              ))}
            </div>
            {renderMyAlertToast()}
          </section>
        )}
      </section>
    )
  }

  if (isCouponVaultOpen) {
    const issuedDiscountItems = liveDiscountItems.filter((item) => Boolean(item.actionDisabled) && item.statusLabel?.includes("발급"))
    const issuedExperienceItems = liveExperienceItems.filter(
      (item) => Boolean(item.actionDisabled) && item.statusLabel?.includes("발급"),
    )

    return (
      <section className="my_exchange_page" aria-label="쿠폰 보기">
        <header className="my_exchange_header">
          <button
            type="button"
            className="my_exchange_back"
            aria-label="마이페이지로 돌아가기"
            onClick={() => setIsCouponVaultOpen(false)}
          />
          <h1 className="my_exchange_title">보유중인 쿠폰</h1>
          <div />
        </header>

        <div className="my_exchange_sections">
          {issuedDiscountItems.length > 0 ? (
            <section className="my_exchange_section" aria-labelledby="coupon-discount">
              <h2 id="coupon-discount">할인권</h2>
              <div className="my_exchange_item_list">
                {issuedDiscountItems.map((item) => (
                  <ExchangeItemCard item={item} tone="discount" key={item.title} onActionClick={handleExchangeItemAction} />
                ))}
              </div>
            </section>
          ) : null}

          {issuedExperienceItems.length > 0 ? (
            <section className="my_exchange_section" aria-labelledby="coupon-experience">
              <h2 id="coupon-experience">체험권</h2>
              <div className="my_exchange_item_list">
                {issuedExperienceItems.map((item) => (
                  <ExchangeItemCard item={item} tone="experience" key={item.title} onActionClick={handleExchangeItemAction} />
                ))}
              </div>
            </section>
          ) : null}

          {issuedDiscountItems.length === 0 && issuedExperienceItems.length === 0 ? (
            <section className="my_exchange_empty" aria-label="보유 쿠폰 없음">
              <p>발급 완료된 쿠폰이 아직 없어요.</p>
            </section>
          ) : null}
        </div>
        {renderMyAlertToast()}
      </section>
    )
  }

  return (
    <section className="my_page" aria-label="마이페이지">
      {renderMyAlertToast()}
      <header className="my_profile_header">
        <div className="my_profile_header_inner">
          <div className="my_profile_avatar" aria-hidden="true">
            {myAvatarSrc ? (
              <img className="my_profile_avatar_image" src={myAvatarSrc} alt="" aria-hidden="true" />
            ) : null}
          </div>

          <div className="my_profile_summary">
            <div className="my_profile_name_row" aria-label="닉네임 및 메뉴">
              <div className="my_profile_name">
                <span className="my_profile_nickname">{nickname}</span>
                <span className="my_profile_grade">{myTierLabel}</span>
                <TierInfoPopover />
              </div>
              <button
                type="button"
                className="my_profile_menu"
                aria-label="프로필 메뉴"
                onClick={() => setIsProfileEditOpen(true)}
              >
                <img src={iconDotsThreeVertical} alt="" aria-hidden="true" />
              </button>
            </div>

            <div className="my_profile_follow_row" aria-label="팔로우 정보">
              <div className="my_profile_follow_item">
                <strong>{myPageProfileSummary.followerCount}</strong>
                <span>팔로워</span>
              </div>
              <div className="my_profile_follow_item">
                <strong>{followingCount.toLocaleString("ko-KR")}</strong>
                <span>팔로잉</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <ProfileEditModal
        isOpen={isProfileEditOpen}
        initialNickname={nickname}
        onClose={() => setIsProfileEditOpen(false)}
      />

      <div className="my_page_body">
        <section className="my_activity_section" aria-labelledby="my-activity-title">
          <h2 id="my-activity-title">활동 데이터</h2>
          <div className="my_activity_panel" aria-label="활동 데이터 요약">
            {activityStats
              .filter((stat) => ["기록", "투표 참여", savedActivityLabel].includes(stat.label))
              .map((stat) => {
                const isSavedStat = stat.label === savedActivityLabel
                const isRecordStat = stat.label === "기록"
                const isVoteStat = stat.label === "투표 참여"
                const value = isSavedStat ? savedActivityCount : isRecordStat ? myWrittenPostCount : stat.value
                const Element: "button" | "div" = isSavedStat || isRecordStat || isVoteStat ? "button" : "div"
                const extraProps = isSavedStat
                  ? ({ type: "button", onClick: openSavedList, "aria-label": "저장한 리스트 보기" } as const)
                  : isRecordStat
                    ? ({ type: "button", onClick: () => navigate("/my/record"), "aria-label": "기록 보기" } as const)
                    : isVoteStat
                      ? ({ type: "button", onClick: () => navigate("/vote?filter=my"), "aria-label": "내 투표 참여 내역 보기" } as const)
                  : ({} as const)
                return (
                  <Element key={stat.label} className="my_activity_item" {...extraProps}>
                    <strong>{value}</strong>
                    <span>{stat.label}</span>
                  </Element>
                )
              })}
          </div>
        </section>

        <button
          type="button"
          className={isTasteOpen ? "my_taste_summary is_open" : "my_taste_summary"}
          aria-label="취향 요약"
          aria-expanded={isTasteOpen}
          aria-controls="my-taste-profile"
          onClick={() => setIsTasteOpen((current) => !current)}
        >
          <p className="my_taste_summary_text">
            <strong>{summaryTitle}</strong>
            <span>
              <span className="my_taste_summary_highlight">{situationLine}</span> {summaryDescription}
            </span>
          </p>
          <img className="my_taste_summary_icon" src={iconCaretDown} alt="" aria-hidden="true" />
        </button>

        <AnimatePresence>
          {isTasteOpen ? (
            <motion.section
              className="my_taste_profile my_taste_profile_motion"
              aria-label="내 취향 프로필"
              id="my-taste-profile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="my_taste_profile_card">
              <div className="my_section_header">
              <h2 id="my-taste-profile-title">내 취향 프로필</h2>
              <button type="button" className="my_icon_button" aria-label="취향 설정" onClick={openTasteEditor}>
                <img src={iconGearSix} alt="" aria-hidden="true" />
              </button>
            </div>
              <div className="my_taste_profile_chart" aria-hidden="true">
                <svg key={tasteChartRunId} viewBox="0 0 120 120" className="my_taste_chart_svg" aria-hidden="true">
                  <circle className="my_taste_chart_bg" cx="60" cy="60" r="46" />
                  <motion.circle
                    className="my_taste_chart_arc is_body"
                    cx="60"
                    cy="60"
                    r={bodyArc.radius}
                    strokeDasharray={bodyArc.circumference}
                    initial={{ strokeDashoffset: bodyArc.circumference }}
                    animate={{ strokeDashoffset: bodyArc.offset }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                  <motion.circle
                    className="my_taste_chart_arc is_bitter"
                    cx="60"
                    cy="60"
                    r={bitterArc.radius}
                    strokeDasharray={bitterArc.circumference}
                    initial={{ strokeDashoffset: bitterArc.circumference }}
                    animate={{ strokeDashoffset: bitterArc.offset }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 }}
                  />
                  <motion.circle
                    className="my_taste_chart_arc is_sweet"
                    cx="60"
                    cy="60"
                    r={sweetArc.radius}
                    strokeDasharray={sweetArc.circumference}
                    initial={{ strokeDashoffset: sweetArc.circumference }}
                    animate={{ strokeDashoffset: sweetArc.offset }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                  />
                  <motion.circle
                    className="my_taste_chart_arc is_sparkle"
                    cx="60"
                    cy="60"
                    r={sparkleArc.radius}
                    strokeDasharray={sparkleArc.circumference}
                    initial={{ strokeDashoffset: sparkleArc.circumference }}
                    animate={{ strokeDashoffset: sparkleArc.offset }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
                  />
                </svg>
                <div className="my_taste_chart_legend" aria-label="취향 범례">
                  <div className="my_taste_legend_item">
                    <span className="my_taste_legend_dot is_body" aria-hidden="true" />
                    <span>바디</span>
                  </div>
                  <div className="my_taste_legend_item">
                    <span className="my_taste_legend_dot is_bitter" aria-hidden="true" />
                    <span>쓴맛</span>
                  </div>
                  <div className="my_taste_legend_item">
                    <span className="my_taste_legend_dot is_sweet" aria-hidden="true" />
                    <span>단맛</span>
                  </div>
                  <div className="my_taste_legend_item">
                    <span className="my_taste_legend_dot is_sparkle" aria-hidden="true" />
                    <span>탄산</span>
                  </div>
                </div>
              </div>

              <div className="my_tag_group" aria-label="선호/기피 태그">
                {activeTags.map((tag) => (
                  <span className="my_tag is_active" key={tag}>
                    {tag}
                  </span>
                ))}
                {quietTags.map((tag) => (
                  <span className="my_tag is_quiet" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <p className="my_ai_note">
                <span>AI 분석</span>
                "빠르게 결정하는 스타일이에요. 가성비 중시로 새로운 경험도 자주 시도해요."
              </p>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        {isTasteEditorOpen ? (
          <div
            className={isTasteEditorClosing ? "my_taste_sheet_overlay is_closing" : "my_taste_sheet_overlay"}
            role="presentation"
            onClick={closeTasteEditor}
          >
            <section
              className={[
                "my_taste_sheet",
                tasteSheetFade.top ? "has_top_fade" : "",
                tasteSheetFade.bottom ? "has_bottom_fade" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              role="dialog"
              aria-modal="true"
              aria-label="취향 수정"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="my_taste_sheet_header">
                <h2>취향 수정</h2>
                <button type="button" aria-label="닫기" onClick={closeTasteEditor} />
              </header>

              <div className="my_taste_sheet_groups" ref={tasteSheetGroupsRef} onScroll={updateTasteSheetFade}>
                {preferenceGroups.map((group) => (
                  <PreferenceGroupSection
                    key={group.key}
                    group={group}
                    selectedOptions={selectedByGroup[group.key] ?? []}
                    warning={warningByGroup[group.key]}
                    onToggleOption={toggleOption}
                  />
                ))}
              </div>

              <button type="button" className="my_taste_sheet_save" onClick={saveTastePreferences}>저장</button>
            </section>
          </div>
        ) : null}

        <section className="my_points_section" aria-labelledby="my-points-title">
          <div className="my_section_header">
            <h2 id="my-points-title">포인트</h2>
            <button type="button" className="my_link_button" onClick={openPointExchange}>
              포인트 교환소
            </button>
          </div>

          <div className="my_point_card">
            <div className="my_point_card_head">
              <div className="my_point_card_meta">
                <span>보유 포인트</span>
                <strong>{myPagePointsSummary.balance.toLocaleString("ko-KR")} P</strong>
              </div>
              <div className="my_point_coin" aria-hidden="true">
                <img src={myPointCoinImage} alt="" aria-hidden="true" />
              </div>
            </div>
            <progress
              className="my_point_progress"
              value={myPagePointsSummary.balance}
              max={myPagePointsSummary.balance + myPagePointsSummary.remainingToNextReward}
              aria-hidden="true"
            />
            <p>
              {myPagePointsSummary.nextRewardLabel}까지 <strong>{myPagePointsSummary.remainingToNextReward}P</strong>
            </p>
          </div>
        </section>

        <nav className="my_setting_list" aria-label="마이페이지 설정">
          <button type="button" className="my_setting_item" onClick={() => setIsCouponVaultOpen(true)}>
            <div className="my_setting_item_body">
              <span>쿠폰 보기</span>
              <small>보유 중인 쿠폰 확인 및 사용</small>
            </div>
            <img src={iconCaretRight} alt="" aria-hidden="true" />
          </button>
          <button type="button" className="my_setting_item is_disabled" disabled aria-disabled="true">
            <div className="my_setting_item_body">
              <span>계정/보안 설정</span>
              <small>프로필 편집 및 인증, 알림</small>
            </div>
            <img src={iconCaretRight} alt="" aria-hidden="true" />
          </button>
          <button type="button" className="my_setting_item is_disabled" disabled aria-disabled="true">
            <div className="my_setting_item_body">
              <span>공지사항&문의</span>
              <small>고객 지원 센터</small>
            </div>
            <img src={iconCaretRight} alt="" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </section>
  )
}
