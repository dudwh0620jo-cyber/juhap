import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import iconBookmark from "../assets/svg/bookmarksimple_p.svg"
import iconBookmarkActive from "../assets/svg/bookmarksimple_active.svg"
import iconChat from "../assets/svg/chatcircledots_p.svg"
import iconBeerstein from "../assets/svg/beerstein_p.svg"
import iconBeersteinActive from "../assets/svg/beerstein_active.svg"
import bubbleLarge from "../assets/svg/boll_l.svg"
import bubbleMedium from "../assets/svg/boll_m.svg"
import bubbleSmall from "../assets/svg/boll_s.svg"
import iconShare from "../assets/svg/sharenetwork_p.svg"

type LikeBubbleSizeKey = "l" | "m" | "s"

type LikeBubbleBlueprint = {
  id: string
  sizeKey: LikeBubbleSizeKey
  lane: number
  laneOffset?: number
  swayDirection: -1 | 1
  swayLevel?: number
  heightLevel?: number
  delayIndex: number
  durationOffset?: number
  endScale: number
}

type ResolvedLikeBubble = {
  id: string
  src: string
  size: number
  startX: number
  swayX: number
  riseY: number
  duration: number
  delay: number
  endScale: number
}

const LIKE_BUBBLE_SIZE_MAP: Record<LikeBubbleSizeKey, { src: string; size: number }> = {
  l: { src: bubbleLarge, size: 14 },
  m: { src: bubbleMedium, size: 10 },
  s: { src: bubbleSmall, size: 6 },
}

const LIKE_BUBBLE_MOTION = {
  startXStep: 8,
  baseSway: 4,
  swayStep: 2,
  baseRise: 54,
  riseStep: 28,
  delayStep: 0.06,
  baseDuration: 0.72,
  initialScale: 0.45,
  peakScale: 1,
  settleScale: 0.98,
  frameTimes: [0, 0.24, 0.7, 1] as const,
} as const

const LIKE_BUBBLE_BLUEPRINTS: LikeBubbleBlueprint[] = [
  { id: "bubble_1", sizeKey: "l", lane: -1, laneOffset: -6, swayDirection: -1, swayLevel: 1, heightLevel: 0, delayIndex: 0, durationOffset: 0, endScale: 0.82 },
  { id: "bubble_2", sizeKey: "m", lane: 1, laneOffset: 0, swayDirection: 1, swayLevel: 1, heightLevel: 2, delayIndex: 1, durationOffset: 0.12, endScale: 0.88 },
  { id: "bubble_3", sizeKey: "s", lane: -2, laneOffset: -2, swayDirection: -1, swayLevel: 0.5, heightLevel: 1, delayIndex: 2, durationOffset: -0.04, endScale: 0.78 },
  { id: "bubble_4", sizeKey: "s", lane: 2, laneOffset: -1, swayDirection: 1, swayLevel: 0.5, heightLevel: 0.25, delayIndex: 3, durationOffset: -0.02, endScale: 0.76 },
  { id: "bubble_5", sizeKey: "m", lane: 0, laneOffset: 0, swayDirection: 1, swayLevel: 0, heightLevel: 3.5, delayIndex: 4, durationOffset: 0.18, endScale: 0.84 },
]

const resolveLikeBubble = (bubble: LikeBubbleBlueprint): ResolvedLikeBubble => {
  const sizePreset = LIKE_BUBBLE_SIZE_MAP[bubble.sizeKey]
  const swayLevel = bubble.swayLevel ?? 0
  const heightLevel = bubble.heightLevel ?? 0
  const durationOffset = bubble.durationOffset ?? 0

  return {
    id: bubble.id,
    src: sizePreset.src,
    size: sizePreset.size,
    startX: bubble.lane * LIKE_BUBBLE_MOTION.startXStep + (bubble.laneOffset ?? 0),
    swayX: bubble.swayDirection * (LIKE_BUBBLE_MOTION.baseSway + swayLevel * LIKE_BUBBLE_MOTION.swayStep),
    riseY: -(LIKE_BUBBLE_MOTION.baseRise + heightLevel * LIKE_BUBBLE_MOTION.riseStep),
    duration: LIKE_BUBBLE_MOTION.baseDuration + durationOffset,
    delay: bubble.delayIndex * LIKE_BUBBLE_MOTION.delayStep,
    endScale: bubble.endScale,
  }
}

const LIKE_BUBBLES = LIKE_BUBBLE_BLUEPRINTS.map(resolveLikeBubble)

const getLikeBubbleInitial = (bubble: ResolvedLikeBubble) => ({
  x: bubble.startX,
  y: 0,
  opacity: 0,
  scale: LIKE_BUBBLE_MOTION.initialScale,
})

