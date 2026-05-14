import { useCallback, useEffect, useMemo, useState } from "react"
import type { CSSProperties } from "react"
import { useLocation } from "react-router"
import closeIcon from "../assets/svg/x.svg"
import "../styles/FeatureGuide.css"
import { FEATURE_GUIDE_STORAGE_KEY, guideItems, type FeatureGuideItem } from "./guideItems"

type ActiveGuide = {
  item: FeatureGuideItem
  left: number
  top: number
  arrowLeft: number
  arrowTop: number
}

const GUIDE_MARGIN = 12
const GUIDE_ESTIMATED_WIDTH = 260
const GUIDE_ESTIMATED_HEIGHT = 112

function readDismissedGuideIds() {
  if (typeof window === "undefined") return new Set<string>()

  try {
    const raw = window.localStorage.getItem(FEATURE_GUIDE_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [])
  } catch {
    return new Set<string>()
  }
}

function writeDismissedGuideIds(ids: Set<string>) {
  try {
    window.localStorage.setItem(FEATURE_GUIDE_STORAGE_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    // localStorage can be unavailable in restricted browser modes.
  }
}

function matchesRoute(item: FeatureGuideItem, pathname: string) {
  return item.routePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix))
}

function isElementUsable(element: Element) {
  const rect = element.getBoundingClientRect()
  const style = window.getComputedStyle(element)
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 56 &&
    rect.top < window.innerHeight - 96 &&
    style.visibility !== "hidden" &&
    style.display !== "none"
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function getGuideCoordinates(item: FeatureGuideItem, element: Element) {
  const rect = element.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  if (item.position === "top") {
    const left = clamp(centerX - GUIDE_ESTIMATED_WIDTH / 2, GUIDE_MARGIN, viewportWidth - GUIDE_ESTIMATED_WIDTH - GUIDE_MARGIN)
    return {
      left,
      top: clamp(rect.top - GUIDE_ESTIMATED_HEIGHT - GUIDE_MARGIN, GUIDE_MARGIN, viewportHeight - GUIDE_ESTIMATED_HEIGHT - GUIDE_MARGIN),
      arrowLeft: clamp(centerX - left - 6, 20, GUIDE_ESTIMATED_WIDTH - 32),
      arrowTop: 0,
    }
  }

  if (item.position === "left") {
    const top = clamp(centerY - GUIDE_ESTIMATED_HEIGHT / 2, GUIDE_MARGIN, viewportHeight - GUIDE_ESTIMATED_HEIGHT - GUIDE_MARGIN)
    return {
      left: clamp(rect.left - GUIDE_ESTIMATED_WIDTH - GUIDE_MARGIN, GUIDE_MARGIN, viewportWidth - GUIDE_ESTIMATED_WIDTH - GUIDE_MARGIN),
      top,
      arrowLeft: 0,
      arrowTop: clamp(centerY - top - 6, 18, GUIDE_ESTIMATED_HEIGHT - 28),
    }
  }

  if (item.position === "right") {
    const top = clamp(centerY - GUIDE_ESTIMATED_HEIGHT / 2, GUIDE_MARGIN, viewportHeight - GUIDE_ESTIMATED_HEIGHT - GUIDE_MARGIN)
    return {
      left: clamp(rect.right + GUIDE_MARGIN, GUIDE_MARGIN, viewportWidth - GUIDE_ESTIMATED_WIDTH - GUIDE_MARGIN),
      top,
      arrowLeft: 0,
      arrowTop: clamp(centerY - top - 6, 18, GUIDE_ESTIMATED_HEIGHT - 28),
    }
  }

  const left = clamp(centerX - GUIDE_ESTIMATED_WIDTH / 2, GUIDE_MARGIN, viewportWidth - GUIDE_ESTIMATED_WIDTH - GUIDE_MARGIN)
  return {
    left,
    top: clamp(rect.bottom + GUIDE_MARGIN, GUIDE_MARGIN, viewportHeight - GUIDE_ESTIMATED_HEIGHT - GUIDE_MARGIN),
    arrowLeft: clamp(centerX - left - 6, 20, GUIDE_ESTIMATED_WIDTH - 32),
    arrowTop: 0,
  }
}

function hasBlockingOverlay() {
  return Boolean(
    document.querySelector(
      '[role="dialog"], .alert_modal_overlay, .purchase_confirm_overlay, .category_search_overlay, .feed_filter_overlay, .community_review_sort_overlay, .product_review_sort_overlay, .post_owner_action_overlay, .bookmark_modal_backdrop',
    ),
  )
}

export default function FeatureGuide() {
  const { pathname } = useLocation()
  const [dismissedIds, setDismissedIds] = useState(() => readDismissedGuideIds())
  const [activeGuide, setActiveGuide] = useState<ActiveGuide | null>(null)

  const routeItems = useMemo(
    () => guideItems.filter((item) => matchesRoute(item, pathname) && !dismissedIds.has(item.id)),
    [dismissedIds, pathname],
  )

  const updateActiveGuide = useCallback(() => {
    if (hasBlockingOverlay()) {
      setActiveGuide(null)
      return
    }

    for (const item of routeItems) {
      const element = document.querySelector(`[data-guide-id="${item.id}"]`)
      if (!element || !isElementUsable(element)) continue

      const coordinates = getGuideCoordinates(item, element)
      setActiveGuide((prev) =>
        prev?.item.id === item.id &&
        prev.left === coordinates.left &&
        prev.top === coordinates.top &&
        prev.arrowLeft === coordinates.arrowLeft &&
        prev.arrowTop === coordinates.arrowTop
          ? prev
          : { item, ...coordinates },
      )
      return
    }

    setActiveGuide(null)
  }, [routeItems])

  useEffect(() => {
    const timerId = window.setTimeout(updateActiveGuide, 80)
    return () => window.clearTimeout(timerId)
  }, [updateActiveGuide])

  useEffect(() => {
    let frameId = 0
    const scheduleUpdate = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        updateActiveGuide()
      })
    }

    window.addEventListener("resize", scheduleUpdate)
    window.addEventListener("scroll", scheduleUpdate, true)
    return () => {
      window.removeEventListener("resize", scheduleUpdate)
      window.removeEventListener("scroll", scheduleUpdate, true)
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [updateActiveGuide])

  const dismissGuide = () => {
    if (!activeGuide) return

    setDismissedIds((prev) => {
      const next = new Set(prev)
      next.add(activeGuide.item.id)
      writeDismissedGuideIds(next)
      return next
    })
    setActiveGuide(null)
  }

  if (!activeGuide) return null

  return (
    <div
      className={`feature_guide feature_guide_${activeGuide.item.position}`}
      style={
        {
          left: activeGuide.left,
          top: activeGuide.top,
          "--feature-guide-arrow-left": `${activeGuide.arrowLeft}px`,
          "--feature-guide-arrow-top": `${activeGuide.arrowTop}px`,
        } as CSSProperties
      }
      role="status"
      aria-live="polite"
    >
      <p className="feature_guide_message">{activeGuide.item.message}</p>
      <button type="button" className="feature_guide_close" aria-label="닫기" onClick={dismissGuide}>
        <img src={closeIcon} alt="" aria-hidden="true" />
      </button>
    </div>
  )
}


