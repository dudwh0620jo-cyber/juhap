import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import "../styles/community.css"
import askQuestionBanner from "../assets/ask_question_banner.png"
import iconDots from "../assets/svg/dotsthreevertical.svg"
import iconPencil from "../assets/svg/pencilsimple_p.svg"
import iconX from "../assets/svg/x.svg"
import iconCheck from "../assets/svg/check_g.svg"
import iconResetWhite from "../assets/svg/arrowcounterclockwise_w.svg"
import emptyMascotImage from "../assets/fail_mascot_01.png"
import AlertModal from "../components/AlertModal"
import CommunityHeader from "../components/CommunityHeader"
import CommunityBookmarkPickerModal from "../components/CommunityBookmarkPickerModal"
import CommunityReviewCard from "../components/CommunityReviewCard"
import QuestionPostRow from "../components/QuestionPostRow"
import PurchaseConfirmModal from "../components/PurchaseConfirmModal"
import SearchFilterModal from "../components/SearchFilterModal"
import CommunityFilterPanel from "../components/CommunityFilterPanel"
import PostOwnerActionModal from "../components/PostOwnerActionModal"
import ScrollTopButton from "../components/ScrollTopButton"
import {
  deriveCommunityTagBundle,
  extractPairingTitle,
  feedPosts as communityFeedPosts,
  resolveQuestionThumbVariant,
  type FeedPost,
} from "../utils/communityPosts"
import { communityPageData, type FeedFilter, type ReviewSortKey } from "../data/communityPageData"
import { getPairingTierByUserId, getPairingTierLabelByUserId } from "../utils/pairingTier"
import { getTierClassName } from "../utils/tier"
import {
  useStoredBooleanRecordFromIds,
  useStoredNullableStringRecord,
  useStoredNumberSet,
  useStoredStringArray,
} from "../utils/storage"
import { getFollowingCount, usersMockById } from "../utils/usersMock"
import { COMMUNITY_BOOKMARK_LIST_BY_POST_KEY } from "../utils/communityStorage"
import { useMyOnboardingMeta } from "../hooks/useMyOnboardingMeta"
import { useCommunityStoredPosts } from "../hooks/useCommunityStoredPosts"
import { QUESTION_BANNER_COPY } from "../utils/communityQuestionData"
import { myPageProfileSummary } from "../data/myPageContent"
import { resolveMyUserAvatar } from "../utils/userAvatars"
import { currentUserMock } from "../utils/usersMock"
import { useLayoutEffect } from "react"
import { motion } from "motion/react"
import { usePreloadImages } from "../hooks/usePreloadImages"
import { resolveReviewImage } from "../utils/reviewImages"
import { resolveQuestionImage } from "../utils/questionImages"
import {
  buildPopupChipGroups,
  buildSearchAllChipGroups,
  filterCommunityFeedPosts,
  filterPopupChipGroups,
  getCommunityFeedPosts,
  getEffectiveSelectedFeatures,
  getPairingCommentNavigationState,
  isCommunityFeedSearchActive,
} from "../utils/communityFeed"
import { getWeeklyAllRankingVotesById } from "../utils/rankingData"

const feedPosts: FeedPost[] = communityFeedPosts
const EMPTY_FILTER_SET = new Set<string>()

type SegmentTabItem = {
  key: string
  label: string
}