const getLikeBubbleAnimate = (bubble: ResolvedLikeBubble) => ({
  x: [
    bubble.startX,
    bubble.startX + bubble.swayX,
    bubble.startX - bubble.swayX * 0.72,
    bubble.startX + bubble.swayX * 0.45,
  ],
  y: [0, bubble.riseY * 0.28, bubble.riseY * 0.68, bubble.riseY],
  opacity: [0, 1, 0.78, 0],
  scale: [LIKE_BUBBLE_MOTION.initialScale, LIKE_BUBBLE_MOTION.peakScale, LIKE_BUBBLE_MOTION.settleScale, bubble.endScale],
})

const getLikeBubbleTransition = (bubble: ResolvedLikeBubble) => ({
  duration: bubble.duration,
  delay: bubble.delay,
  ease: "linear" as const,
  times: [...LIKE_BUBBLE_MOTION.frameTimes],
})

const LIKE_BURST_DURATION_MS = Math.ceil(Math.max(...LIKE_BUBBLES.map((bubble) => (bubble.delay + bubble.duration) * 1000)) + 80)

type Props = {
  variant?: "compact" | "detail"
  likeActive: boolean
  likeAriaLabel: string
  likeText: string
  onToggleLike: () => void
  commentAriaLabel: string
  commentText: string
  onViewComments: () => void
  bookmarkActive: boolean
  bookmarkAriaLabel: string
  onBookmark: () => void
  shareAriaLabel?: string
  onShare?: () => void
}

export default function FeedActions({
  variant = "compact",
  likeActive,
  likeAriaLabel,
  likeText,
  onToggleLike,
  commentAriaLabel,
  commentText,
  onViewComments,
  bookmarkActive,
  bookmarkAriaLabel,
  onBookmark,
  shareAriaLabel = "공유",
  onShare,
}: Props) {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false)
  const [likeBurstKey, setLikeBurstKey] = useState(0)

  useEffect(() => {
    if (!isLikeAnimating) return

    const timeoutId = window.setTimeout(() => {
      setIsLikeAnimating(false)
    }, LIKE_BURST_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isLikeAnimating])

  const handleToggleLike = () => {
    if (!likeActive) {
      setIsLikeAnimating(false)
      requestAnimationFrame(() => {
        setLikeBurstKey((prev) => prev + 1)
        setIsLikeAnimating(true)
      })
    }
    onToggleLike()
  }

  return (
    <div className={variant === "detail" ? "feed_actions is_detail" : "feed_actions"} aria-label="피드 액션">
      <div className="left_actions">
        <button
          type="button"
          className={likeActive ? "feed_action_button is_active" : "feed_action_button"}
          aria-label={likeAriaLabel}
          aria-pressed={likeActive}
          onClick={handleToggleLike}
        >
          <span className="feed_action_icon_wrap" aria-hidden="true">
            <AnimatePresence>
              {isLikeAnimating ? (
                <motion.span
                  key={likeBurstKey}
                  className="feed_like_bubbles"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  {LIKE_BUBBLES.map((bubble) => (
                    <motion.img
                      key={bubble.id}
                      className="feed_like_bubble"
                      src={bubble.src}
                      alt=""
                      style={{ width: bubble.size, height: bubble.size }}
                      initial={getLikeBubbleInitial(bubble)}
                      animate={getLikeBubbleAnimate(bubble)}
                      transition={getLikeBubbleTransition(bubble)}
                    />
                  ))}
                </motion.span>
              ) : null}
            </AnimatePresence>
            <img
              className={isLikeAnimating ? "feed_action_icon is_like_animated" : "feed_action_icon"}
              src={likeActive ? iconBeersteinActive : iconBeerstein}
              alt=""
            />
          </span>
          <span className="feed_action_text">{likeText}</span>
        </button>

        <button type="button" className="feed_action_button" aria-label={commentAriaLabel} onClick={onViewComments}>
          <img className="feed_action_icon" src={iconChat} alt="" aria-hidden="true" />
          <span className="feed_action_text">{commentText}</span>
        </button>

        <button type="button" className="feed_action_button" aria-label={shareAriaLabel} onClick={onShare}>
          <img className="feed_action_icon" src={iconShare} alt="" aria-hidden="true" />
        </button>
      </div>

      <div className="right_actions">
        <button
          type="button"
          className={bookmarkActive ? "feed_action_button is_active" : "feed_action_button"}
          aria-label={bookmarkAriaLabel}
          aria-pressed={bookmarkActive}
          onClick={onBookmark}
        >
          <img
            className="feed_action_icon"
            src={bookmarkActive ? iconBookmarkActive : iconBookmark}
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  )
}
