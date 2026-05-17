import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { AnimatePresence, motion } from "motion/react"

import iconAlcohol from "../assets/svg/wine.svg"
import iconAlcoholActive from "../assets/svg/wine_p.svg"
import iconPairing from "../assets/svg/forkknife.svg"
import iconPairingActive from "../assets/svg/forkknife_p.svg"
import iconQuestion from "../assets/svg/chatcircledots.svg"
import iconQuestionActive from "../assets/svg/chatcircledots_p.svg"
import iconCheers from "../assets/svg/beerstein_p.svg"
import iconChat from "../assets/svg/chatcircledots_p.svg"
import iconShare from "../assets/svg/sharenetwork_p.svg"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconWarning from "../assets/svg/worning_r.svg"

import QuestionPostRow from "../components/QuestionPostRow"
import {
  extractPairingTitle,
  feedPosts,
  getPairingSummaryText,
  resolveQuestionThumbVariant,
  type FeedPost,
} from "../utils/communityPosts"
import { COMMUNITY_USER_POSTS_KEY } from "../utils/communityStorage"
import { readStoredCommunityUserPosts } from "../utils/communityFeed"
import { resolveReviewImage } from "../utils/reviewImages"
import { isAlcoholReviewPost, isMyWrittenPost, isPairingReviewPost } from "../utils/myWrittenPosts"
import { sakeProductsMock } from "../data/sakeProductsMock"
import { sojuProductsMock } from "../data/sojuProductsMock"
import { wineProductsMock } from "../data/wineProductsMock"
import { beerProductsMock } from "../data/beerProductsMock"
import { whiskeyProductsMock } from "../data/whiskeyProductsMock"
import { spiritsProductsMock } from "../data/spiritsProductsMock"
import { traditionalProductsMock } from "../data/traditionalProductsMock"
import { etcProductsMock } from "../data/etcProductsMock"
import "../styles/my.css"

type RecordTab = "alcohol" | "pairing" | "question"

const parseTab = (value: string | null): RecordTab => {
  if (value === "pairing" || value === "question" || value === "alcohol") return value
  return "alcohol"
}

const toHashTag = (value: string) => `#${value.replace(/\s+/g, "")}`

type CatalogProductSummary = {
  id: string
  categoryId: string
  subcategory: string
  name: string
}

const catalogProducts: CatalogProductSummary[] = [
  ...sakeProductsMock,
  ...sojuProductsMock,
  ...wineProductsMock,
  ...beerProductsMock,
  ...whiskeyProductsMock,
  ...spiritsProductsMock,
  ...traditionalProductsMock,
  ...etcProductsMock,
]

const normalizeProductName = (value: string | undefined) => (value ?? "").replace(/\s+/g, "").toLowerCase()

const findCatalogProduct = (post: FeedPost) => {
  if (post.productId) {
    const byId = catalogProducts.find((product) => product.id === post.productId)
    if (byId) return byId
  }

  const normalizedDrinkName = normalizeProductName(post.drinkName)
  if (!normalizedDrinkName) return null

  return (
    catalogProducts.find((product) => normalizeProductName(product.name) === normalizedDrinkName) ??
    catalogProducts.find((product) => normalizeProductName(product.name).includes(normalizedDrinkName))
  )
}

const getAlcoholRecordCategoryLine = (post: FeedPost) => {
  const product = findCatalogProduct(post)
  return product?.name ?? post.drinkName?.trim() ?? post.title
}

const getRecordCardTitle = (post: FeedPost, tab: RecordTab) => {
  if (tab === "pairing") return extractPairingTitle(post.title)
  if (tab === "alcohol") return getAlcoholRecordCategoryLine(post)
  return post.title
}

const getRecordCardDescription = (post: FeedPost, tab: RecordTab) => {
  if (tab === "alcohol") return post.title
  return post.body?.trim() || getPairingSummaryText(post)
}

