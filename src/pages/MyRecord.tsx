import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { AnimatePresence, motion } from "motion/react"

import iconAlcohol from "../assets/svg/wine.svg"
import iconAlcoholActive from "../assets/svg/wine_p.svg"
import iconPairing from "../assets/svg/forkknife.svg"
import iconPairingActive from "../assets/svg/forkknife_p.svg"
import iconQuestion from "../assets/svg/chatcircledots.svg"
import iconQuestionActive from "../assets/svg/chatcircledots_p.svg"
import iconHeart from "../assets/svg/heart_p.svg"
import iconChat from "../assets/svg/chatcircledots_p.svg"
import iconShare from "../assets/svg/sharenetwork_p.svg"

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
import "../styles/my.css"

type RecordTab = "alcohol" | "pairing" | "question"

const parseTab = (value: string | null): RecordTab => {
  if (value === "pairing" || value === "question" || value === "alcohol") return value
  return "alcohol"
}

const toHashTag = (value: string) => `#${value.replace(/\s+/g, "")}`

const getRecordCardTitle = (post: FeedPost, tab: RecordTab) => {
  if (tab === "pairing") return extractPairingTitle(post.title)
  return post.drinkName?.trim() ? `${post.drinkName.trim()} 후기` : post.title
}

const getRecordCardLink = (post: FeedPost, tab: RecordTab) => {
  if (tab === "alcohol" && post.productId) return `/product/${post.productId}/review/user-review-${post.id}`
  return `/community/pairing/${post.id}`
}

function RecordReviewCard({ post, tab }: { post: FeedPost; tab: RecordTab }) {
  const title = getRecordCardTitle(post, tab)
  const desc = post.body?.trim() || getPairingSummaryText(post)
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
              <img src={iconHeart} alt="" aria-hidden="true" />
              <span>{post.likeCount.toLocaleString("ko-KR")}</span>
            </span>
            <span className="my_record_meta_item">
              <img src={iconChat} alt="" aria-hidden="true" />
              <span>{post.commentCount.toLocaleString("ko-KR")}</span>
            </span>
            <span className="my_record_meta_spacer" aria-hidden="true" />
            <img className="my_record_share" src={iconShare} alt="" aria-hidden="true" />
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
  const [userPosts, setUserPosts] = useState<FeedPost[]>([])

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

  return (
    <section className="my_record_page" aria-label="기록">
      <div className="my_record_tabs_shell" aria-label="기록 탭">
        <div className="my_record_tabs">
          <button
            type="button"
            className={tab === "alcohol" ? "my_record_tab is_active" : "my_record_tab"}
            onClick={() => setTab("alcohol")}
          >
            {tab === "alcohol" ? <motion.span className="my_record_tab_active_bg" layoutId="my_record_tab_bg" /> : null}
            <img src={tab === "alcohol" ? iconAlcoholActive : iconAlcohol} alt="" aria-hidden="true" />
            <span>주류 후기</span>
          </button>
          <span className="my_record_tab_line" aria-hidden="true" />
          <button
            type="button"
            className={tab === "pairing" ? "my_record_tab is_active" : "my_record_tab"}
            onClick={() => setTab("pairing")}
          >
            {tab === "pairing" ? <motion.span className="my_record_tab_active_bg" layoutId="my_record_tab_bg" /> : null}
            <img src={tab === "pairing" ? iconPairingActive : iconPairing} alt="" aria-hidden="true" />
            <span>페어링 후기</span>
          </button>
          <span className="my_record_tab_line" aria-hidden="true" />
          <button
            type="button"
            className={tab === "question" ? "my_record_tab is_active" : "my_record_tab"}
            onClick={() => setTab("question")}
          >
            {tab === "question" ? <motion.span className="my_record_tab_active_bg" layoutId="my_record_tab_bg" /> : null}
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
                <RecordReviewCard key={post.id} post={post} tab={tab} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