function FeedSegmentTabs({
  ariaLabel,
  items,
  activeKey,
  onChange,
}: {
  ariaLabel: string
  items: SegmentTabItem[]
  activeKey: string
  onChange: (key: string) => void
}) {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [glider, setGlider] = useState({ x: 0, width: 0 })

  useLayoutEffect(() => {
    function updateGlider() {
      const activeTab = tabRefs.current[activeKey]
      if (!activeTab) return
      setGlider({ x: activeTab.offsetLeft, width: activeTab.offsetWidth })
    }

    updateGlider()

    const observer =
      typeof ResizeObserver === "undefined" || !rowRef.current ? null : new ResizeObserver(() => updateGlider())
    if (rowRef.current) observer?.observe(rowRef.current)
    window.addEventListener("resize", updateGlider)

    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", updateGlider)
    }
  }, [activeKey])

  return (
    <div ref={rowRef} className="feed_segment_row" aria-label={ariaLabel}>
      <motion.span
        className="feed_segment_glider"
        animate={glider}
        initial={false}
        transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
        aria-hidden="true"
      />
      {items.map((item) => (
        <button
          key={item.key}
          ref={(node) => {
            tabRefs.current[item.key] = node
          }}
          type="button"
          className={activeKey === item.key ? "is_active" : ""}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function FeedWriteRow({
  ariaLabel,
  onClickReview,
  onClickFree,
}: {
  ariaLabel: string
  onClickReview?: () => void
  onClickFree?: () => void
}) {
  const hasSplit = Boolean(onClickReview) && Boolean(onClickFree)

  return (
    <div className="feed_write_row" aria-label={ariaLabel}>
      {hasSplit ? (
        <div className="feed_write_split">
          <button type="button" className="feed_write_button" onClick={onClickReview}>
            <img className="feed_write_icon" src={iconPencil} alt="" aria-hidden="true" />
            <span className="feed_write_label">페어링 후기 글쓰기</span>
          </button>
          <button type="button" className="feed_write_button" onClick={onClickFree}>
            <img className="feed_write_icon" src={iconPencil} alt="" aria-hidden="true" />
            <span className="feed_write_label">질문 글쓰기</span>
          </button>
        </div>
      ) : (
        <button type="button" className="feed_write_button" onClick={onClickReview ?? onClickFree}>
          <img className="feed_write_icon" src={iconPencil} alt="" aria-hidden="true" />
          <span className="feed_write_label">{onClickFree && !onClickReview ? "질문 글쓰기" : "페어링 후기 글쓰기"}</span>
        </button>
      )}
    </div>
  )
}

type SummaryStat = {
  value: string
  label: string
}

function ProfileSummaryCard({
  avatarSrc,
  title,
  accentText,
  description,
  stats,
  menuAriaLabel,
  menuIconSrc,
  onMenuClick,
  onClick,
}: {
  avatarSrc?: string
  title: string
  accentText?: string
  description?: string
  stats: SummaryStat[]
  menuAriaLabel?: string
  menuIconSrc?: string
  onMenuClick?: () => void
  onClick?: () => void
}) {
  const clickableProps =
    typeof onClick === "function"
      ? {
          role: "button" as const,
          tabIndex: 0,
          onClick,
          onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              onClick()
            }
          },
        }
      : {}

  return (
    <article className={`community_follow_me_card${onClick ? " is_clickable" : ""}`} {...clickableProps}>
      <div className="community_follow_me_avatar" aria-hidden="true">
        {avatarSrc ? <img className="community_follow_me_avatar_image" src={avatarSrc} alt="" aria-hidden="true" /> : null}
      </div>
      <div className="community_follow_me_body">
        <div className="community_follow_me_top">
          <div className="community_follow_me_identity">
            <strong className="community_follow_me_name">{title}</strong>
            {accentText ? <span className="community_follow_me_grade">{accentText}</span> : null}
          </div>
          {menuAriaLabel && menuIconSrc && onMenuClick ? (
            <button
              type="button"
              className="community_follow_me_menu_button"
              aria-label={menuAriaLabel}
              onClick={(event) => {
                event.stopPropagation()
                onMenuClick()
              }}
            >
              <img className="community_follow_me_menu_icon" src={menuIconSrc} alt="" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {description ? <p className="community_follow_me_description">{description}</p> : null}
        <div className="community_follow_me_stats" aria-label="요약 정보">
          {stats.map((stat) => (
            <div className="community_follow_me_stat" key={`${stat.label}-${stat.value}`}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function Community() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { metaLine: myHeaderProfile, nickname: myNickname } = useMyOnboardingMeta()
  const {
    COMMUNITY_FOLLOWED_USERS_KEY,
    COMMUNITY_LIKED_POSTS_KEY,
    COMMUNITY_SEARCH_RECENT_KEY,
    MAX_RECENT_TERMS,
    feedFilterItems,
    reviewSortItems,
    bookmarkLists,
    popupCategoryByDrinkType,
    popupFeaturesByDrinkType,
    defaultFollowedUserIdsMock,
  } = communityPageData

  const filterParam = searchParams.get("filter")
  const stateFilterRaw = (location.state as { initialFilter?: string } | null)?.initialFilter
  const stateFilter = stateFilterRaw === "free" || stateFilterRaw === "review" || stateFilterRaw === "follow" ? stateFilterRaw : null
  const initialFilter =
    filterParam === "free" || filterParam === "review" || filterParam === "follow" ? filterParam : stateFilter

  const [feedFilter, setFeedFilter] = useState<FeedFilter>(initialFilter ?? "review")
  const isQuestionFeed = feedFilter === "free"
  const { value: followedUserIds, toggle: toggleFollowUser } = useStoredNumberSet(
    COMMUNITY_FOLLOWED_USERS_KEY,
    defaultFollowedUserIdsMock,
  )
  const followingCount = useMemo(() => getFollowingCount(followedUserIds), [followedUserIds])
  const { value: likedById, toggle: toggleLike } = useStoredBooleanRecordFromIds(COMMUNITY_LIKED_POSTS_KEY)
  const { value: bookmarkListById, setValue: setBookmarkListById } = useStoredNullableStringRecord(
    COMMUNITY_BOOKMARK_LIST_BY_POST_KEY,
  )
  const { value: recentSearchTerms, setValue: setRecentSearchTerms } = useStoredStringArray(
    COMMUNITY_SEARCH_RECENT_KEY,
    MAX_RECENT_TERMS,
  )

  const [pendingDeletePostId, setPendingDeletePostId] = useState<number | null>(null)
  const [pendingUnfollowUser, setPendingUnfollowUser] = useState<{ userId: number; name: string } | null>(null)
  const [ownerPostAction, setOwnerPostAction] = useState<FeedPost | null>(null)
  const [bookmarkPicker, setBookmarkPicker] = useState<{ postId: number; selectedListId: string } | null>(null)
  const [isFeedFilterPopupOpen, setIsFeedFilterPopupOpen] = useState(false)
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set())
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(() => new Set())
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(() => new Set())
  const [selectedSituations, setSelectedSituations] = useState<Set<string>>(() => new Set())
  const [feedSearchValue, setFeedSearchValue] = useState("")
  const [isFeedSearchConfirmed, setIsFeedSearchConfirmed] = useState(false)
  const [reviewSort, setReviewSort] = useState<ReviewSortKey>("latest")
  const [isReviewSortSheetOpen, setIsReviewSortSheetOpen] = useState(false)
  const [entryToastMessage, setEntryToastMessage] = useState<string | null>(null)
  const feedSearchInputRef = useRef<HTMLInputElement | null>(null)
  const [expandedChipGroups, setExpandedChipGroups] = useState<Set<string>>(() => new Set())
  const [collapsibleChipGroups, setCollapsibleChipGroups] = useState<Set<string>>(() => new Set())
  const chipGroupRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const myUserId = currentUserMock.id
  const myTierLabel = getPairingTierLabelByUserId(myUserId)
  const myAvatarSrc = resolveMyUserAvatar()
  const [isProfileEditPreparingOpen, setIsProfileEditPreparingOpen] = useState(false)
  const { commentCountByPostId, persistUserPosts, userPostIdSet, userPosts } = useCommunityStoredPosts(feedPosts)

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("ui:chat-fab-visibility", { detail: { hidden: true } }))
    return () => {
      window.dispatchEvent(new CustomEvent("ui:chat-fab-visibility", { detail: { hidden: false } }))
    }
  }, [])

  useEffect(() => {
    const state = (location.state ?? {}) as { writeSuccessToast?: string; initialFilter?: string }
    const toastMessage = state.writeSuccessToast?.trim()
    if (!toastMessage) return

    setEntryToastMessage(toastMessage)
    const timer = window.setTimeout(() => setEntryToastMessage(null), 5000)

    const { writeSuccessToast: _dropToast, ...restState } = state
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: Object.keys(restState).length ? restState : null,
    })

    return () => window.clearTimeout(timer)
  }, [location.hash, location.pathname, location.search, location.state, navigate])

  const deleteUserPost = useCallback(
    (postId: number) => {
      if (!userPostIdSet.has(postId)) return
      setPendingDeletePostId(postId)
    },
    [userPostIdSet],
  )

  const requestToggleFollowUser = useCallback(
    (userId: number, authorName: string) => {
      if (followedUserIds.has(userId)) {
        setPendingUnfollowUser({ userId, name: authorName })
        return
      }
      toggleFollowUser(userId)
    },
    [followedUserIds, toggleFollowUser],
  )

  const openOwnPostEditor = useCallback(
    (post: FeedPost) => {
      const mode = post.isQna ? "free" : "review"
      navigate(`/community/write?mode=${mode}&editId=${post.id}`, {
        state: { editPost: post },
      })
    },
    [navigate],
  )

  const { availableFeatures, popupChipGroups } = useMemo(
    () =>
      buildPopupChipGroups({
        popupCategoryByDrinkType,
        popupFeaturesByDrinkType,
        selectedDrinkType,
        selectedCategories,
      }),
    [popupCategoryByDrinkType, popupFeaturesByDrinkType, selectedCategories, selectedDrinkType],
  )

  const effectiveSelectedFeatures = useMemo(
    () => getEffectiveSelectedFeatures(selectedFeatures, availableFeatures),
    [availableFeatures, selectedFeatures],
  )

  const searchAllChipGroups = useMemo(
    () => buildSearchAllChipGroups(popupCategoryByDrinkType, popupFeaturesByDrinkType),
    [popupCategoryByDrinkType, popupFeaturesByDrinkType],
  )

  const filteredPopupChipGroups = useMemo(
    () =>
      filterPopupChipGroups({
        feedPosts,
        popupChipGroups,
        searchAllChipGroups,
        query: feedSearchValue,
        isSearchConfirmed: isFeedSearchConfirmed,
      }),
    [feedSearchValue, isFeedSearchConfirmed, popupChipGroups, searchAllChipGroups],
  )

  const isPopupSearchNoResults =
    !isQuestionFeed && isFeedSearchConfirmed && Boolean(feedSearchValue.trim()) && filteredPopupChipGroups.length === 0

  const communityFeedFilters = useMemo(
    () => ({
      query: feedSearchValue,
      isSearchConfirmed: isFeedSearchConfirmed,
      selectedDrinkType: isQuestionFeed ? null : selectedDrinkType,
      selectedCategories: isQuestionFeed ? EMPTY_FILTER_SET : selectedCategories,
      selectedFeatures: isQuestionFeed ? EMPTY_FILTER_SET : effectiveSelectedFeatures,
      selectedFoods: isQuestionFeed ? EMPTY_FILTER_SET : selectedFoods,
      selectedSituations: isQuestionFeed ? EMPTY_FILTER_SET : selectedSituations,
    }),
    [
      effectiveSelectedFeatures,
      feedSearchValue,
      isQuestionFeed,
      isFeedSearchConfirmed,
      selectedCategories,
      selectedDrinkType,
      selectedFoods,
      selectedSituations,
    ],
  )

  const isCommunitySearchActive = isCommunityFeedSearchActive(communityFeedFilters)

  const posts = useMemo(() => {
    return getCommunityFeedPosts({
      feedPosts,
      userPosts,
      feedFilter,
      followedUserIds,
      myUserId,
      reviewSort,
    })
  }, [feedFilter, followedUserIds, myUserId, reviewSort, userPosts])

  const filteredPosts = useMemo(() => {
    return filterCommunityFeedPosts({ posts, filters: communityFeedFilters })
  }, [communityFeedFilters, posts])

  const preloadUrls = useMemo(() => {
    const urls: Array<string | undefined> = [askQuestionBanner, emptyMascotImage, myAvatarSrc]
    const visiblePosts = filteredPosts.slice(0, 12)

    visiblePosts.forEach((post) => {
      const firstPhotoId = post.photoIds?.[0]?.trim() ?? ""
      if (!firstPhotoId) return

      if (feedFilter === "free") {
        if (firstPhotoId.startsWith("data:") || firstPhotoId.startsWith("blob:")) return
        urls.push(resolveQuestionImage(firstPhotoId))
        return
      }

      urls.push(resolveReviewImage(firstPhotoId) ?? firstPhotoId)
    })

    return Array.from(new Set(urls.filter((value): value is string => Boolean(value))))
  }, [feedFilter, filteredPosts, myAvatarSrc])

  usePreloadImages(preloadUrls, { decode: true })

  const isFeedNoResults = isCommunitySearchActive && filteredPosts.length === 0

  useLayoutEffect(() => {
    if (!isFeedFilterPopupOpen || isQuestionFeed) {
      setCollapsibleChipGroups(new Set())
      setExpandedChipGroups(new Set())
      return
    }

    const next = new Set<string>()
    filteredPopupChipGroups.forEach((group) => {
      const container = chipGroupRefs.current.get(group.title)
      if (!container) return
      const chips = Array.from(container.querySelectorAll<HTMLElement>(".feed_filter_chip"))
      if (chips.length === 0) return
      const lineCount = new Set(chips.map((chip) => chip.offsetTop)).size
      if (lineCount > 3) next.add(group.title)
    })
    setCollapsibleChipGroups(next)
    setExpandedChipGroups((prev) => new Set(Array.from(prev).filter((title) => next.has(title))))
  }, [filteredPopupChipGroups, isFeedFilterPopupOpen, isQuestionFeed])

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

  const getLikeCount = (post: FeedPost) => (getWeeklyAllRankingVotesById(post.id) ?? post.likeCount) + (likedById[post.id] ? 1 : 0)
  const getCommentCount = (post: FeedPost) => commentCountByPostId[post.id] ?? post.commentCount

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
    navigate(`/community/pairing/${postId}#comments`, {
      state: getPairingCommentNavigationState(post),
    })
  }

  const toggleDrinkType = (nextDrinkType: string) => {
    setSelectedDrinkType((prev) => (prev === nextDrinkType ? null : nextDrinkType))
    setSelectedCategories(new Set())
    setSelectedFeatures(new Set())
    setIsFeedSearchConfirmed(true)
  }

  const resetFilters = () => {
    setSelectedDrinkType(null)
    setSelectedCategories(new Set())
    setSelectedFeatures(new Set())
    setSelectedFoods(new Set())
    setSelectedSituations(new Set())
    setIsFeedSearchConfirmed(Boolean(feedSearchValue.trim()))
  }

  const resetFeedSearchState = () => {
    setFeedSearchValue("")
    setSelectedDrinkType(null)
    setSelectedCategories(new Set())
    setSelectedFeatures(new Set())
    setSelectedFoods(new Set())
    setSelectedSituations(new Set())
    setIsFeedSearchConfirmed(false)
  }

  const toggleCategory = (chip: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) next.delete(chip)
      else next.add(chip)
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const toggleFeature = (chip: string) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) next.delete(chip)
      else next.add(chip)
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const toggleFood = (chip: string) => {
    setSelectedFoods((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) next.delete(chip)
      else next.add(chip)
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const toggleSituation = (chip: string) => {
    setSelectedSituations((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) next.delete(chip)
      else next.add(chip)
      return next
    })
    setIsFeedSearchConfirmed(true)
  }

  const setChipGroupRef = useCallback(
    (title: string) => (element: HTMLDivElement | null) => {
      chipGroupRefs.current.set(title, element)
    },
    [],
  )

  const toggleChipGroupExpanded = (title: string) => {
    setExpandedChipGroups((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  const openFeedFilterPopup = () => {
    setIsFeedSearchConfirmed(false)
    setIsFeedFilterPopupOpen(true)
    window.setTimeout(() => feedSearchInputRef.current?.focus(), 0)
  }

  const confirmFeedSearch = (term?: string) => {
    const query = (term ?? feedSearchValue).trim()
    if (!query) return

    setFeedSearchValue(query)
    setIsFeedSearchConfirmed(true)
    setRecentSearchTerms((prev) => {
      const normalized = query.toLowerCase()
      const next = [query, ...prev.filter((item) => item.toLowerCase() !== normalized)]
      return next.slice(0, MAX_RECENT_TERMS)
    })
    feedSearchInputRef.current?.blur()
  }

  const confirmFeedSearchAndCloseIfQuestion = (term?: string) => {
    const query = (term ?? feedSearchValue).trim()
    if (!query) return

    confirmFeedSearch(term)
    if (isQuestionFeed) {
      setIsFeedFilterPopupOpen(false)
    }
  }

  const changeFeedFilter = (nextFilter: FeedFilter) => {
    setFeedFilter(nextFilter)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    if (initialFilter) {
      window.scrollTo(0, 0)
    }
  }, [initialFilter])

  const reviewSortLabel = reviewSortItems.find((item) => item.key === reviewSort)?.label ?? "최신순"

  useEffect(() => {
    if (!isReviewSortSheetOpen) return

    const body = document.body
    const html = document.documentElement
    const viewport = document.querySelector(".app_viewport")

    const prevBody = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      touchAction: (body.style as any).touchAction as string,
    }

    const prevHtml = {
      overflow: html.style.overflow,
      overscrollBehavior: (html.style as any).overscrollBehavior as string,
    }

    const prevViewportOverflow = viewport instanceof HTMLElement ? viewport.style.overflow : ""
    const scrollY = window.scrollY

    html.style.overflow = "hidden"
    ;(html.style as any).overscrollBehavior = "none"

    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.left = "0"
    body.style.right = "0"
    body.style.width = "100%"
    body.style.overflow = "hidden"
    ;(body.style as any).touchAction = "none"

    if (viewport instanceof HTMLElement) viewport.style.overflow = "hidden"

    return () => {
      html.style.overflow = prevHtml.overflow
      ;(html.style as any).overscrollBehavior = prevHtml.overscrollBehavior

      body.style.position = prevBody.position
      body.style.top = prevBody.top
      body.style.left = prevBody.left
      body.style.right = prevBody.right
      body.style.width = prevBody.width
      body.style.overflow = prevBody.overflow
      ;(body.style as any).touchAction = prevBody.touchAction

      if (viewport instanceof HTMLElement) viewport.style.overflow = prevViewportOverflow
      window.scrollTo(0, scrollY)
    }
  }, [isReviewSortSheetOpen])

  return (
    <section className="community_page page_screen" aria-label="커뮤니티">
      <CommunityHeader
        title="커뮤니티"
        topTab="feed"
        openFilterAriaLabel="커뮤니티 검색 필터 열기"
        onOpenFilter={openFeedFilterPopup}
        onOpenNotifications={() => {}}
      />

      <SearchFilterModal
        isOpen={isFeedFilterPopupOpen}
        ariaLabel="커뮤니티 검색 필터"
        onClose={() => setIsFeedFilterPopupOpen(false)}
      >
        <CommunityFilterPanel
          searchValue={feedSearchValue}
          inputRef={feedSearchInputRef}
          onChangeSearchValue={(nextValue) => {
            setFeedSearchValue(nextValue)
            setIsFeedSearchConfirmed(Boolean(nextValue.trim()))
          }}
          onConfirmSearch={confirmFeedSearchAndCloseIfQuestion}
          onClearSearch={() => {
            setFeedSearchValue("")
            setIsFeedSearchConfirmed(false)
          }}
          onClose={() => setIsFeedFilterPopupOpen(false)}
          isNoResults={isPopupSearchNoResults}
          chipGroups={isQuestionFeed ? [] : filteredPopupChipGroups}
          collapsibleGroupTitles={collapsibleChipGroups}
          expandedGroupTitles={expandedChipGroups}
          setGroupRef={setChipGroupRef}
          onToggleGroupExpanded={toggleChipGroupExpanded}
          selectedDrinkType={selectedDrinkType}
          selectedCategories={selectedCategories}
          selectedFeatures={effectiveSelectedFeatures}
          selectedFoods={selectedFoods}
          selectedSituations={selectedSituations}
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
              return
            }
            if (groupTitle === "상황") {
              toggleSituation(chip)
            }
          }}
          recentSearchTerms={isQuestionFeed ? [] : recentSearchTerms}
          onSelectRecentSearch={(term) => confirmFeedSearch(term)}
          onDeleteRecentSearch={(term) => {
            setRecentSearchTerms((prev) => prev.filter((item) => item !== term))
          }}
          onResetSearch={() => {
            setFeedSearchValue("")
            setIsFeedSearchConfirmed(false)
            resetFilters()
          }}
          onReset={resetFilters}
          hideFooter={isQuestionFeed}
          onApply={() => {
            if (feedSearchValue.trim()) {
              confirmFeedSearch(feedSearchValue)
            } else {
              setIsFeedSearchConfirmed(true)
            }
            setIsFeedFilterPopupOpen(false)
          }}
        />
      </SearchFilterModal>

      <div className="community_feed_control_row" data-guide-id="community-feed-controls">
        <FeedSegmentTabs
          ariaLabel="커뮤니티 피드 필터"
          items={feedFilterItems}
          activeKey={feedFilter}
          onChange={(key) => changeFeedFilter(key as FeedFilter)}
        />
        <button
          type="button"
          className="community_review_sort_button"
          onClick={() => setIsReviewSortSheetOpen(true)}
        >
          {reviewSortLabel}
        </button>
      </div>

      {feedFilter === "review" ? (
        <FeedWriteRow ariaLabel="페어링 후기 글쓰기" onClickReview={() => navigate("/community/write?mode=review")} />
      ) : null}

      {feedFilter === "free" ? (
        <FeedWriteRow ariaLabel="질문 글쓰기" onClickFree={() => navigate("/community/write?mode=free")} />
      ) : null}

      {feedFilter === "free" ? (
        <div className="question_banner_link" role="img" aria-label="질문 작성 배너">
          <img className="question_banner_image" src={askQuestionBanner} alt="" aria-hidden="true" />
          <div className="question_banner_copy" aria-hidden="true">
            <p className="question_banner_title">{QUESTION_BANNER_COPY.title}</p>
            <p className="question_banner_subtitle">{QUESTION_BANNER_COPY.subtitle}</p>
          </div>
        </div>
      ) : null}

      {feedFilter === "follow" ? (
        <section className="community_follow_me_section" aria-label="내 팔로우 요약">
          <ProfileSummaryCard
            avatarSrc={myAvatarSrc}
            title={myNickname}
            accentText={myTierLabel}
            stats={[
              { value: myPageProfileSummary.followerCount.toLocaleString("ko-KR"), label: "팔로워" },
              { value: followingCount.toLocaleString("ko-KR"), label: "팔로잉" },
            ]}
            menuAriaLabel="프로필 수정"
            menuIconSrc={iconDots}
            onMenuClick={() => setIsProfileEditPreparingOpen(true)}
          />
        </section>
      ) : null}

      {isProfileEditPreparingOpen ? (
        <AlertModal
          title={"아직 준비 중인 서비스입니다.\n곧 만나보실 수 있어요!"}
          confirmLabel="닫기"
          variant="preparing"
          onConfirm={() => setIsProfileEditPreparingOpen(false)}
        />
      ) : null}

      <div className={feedFilter === "free" ? "question_list" : "feed_cards"} aria-label="커뮤니티 피드 목록">
        {isFeedNoResults ? (
          <section className="search_no_results" role="status" aria-label="검색 결과 없음">
            <p className="search_no_results_title">검색 결과를 찾을 수 없어요.</p>
            <img className="search_no_results_mascot" src={emptyMascotImage} alt="" aria-hidden="true" />
            <button type="button" className="search_no_results_reset" onClick={resetFeedSearchState}>
              <span>검색 초기화하기</span>
              <img src={iconResetWhite} alt="" aria-hidden="true" />
            </button>
          </section>
        ) : null}

        {feedFilter === "free"
          ? filteredPosts.map((post) => {
              const isMyPost = post.authorId === myUserId || userPostIdSet.has(post.id)
              const authorName = isMyPost ? myNickname : post.authorName?.trim() || usersMockById[post.authorId]?.name || "익명"
              const authorMeta = isMyPost ? myHeaderProfile : usersMockById[post.authorId]?.profile ?? ""

              return (
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
                    body: post.body,
                    pairingSummary: post.pairingSummary ?? "",
                    authorId: post.authorId,
                    authorName,
                    profile: authorMeta,
                    locationLabel: post.locationLabel?.trim() ?? "",
                    drinkType: post.drinkType ?? "",
                    features: post.features ?? [],
                    source: "feed",
                    feedFilter: "free",
                  }}
                  photoIds={post.photoIds}
                  thumbVariant={resolveQuestionThumbVariant(post)}
                />
              )
            })
          : filteredPosts.map((post) => {
              const isMyPost = post.authorId === myUserId || userPostIdSet.has(post.id)
              const authorName = isMyPost ? myNickname : post.authorName?.trim() || usersMockById[post.authorId]?.name || "익명"
              const authorMeta = isMyPost ? myHeaderProfile : usersMockById[post.authorId]?.profile ?? ""
              const pairingTitle = extractPairingTitle(post.title)
              const tagBundle = deriveCommunityTagBundle({
                pairingTitle,
                title: post.title,
                drinkType: post.drinkType ?? post.categories?.[0] ?? "",
                foods: post.foods,
                features: post.features,
              })

              return (
                <CommunityReviewCard
                  key={post.id}
                  postId={post.id}
                  authorId={post.authorId}
                  authorName={authorName}
                  authorMeta={authorMeta}
                  badgeClassName={getTierClassName(getPairingTierByUserId(post.authorId), "feed_post_badge")}
                  badgeText={getPairingTierLabelByUserId(post.authorId)}
                  isAuthor={isMyPost}
                  menuAriaLabel={userPostIdSet.has(post.id) ? "게시글 설정" : undefined}
                  onOpenMenu={userPostIdSet.has(post.id) ? () => setOwnerPostAction(post) : undefined}
                  followButtonClassName={
                    followedUserIds.has(post.authorId) ? "follow_toggle_button is_following" : "follow_toggle_button"
                  }
                  followAriaLabel={followedUserIds.has(post.authorId) ? "언팔로우" : "팔로우"}
                  followText={followedUserIds.has(post.authorId) ? "언팔로우" : "팔로우"}
                  onToggleFollow={() => requestToggleFollowUser(post.authorId, authorName)}
                  linkTo={`/community/pairing/${post.id}`}
                  linkState={{
                    pairingTitle,
                    body: post.body,
                    pairingSummary: post.pairingSummary ?? "",
                    authorId: post.authorId,
                    authorName,
                    profile: authorMeta,
                    locationLabel: post.locationLabel?.trim() ?? "",
                    drinkType: post.drinkType ?? post.categories?.[0] ?? "",
                    features: tagBundle.featureTags,
                    source: "feed",
                    feedFilter: feedFilter,
                  }}
                  title={post.pairingSummary ?? post.title}
                  pairingTitle={pairingTitle}
                  body={post.body}
                  liquorTag={tagBundle.liquorTag}
                  foodTag={tagBundle.foodTag}
                  photoIds={post.photoIds}
                  hashtags={post.searchTags}
                  locationLabel={post.locationLabel?.trim() ?? ""}
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

      {bookmarkPicker ? (
        <CommunityBookmarkPickerModal
          ariaLabel="북마크 리스트 선택"
          titleText={bookmarkListById[bookmarkPicker.postId] ? "저장한 게시글을 취소할까요?" : "게시글을 저장할까요?"}
          helperText={
            bookmarkListById[bookmarkPicker.postId]
              ? <>취소하면 내 정보 &gt; 저장한 리스트에서<br />이 게시글이 사라져요.</>
              : <>저장한 게시글은 내 정보 &gt; 저장한 리스트에서<br />확인할 수 있어요.</>
          }
          secondaryLabel="취소"
          primaryLabel={bookmarkListById[bookmarkPicker.postId] ? "저장 취소하기" : "저장하기"}
          onDismiss={cancelBookmark}
          onSecondary={cancelBookmark}
          onPrimary={bookmarkListById[bookmarkPicker.postId] ? removeBookmark : confirmBookmark}
        />
      ) : null}

      {pendingDeletePostId !== null ? (
        <PurchaseConfirmModal
          ariaLabel="게시글 삭제 확인"
          message="이 글을 삭제할까요?"
          cancelLabel="취소"
          confirmLabel="삭제"
          onCancel={() => setPendingDeletePostId(null)}
          onConfirm={() => {
            const postId = pendingDeletePostId
            setPendingDeletePostId(null)
            persistUserPosts(userPosts.filter((post) => post.id !== postId))
            setBookmarkListById((prev) => {
              if (!(postId in prev)) return prev
              const next = { ...prev }
              delete next[postId]
              return next
            })
          }}
        />
      ) : null}

      {ownerPostAction ? (
        <PostOwnerActionModal
          title="게시글 설정"
          onCancel={() => setOwnerPostAction(null)}
          onEdit={() => {
            const post = ownerPostAction
            setOwnerPostAction(null)
            openOwnPostEditor(post)
          }}
          onDelete={() => {
            const postId = ownerPostAction.id
            setOwnerPostAction(null)
            deleteUserPost(postId)
          }}
        />
      ) : null}

      {isReviewSortSheetOpen ? (
        <div className="community_review_sort_overlay" role="presentation" onClick={() => setIsReviewSortSheetOpen(false)}>
          <section
            className="community_review_sort_sheet"
            aria-label="정렬"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="community_review_sort_handle" aria-hidden="true" />
            <div className="community_review_sort_options">
              {reviewSortItems.map((item) => {
                const isActive = item.key === reviewSort
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={isActive ? "community_review_sort_option is_active" : "community_review_sort_option"}
                    onClick={() => {
                      setReviewSort(item.key)
                      setIsReviewSortSheetOpen(false)
                    }}
                  >
                    <span>{item.label}</span>
                    {isActive ? <span className="community_review_sort_check" aria-hidden="true" /> : null}
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      ) : null}

      {pendingUnfollowUser ? (
        <PurchaseConfirmModal
          ariaLabel="언팔로우 확인"
          message={`${pendingUnfollowUser.name}님을 언팔로우하시겠어요?`}
          cancelLabel="취소"
          confirmLabel="언팔로우"
          onCancel={() => setPendingUnfollowUser(null)}
          onConfirm={() => {
            toggleFollowUser(pendingUnfollowUser.userId)
            setPendingUnfollowUser(null)
          }}
        />
      ) : null}

      {entryToastMessage ? (
        <div className="app_alert_toast" role="status" aria-live="polite">
          <span className="app_alert_toast_icon is_success">
            <img src={iconCheck} alt="" aria-hidden="true" />
          </span>
          <p>{entryToastMessage}</p>
          <button type="button" className="app_alert_toast_close" aria-label="닫기" onClick={() => setEntryToastMessage(null)}>
            <img src={iconX} alt="" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <ScrollTopButton />
    </section>
  )
}