const getRecordCardLink = (post: FeedPost, tab: RecordTab) => {
  if (tab === "alcohol" && post.productId) return `/product/${post.productId}/review/user-review-${post.id}`
  return `/community/pairing/${post.id}`
}

function RecordReviewCard({ post, tab, onShare }: { post: FeedPost; tab: RecordTab; onShare: () => void }) {
  const title = getRecordCardTitle(post, tab)
  const desc = getRecordCardDescription(post, tab)
  const thumbSrc = post.photoIds?.[0] ? resolveReviewImage(post.photoIds[0]) : undefined
  const tags = (post.searchTags ?? [])
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .slice(0, 3)
    .map((value) => toHashTag(value.trim()))

  return (
    <article className="my_record_card">
      <Link className="my_record_card_link" to={getRecordCardLink(post, tab)} state={{ bottomNavActive: "category" }}>
        <div className="my_record_thumb" aria-hidden="true">
          {thumbSrc ? <img className="my_record_thumb_img" src={thumbSrc} alt="" aria-hidden="true" /> : null}
        </div>
        <div className="my_record_body">
          <strong className="my_record_title">{title}</strong>
          <p className="my_record_desc">{desc}</p>
          <div className="my_record_tags" aria-label="태그">
            {tags.map((tag) => (
              <span className="my_record_tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className="my_record_meta" aria-label="반응">
            <span className="my_record_meta_item">
              <img src={iconCheers} alt="" aria-hidden="true" />
              <span>{post.likeCount.toLocaleString("ko-KR")}</span>
            </span>
            <span className="my_record_meta_item">
              <img src={iconChat} alt="" aria-hidden="true" />
              <span>{post.commentCount.toLocaleString("ko-KR")}</span>
            </span>
            <span className="my_record_meta_spacer" aria-hidden="true" />
            <button
              type="button"
              className="my_record_share_button"
              aria-label="공유"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onShare()
              }}
            >
              <img className="my_record_share" src={iconShare} alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default function MyRecord() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = parseTab(searchParams.get("tab"))
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [userPosts, setUserPosts] = useState<FeedPost[]>([])
  const recordTabsRef = useRef<HTMLDivElement | null>(null)
  const recordTabRefs = useRef<Record<RecordTab, HTMLButtonElement | null>>({ alcohol: null, pairing: null, question: null })
  const [recordTabsGlider, setRecordTabsGlider] = useState({ x: 0, width: 0 })

  useEffect(() => {
    if (!alertMessage) return
    const timerId = window.setTimeout(() => setAlertMessage(null), 1800)
    return () => window.clearTimeout(timerId)
  }, [alertMessage])

  useEffect(() => {
    const readPosts = () => setUserPosts(readStoredCommunityUserPosts(COMMUNITY_USER_POSTS_KEY))

    readPosts()
    window.addEventListener("community:user-posts-updated", readPosts)
    return () => window.removeEventListener("community:user-posts-updated", readPosts)
  }, [])

  const myPosts = useMemo(() => {
    const combined = [...userPosts, ...feedPosts]
    const byId = new Map<number, FeedPost>()
    combined.forEach((post) => {
      if (typeof post.id === "number" && Number.isFinite(post.id) && !byId.has(post.id)) {
        byId.set(post.id, post)
      }
    })

    return Array.from(byId.values())
      .filter(isMyWrittenPost)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  }, [userPosts])

  const visiblePosts = useMemo(() => {
    if (tab === "question") return myPosts.filter((post) => Boolean(post.isQna))
    if (tab === "pairing") return myPosts.filter(isPairingReviewPost)
    return myPosts.filter(isAlcoholReviewPost)
  }, [myPosts, tab])

  const setTab = (nextTab: RecordTab) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("tab", nextTab)
      return next
    })

  useLayoutEffect(() => {
    function updateRecordTabsGlider() {
      const activeTab = recordTabRefs.current[tab]
      if (!activeTab) return
      setRecordTabsGlider({
        x: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      })
    }

    updateRecordTabsGlider()

    const observer =
      typeof ResizeObserver === "undefined" || !recordTabsRef.current
        ? null
        : new ResizeObserver(() => updateRecordTabsGlider())

    if (recordTabsRef.current) observer?.observe(recordTabsRef.current)
    window.addEventListener("resize", updateRecordTabsGlider)

    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", updateRecordTabsGlider)
    }
  }, [tab])

  return (
    <section className="my_record_page" aria-label="기록">
      {alertMessage ? (
        <div className="app_alert_toast" role="status" aria-live="polite">
          <span className="app_alert_toast_icon is_warning">
            <img src={iconWarning} alt="" aria-hidden="true" />
          </span>
          <p>{alertMessage}</p>
        </div>
      ) : null}
      <header className="my_record_header" aria-label="기록 헤더">
        <button type="button" className="my_record_back" aria-label="뒤로가기" onClick={() => navigate("/my")}>
          <img src={iconCaretLeft} alt="" aria-hidden="true" />
        </button>
      </header>

      <div className="my_record_tabs_shell" aria-label="기록 탭">
        <div ref={recordTabsRef} className="my_record_tabs">
          <motion.span
            className="my_record_tabs_glider"
            animate={recordTabsGlider}
            initial={false}
            transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
            aria-hidden="true"
          />
          <button
            type="button"
            className={tab === "alcohol" ? "my_record_tab is_active" : "my_record_tab"}
            onClick={() => setTab("alcohol")}
            ref={(node) => {
              recordTabRefs.current.alcohol = node
            }}
          >
            <img src={tab === "alcohol" ? iconAlcoholActive : iconAlcohol} alt="" aria-hidden="true" />
            <span>주류 후기</span>
          </button>
          <span className="my_record_tab_line" aria-hidden="true" />
          <button
            type="button"
            className={tab === "pairing" ? "my_record_tab is_active" : "my_record_tab"}
            onClick={() => setTab("pairing")}
            ref={(node) => {
              recordTabRefs.current.pairing = node
            }}
          >
            <img src={tab === "pairing" ? iconPairingActive : iconPairing} alt="" aria-hidden="true" />
            <span>페어링 후기</span>
          </button>
          <span className="my_record_tab_line" aria-hidden="true" />
          <button
            type="button"
            className={tab === "question" ? "my_record_tab is_active" : "my_record_tab"}
            onClick={() => setTab("question")}
            ref={(node) => {
              recordTabRefs.current.question = node
            }}
          >
            <img src={tab === "question" ? iconQuestionActive : iconQuestion} alt="" aria-hidden="true" />
            <span>질문글</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {visiblePosts.length === 0 ? (
            <div className="my_record_empty" aria-label="기록 없음">
              아직 작성한 글이 없어요.
            </div>
          ) : tab === "question" ? (
            <div className="my_record_question_list" aria-label="내 질문글">
              {visiblePosts.map((post) => (
                <QuestionPostRow
                  key={post.id}
                  postId={post.id}
                  title={post.title}
                  body={post.body}
                  createdAt={post.createdAt}
                  likeCount={post.likeCount}
                  commentCount={post.commentCount}
                  likeActive={false}
                  likeAriaLabel="좋아요"
                  onToggleLike={() => {}}
                  onShare={() => setAlertMessage("현재 지원되지 않는 기능이에요.")}
                  onViewComments={() => navigate(`/community/pairing/${post.id}#comments`, { state: {} })}
                  linkTo={`/community/pairing/${post.id}`}
                  linkState={{}}
                  photoIds={post.photoIds}
                  thumbVariant={resolveQuestionThumbVariant(post)}
                />
              ))}
            </div>
          ) : (
            <div className="my_record_review_list" aria-label={tab === "alcohol" ? "내 주류 후기" : "내 페어링 후기"}>
              {visiblePosts.map((post) => (
                <RecordReviewCard
                  key={post.id}
                  post={post}
                  tab={tab}
                  onShare={() => setAlertMessage("현재 지원되지 않는 기능이에요.")}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
