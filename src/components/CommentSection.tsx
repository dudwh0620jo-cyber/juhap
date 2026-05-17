import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router"
import { AnimatePresence, motion } from "motion/react"

import AlertModal from "./AlertModal"
import PurchaseConfirmModal from "./PurchaseConfirmModal"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconCaretDoubleRight from "../assets/svg/caretdoubleright.svg"
import iconDots from "../assets/svg/dotsthreevertical.svg"
import iconBeerstein from "../assets/svg/beerstein_p.svg"
import iconBeersteinActive from "../assets/svg/beerstein_active.svg"
import iconReplyArrow from "../assets/svg/corner-down-right.svg"
import {
  COMMUNITY_FOLLOWED_USERS_KEY,
  COMMUNITY_PAIRING_COMMENTS_UPDATED_EVENT,
  getPairingCommentsStorageKey,
} from "../utils/communityStorage"
import { getSeedCommentsByTargetId } from "../utils/commentSeeds"
import { getUserMetaFromProfile, mentionDirectoryMock, usersMockById } from "../utils/usersMock"
import { resolveUserAvatar } from "../utils/userAvatars"

type CommentItem = {
  id: number
  userId: number
  userName?: string
  userMeta?: string
  userGrade?: string
  text: string
  timeLabel?: string
  likeCount?: number
  likedByCurrentUser?: boolean
  replyTo?: { userName: string; commentId: number }
}

type Props = {
  pairingId: string | undefined
  currentUser: { id: number; name: string; meta: string }
  getTierClassName: (userId: number) => string
  getTierLabel: (userId: number) => string
  onCountChange: (count: number) => void
  emptyByDefault?: boolean
  countOffset?: number
}

const PAGE_SIZE = 5

type MentionUser = { id: number; name: string; meta: string }
type MentionContext = { start: number; end: number; query: string }

const COMMENT_TIME_LABELS = ["어제", "5시간전", "3시간전", "1시간전", "1시간전", "38분전", "2분전", "방금전"] as const
const COMMENT_LIKE_COUNTS = [4, 4, 4, 8, 1, 15, 6, 3] as const

const getRelativeTimeLabel = (index: number, total: number) => {
  if (total <= 1) return "방금전"
  const safeIndex = Math.max(0, Math.min(index, total - 1))
  const labelIndex = Math.round((safeIndex / Math.max(1, total - 1)) * (COMMENT_TIME_LABELS.length - 1))
  return COMMENT_TIME_LABELS[labelIndex]
}

const resolveCommentIdentity = (item: Pick<CommentItem, "userId" | "userName" | "userMeta">) => {
  const user = usersMockById[item.userId]
  const resolvedName = user?.name?.trim() || item.userName?.trim() || "익명"
  const resolvedMeta =
    item.userMeta?.trim() ||
    (user?.profile ? getUserMetaFromProfile(user.profile) : "") ||
    "미설정"

  return {
    userName: resolvedName,
    userMeta: resolvedMeta,
  }
}

const resolveCommentGrade = (item: Pick<CommentItem, "userId" | "userGrade">, fallbackLabel: (userId: number) => string) =>
  usersMockById[item.userId]?.grade?.trim() || item.userGrade?.trim() || fallbackLabel(item.userId)

const normalizeCommentItems = (items: CommentItem[]) =>
  items.map((item, index) => ({
    ...item,
    ...resolveCommentIdentity(item),
    timeLabel: item.timeLabel?.trim() || COMMENT_TIME_LABELS[index % COMMENT_TIME_LABELS.length],
    likeCount: typeof item.likeCount === "number" ? item.likeCount : COMMENT_LIKE_COUNTS[index % COMMENT_LIKE_COUNTS.length],
    likedByCurrentUser: Boolean(item.likedByCurrentUser),
  }))

const mergeStoredCommentsWithSeed = (storedComments: CommentItem[], seedComments: CommentItem[]) => {
  const seedById = new Map(seedComments.map((item) => [item.id, item]))
  const hydratedStoredComments = storedComments.map((item) => {
    const seedComment = seedById.get(item.id)
    if (!seedComment) return item
    return {
      ...item,
      userId: seedComment.userId,
      text: seedComment.text,
      timeLabel: seedComment.timeLabel,
      replyTo: seedComment.replyTo,
    }
  })
  const storedIdSet = new Set(hydratedStoredComments.map((item) => item.id))
  const missingSeedComments = seedComments.filter((item) => !storedIdSet.has(item.id))
  return [...hydratedStoredComments, ...missingSeedComments]
}

export default function CommentSection({
  pairingId,
  currentUser,
  getTierClassName,
  getTierLabel,
  onCountChange,
  emptyByDefault,
  countOffset = 0,
}: Props) {
  const navigate = useNavigate()
  const [commentValue, setCommentValue] = useState("")
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentValue, setEditingCommentValue] = useState("")
  const [openMenuCommentId, setOpenMenuCommentId] = useState<number | null>(null)
  const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState<number | null>(null)
  const [inlineReplyCommentId, setInlineReplyCommentId] = useState<number | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [hiddenPagerButtonIndexes, setHiddenPagerButtonIndexes] = useState<Set<number>>(() => new Set())
  const [cursorIndex, setCursorIndex] = useState(0)
  const [isMentionOpen, setIsMentionOpen] = useState(false)
  const [expandedReplyParentIds, setExpandedReplyParentIds] = useState<Set<number>>(() => new Set())
  const [followedUserIds, setFollowedUserIds] = useState<Set<number>>(() => {
    try {
      const raw = window.localStorage.getItem(COMMUNITY_FOLLOWED_USERS_KEY)
      if (!raw) return new Set()
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return new Set()
      return new Set(parsed.filter((value): value is number => typeof value === "number" && Number.isFinite(value)))
    } catch {
      return new Set()
    }
  })

  const swipeStartRef = useRef<{ x: number; y: number } | null>(null)
  const mainInputRef = useRef<HTMLInputElement | null>(null)
  const commentPageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [likeAnimatingIds, setLikeAnimatingIds] = useState<Set<number>>(() => new Set())
  const [commentViewportHeight, setCommentViewportHeight] = useState<number | null>(null)
  const likeAnimationTimeoutByIdRef = useRef<Map<number, number>>(new Map())
  const getActiveInput = () => mainInputRef.current

  const toggleReplyGroup = (parentId: number) => {
    setExpandedReplyParentIds((prev) => {
      const next = new Set(prev)
      if (next.has(parentId)) next.delete(parentId)
      else next.add(parentId)
      return next
    })
  }

  const toggleCommentMenu = (commentId: number) => {
    if (openMenuCommentId === commentId) {
      setOpenMenuCommentId(null)
      return
    }
    setOpenMenuCommentId(commentId)
  }

  const commentsStorageKey = useMemo(
    () => (pairingId ? getPairingCommentsStorageKey(pairingId) : null),
    [pairingId],
  )

  const seedComments = useMemo(
    () => (emptyByDefault ? [] : getSeedCommentsByTargetId(pairingId)),
    [emptyByDefault, pairingId],
  )

  const [commentItems, setCommentItems] = useState<CommentItem[]>(() => {
    const defaultComments = seedComments

    if (!pairingId) return normalizeCommentItems(defaultComments)
    try {
      const raw = window.localStorage.getItem(getPairingCommentsStorageKey(pairingId))
      if (!raw) return normalizeCommentItems(defaultComments)
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return normalizeCommentItems(defaultComments)
      const storedComments = parsed.filter(
        (item): item is CommentItem =>
          item &&
          typeof item === "object" &&
          typeof item.id === "number" &&
          typeof item.userId === "number" &&
          typeof item.text === "string",
      )
      if (!emptyByDefault && storedComments.length === 0) return normalizeCommentItems(defaultComments)
      return normalizeCommentItems(mergeStoredCommentsWithSeed(storedComments, defaultComments))
    } catch {
      return normalizeCommentItems(defaultComments)
    }
  })

  const nextId = useMemo(() => commentItems.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1, [commentItems])

  useEffect(() => {
    if (emptyByDefault || seedComments.length === 0) return
    let isCancelled = false
    window.queueMicrotask(() => {
      if (isCancelled) return
      setCommentItems((prev) => normalizeCommentItems(mergeStoredCommentsWithSeed(prev, seedComments)))
    })
    return () => {
      isCancelled = true
    }
  }, [emptyByDefault, seedComments])

  const commentGroups = useMemo(() => {
    const byId = new Map<number, CommentItem>()
    for (const item of commentItems) byId.set(item.id, item)

    const topLevel = commentItems
      .filter((item) => !item.replyTo)
      .sort((a, b) => b.id - a.id)
      .map((item, index, list) => ({
        ...item,
        timeLabel: getRelativeTimeLabel(list.length - 1 - index, list.length),
      }))
    const repliesByParentId = new Map<number, CommentItem[]>()

    for (const item of commentItems) {
      if (!item.replyTo) continue
      const parentId = item.replyTo.commentId
      if (!repliesByParentId.has(parentId)) repliesByParentId.set(parentId, [])
      repliesByParentId.get(parentId)!.push(item)
    }

    for (const [parentId, replies] of repliesByParentId.entries()) {
      replies.sort((a, b) => b.id - a.id)
      repliesByParentId.set(
        parentId,
        replies.map((item, index, list) => ({
          ...item,
          timeLabel: getRelativeTimeLabel(list.length - 1 - index, list.length),
        })),
      )
    }

    return { byId, topLevel, repliesByParentId }
  }, [commentItems])

  const visibleCommentCount = commentGroups.topLevel.length

  const pagedComments = useMemo(() => {
    const parentPages: CommentItem[][] = []
    for (let index = 0; index < commentGroups.topLevel.length; index += PAGE_SIZE) {
      parentPages.push(commentGroups.topLevel.slice(index, index + PAGE_SIZE))
    }
    if (parentPages.length === 0) parentPages.push([])

    return parentPages.map((parents, index) => {
      const parentIds = new Set(parents.map((parent) => parent.id))
      const orphanReplies = commentItems
        .filter((item) => item.replyTo && !commentGroups.byId.has(item.replyTo.commentId))
        .sort((a, b) => a.id - b.id)
      return {
        index,
        parents,
        orphanReplies:
          index === parentPages.length - 1
            ? orphanReplies.filter((reply) => !reply.replyTo || !parentIds.has(reply.replyTo.commentId))
            : [],
      }
    })
  }, [commentGroups.byId, commentGroups.topLevel, commentItems])

  const maxPageIndex = Math.max(0, pagedComments.length - 1)
  const safePageIndex = Math.min(pageIndex, maxPageIndex)

  useLayoutEffect(() => {
    const activePage = commentPageRefs.current.get(safePageIndex)
    if (!activePage) return

    const updateHeight = () => {
      setCommentViewportHeight(Math.ceil(activePage.scrollHeight))
    }

    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(activePage)
    return () => observer.disconnect()
  }, [safePageIndex, pagedComments, expandedReplyParentIds])

  useLayoutEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => {
      if (openMenuCommentId === null) {
        setHiddenPagerButtonIndexes(new Set())
        return
      }

      const menuRect = document.querySelector(".comment_menu")?.getBoundingClientRect()
      if (!menuRect) {
        setHiddenPagerButtonIndexes(new Set())
        return
      }

      const nextHiddenIndexes = new Set<number>()
      document.querySelectorAll<HTMLButtonElement>(".comment_pager_button").forEach((button, index) => {
        const buttonRect = button.getBoundingClientRect()
        const isOverlapping =
          menuRect.left < buttonRect.right &&
          menuRect.right > buttonRect.left &&
          menuRect.top < buttonRect.bottom &&
          menuRect.bottom > buttonRect.top

        if (isOverlapping) nextHiddenIndexes.add(index)
      })
      setHiddenPagerButtonIndexes(nextHiddenIndexes)
    })

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [openMenuCommentId, commentViewportHeight, safePageIndex])

  useEffect(() => {
    // keep in sync when other screens change follow list
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== COMMUNITY_FOLLOWED_USERS_KEY) return
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : []
        setFollowedUserIds(
          new Set(Array.isArray(parsed) ? parsed.filter((value): value is number => typeof value === "number") : []),
        )
      } catch {
        setFollowedUserIds(new Set())
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  useLayoutEffect(() => {
    if (!commentsStorageKey) return
    try {
      window.localStorage.setItem(commentsStorageKey, JSON.stringify(commentItems))
      if (pairingId) {
        window.dispatchEvent(
          new CustomEvent(COMMUNITY_PAIRING_COMMENTS_UPDATED_EVENT, {
            detail: { pairingId, count: visibleCommentCount },
          }),
        )
      }
    } catch {
      // ignore storage errors
    }
    onCountChange(visibleCommentCount)
  }, [commentItems, commentsStorageKey, onCountChange, pairingId, visibleCommentCount])

  useEffect(() => {
    if (openMenuCommentId === null) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      if (target.closest(".comment_menu") || target.closest(".comment_menu_toggle")) return
      setOpenMenuCommentId(null)
    }

    window.addEventListener("mousedown", handlePointerDown)
    return () => window.removeEventListener("mousedown", handlePointerDown)
  }, [openMenuCommentId])

  const resolveReplyTarget = (userName: string | undefined) => {
    if (!userName) return null
    const target = [...commentItems]
      .reverse()
      .find((item) => item.userName === userName && !item.replyTo)
    if (!target) return null
    return { userName: resolveCommentIdentity(target).userName, commentId: target.id } as const
  }

  const mentionContext = useMemo<MentionContext | null>(() => {
    const cursor = Math.max(0, Math.min(cursorIndex, commentValue.length))
    const atIndex = commentValue.lastIndexOf("@", Math.max(0, cursor - 1))
    if (atIndex === -1) return null
    if (atIndex > 0 && !/\s/.test(commentValue[atIndex - 1])) return null

    const afterAt = commentValue.slice(atIndex + 1)
    const nextSpaceOffset = afterAt.search(/\s/)
    const tokenEnd = nextSpaceOffset === -1 ? commentValue.length : atIndex + 1 + nextSpaceOffset
    if (cursor > tokenEnd) return null
    const between = commentValue.slice(atIndex + 1, cursor)
    if (/\s/.test(between)) return null
    return { start: atIndex, end: tokenEnd, query: between }
  }, [commentValue, cursorIndex])

  const isMentionPicking = useMemo(() => isMentionOpen && !!mentionContext, [isMentionOpen, mentionContext])

  const mentionCandidates = useMemo(() => {
    if (!isMentionPicking) return []
    const query = (mentionContext?.query ?? "").trim().toLowerCase()

    const userById = new Map<number, MentionUser>()
    for (const user of mentionDirectoryMock) userById.set(user.id, user)
    for (const item of commentItems) {
      if (!userById.has(item.userId)) {
        const identity = resolveCommentIdentity(item)
        userById.set(item.userId, { id: item.userId, name: identity.userName, meta: identity.userMeta })
      }
    }
    userById.set(currentUser.id, { id: currentUser.id, name: currentUser.name, meta: currentUser.meta })

    const allUsers = Array.from(userById.values())
    const followedUsers = allUsers.filter((user) => followedUserIds.has(user.id))

    const pool = query ? allUsers : followedUsers
    const filtered = query
      ? pool.filter((user) => user.name.toLowerCase().includes(query))
      : pool

    // stable order: followed first, then name
    const followedSet = new Set(followedUsers.map((u) => u.id))
    return filtered
      .sort((a, b) => {
        const af = followedSet.has(a.id) ? 0 : 1
        const bf = followedSet.has(b.id) ? 0 : 1
        if (af !== bf) return af - bf
        return a.name.localeCompare(b.name, "ko-KR")
      })
      .slice(0, 8)
  }, [commentItems, currentUser.id, currentUser.meta, currentUser.name, followedUserIds, isMentionPicking, mentionContext])

  const applyMention = (user: MentionUser) => {
    if (!mentionContext) {
      setCommentValue((prev) => `${prev}@${user.name} `)
      return
    }

    const nextValue = `${commentValue.slice(0, mentionContext.start)}@${user.name} ${commentValue.slice(
      mentionContext.end,
    )}`
    setCommentValue(nextValue)
    setIsMentionOpen(false)
    requestAnimationFrame(() => {
      const input = getActiveInput()
      if (!input) return
      const nextCursor = Math.min(nextValue.length, mentionContext.start + user.name.length + 2)
      input.focus()
      input.setSelectionRange(nextCursor, nextCursor)
      setCursorIndex(nextCursor)
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = commentValue.trim()
    if (!trimmed) return

    const mentionOnlyMatch = trimmed.match(/^@([^\s]{1,20})\s*$/)
    if (mentionOnlyMatch) {
      setAlertMessage("빈 내용은 등록할 수 없어요")
      return
    }

    const mentionMatch = trimmed.match(/^@([^\s]{1,20})\s+(.*)$/)
    const mentionName = mentionMatch?.[1]?.trim()
    const replyTo =
      inlineReplyCommentId !== null
        ? (() => {
            const target = commentItems.find((item) => item.id === inlineReplyCommentId)
            return target ? ({ userName: resolveCommentIdentity(target).userName, commentId: target.id } as const) : null
          })()
        : resolveReplyTarget(mentionName)
    const replyBody = (mentionMatch?.[2] ?? trimmed).trim()
    if (!replyBody) {
      setAlertMessage("빈 내용은 등록할 수 없어요")
      return
    }
    const storedText = replyTo ? replyBody : mentionName ? `@${mentionName} ${replyBody}` : replyBody

    setCommentItems((prev) => [
      ...prev,
      {
        id: nextId,
        userId: currentUser.id,
        userName: currentUser.name,
        userMeta: currentUser.meta,
        userGrade: resolveCommentGrade({ userId: currentUser.id }, getTierLabel),
        text: storedText,
        timeLabel: "방금전",
        likeCount: 0,
        likedByCurrentUser: false,
        replyTo: replyTo ?? undefined,
      },
    ])
    setCommentValue("")
    setAlertMessage(null)
    setInlineReplyCommentId(null)
    if (inlineReplyCommentId === null) {
      setExpandedReplyParentIds(new Set())
      setPageIndex(0)
    } else if (replyTo) {
      setExpandedReplyParentIds((prev) => {
        const next = new Set(prev)
        next.add(replyTo.commentId)
        return next
      })
    }
  }

  const startEdit = (item: CommentItem) => {
    setEditingCommentId(item.id)
    setEditingCommentValue(item.text)
    setOpenMenuCommentId(null)
  }

  const mentionFromComment = (item: CommentItem) => {
    const nextValue = `@${item.userName} `
    setCommentValue(nextValue)
    setAlertMessage(null)
    setOpenMenuCommentId(null)
    setInlineReplyCommentId(item.id)
    setIsMentionOpen(false)
    requestAnimationFrame(() => {
      const input = mainInputRef.current
      if (!input) return
      input.focus()
      input.setSelectionRange(nextValue.length, nextValue.length)
      setCursorIndex(nextValue.length)
    })
  }

  const cancelEdit = () => {
    setEditingCommentId(null)
    setEditingCommentValue("")
  }

  const confirmEdit = () => {
    if (editingCommentId === null) return
    const trimmed = editingCommentValue.trim()
    if (!trimmed) return

    setCommentItems((prev) => prev.map((item) => (item.id === editingCommentId ? { ...item, text: trimmed } : item)))
    cancelEdit()
  }

  const removeComment = (commentId: number) => {
    setCommentItems((prev) => prev.filter((item) => item.id !== commentId))
    if (editingCommentId === commentId) cancelEdit()
    if (openMenuCommentId === commentId) setOpenMenuCommentId(null)
  }

  const requestDeleteComment = (commentId: number) => {
    setPendingDeleteCommentId(commentId)
    setOpenMenuCommentId(null)
  }

  const confirmDeleteComment = () => {
    if (pendingDeleteCommentId === null) return
    removeComment(pendingDeleteCommentId)
    setPendingDeleteCommentId(null)
  }

  const toggleCommentLike = (commentId: number) => {
    const existingTimeoutId = likeAnimationTimeoutByIdRef.current.get(commentId)
    if (existingTimeoutId) window.clearTimeout(existingTimeoutId)

    setLikeAnimatingIds((prev) => {
      const next = new Set(prev)
      next.add(commentId)
      return next
    })

    const timeoutId = window.setTimeout(() => {
      likeAnimationTimeoutByIdRef.current.delete(commentId)
      setLikeAnimatingIds((prev) => {
        if (!prev.has(commentId)) return prev
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })
    }, 420)

    likeAnimationTimeoutByIdRef.current.set(commentId, timeoutId)

    setCommentItems((prev) =>
      prev.map((item) => {
        if (item.id !== commentId) return item
        const nextLiked = !item.likedByCurrentUser
        return {
          ...item,
          likedByCurrentUser: nextLiked,
          likeCount: Math.max(0, (item.likeCount ?? 0) + (nextLiked ? 1 : -1)),
        }
      }),
    )
  }

  const closeCommentOverlays = () => {
    setOpenMenuCommentId(null)
    setEditingCommentId(null)
    setEditingCommentValue("")
    setInlineReplyCommentId(null)
    setExpandedReplyParentIds(new Set())
  }

  const goToPrevPage = () => {
    closeCommentOverlays()
    setPageIndex((prev) => Math.max(0, Math.min(prev, maxPageIndex) - 1))
  }
  const goToNextPage = () => {
    closeCommentOverlays()
    setPageIndex((prev) => Math.min(maxPageIndex, Math.min(prev, maxPageIndex) + 1))
  }
  const goToFirstPage = () => {
    closeCommentOverlays()
    setPageIndex(0)
  }
  const goToLastPage = () => {
    closeCommentOverlays()
    setPageIndex(maxPageIndex)
  }

  const canGoPrev = safePageIndex > 0
  const canGoNext = safePageIndex < maxPageIndex

  const renderCommentRow = (item: CommentItem) => {
    const isMyComment = item.userId === currentUser.id
    const authorAvatarSrc = resolveUserAvatar(item.userId)
    const authorInitial = item.userName?.trim().slice(0, 1) || "?"
    const replyCount = item.replyTo ? 0 : commentGroups.repliesByParentId.get(item.id)?.length ?? 0
    const isRepliesExpanded = expandedReplyParentIds.has(item.id)

    return (
      <div
        className={`${item.replyTo ? "comment_row is_reply" : "comment_row"}${replyCount > 0 ? " has_replies" : ""}${
          openMenuCommentId === item.id ? " has_open_menu" : ""
        }`}
        key={item.id}
      >
        {item.replyTo ? <img className="comment_reply_corner_icon" src={iconReplyArrow} alt="" aria-hidden="true" /> : null}
        <div className="comment_row_layout">
          <div className="comment_profile_block">
            <button
              type="button"
              className="comment_avatar_button"
              aria-label={isMyComment ? "내 프로필 보기" : `${item.userName} 프로필`}
              onClick={() => {
                if (isMyComment) navigate("/my")
              }}
            >
              <div className="comment_avatar" aria-hidden="true">
                {authorAvatarSrc ? (
                  <img className="comment_avatar_image" src={authorAvatarSrc} alt="" aria-hidden="true" />
                ) : (
                  <span className="comment_avatar_fallback">{authorInitial}</span>
                )}
              </div>
            </button>
          </div>

          <div className="comment_body">
            <div className="comment_header_main">
              <button
                type="button"
                className="comment_author_button"
                onClick={() => {
                  if (isMyComment) navigate("/my")
                }}
              >
                <span className="comment_author_name">{item.userName}</span>
              </button>
              <span className={getTierClassName(item.userId)}>{resolveCommentGrade(item, getTierLabel)}</span>
              <span className="comment_header_dot" aria-hidden="true">·</span>
              <span className="comment_time">{item.timeLabel}</span>
              {isMyComment ? <span className="author_owner_badge comment_owner_badge">작성자</span> : null}
            </div>

            <div className="comment_content_block">
              {editingCommentId === item.id ? (
                <div className="comment_edit_shell">
                  <input
                    className="comment_edit_input"
                    value={editingCommentValue}
                    onChange={(event) => setEditingCommentValue(event.target.value)}
                    aria-label="댓글 수정"
                  />
                  <div className="comment_edit_actions">
                    <button type="button" onClick={cancelEdit}>
                      취소
                    </button>
                    <button type="button" className="is_primary" onClick={confirmEdit}>
                      저장
                    </button>
                  </div>
                </div>
              ) : item.replyTo ? (
                <p className="comment_reply_line">
                  <span className="comment_reply_mention">@{item.replyTo.userName} </span>
                  <span className="comment_reply_text">{item.text}</span>
                </p>
              ) : (
                <p className="comment_text">{item.text}</p>
              )}

              {!item.replyTo ? (
                <div className="comment_footer">
                  <button type="button" className="comment_reply_button" onClick={() => mentionFromComment(item)}>
                    답글달기
                  </button>
                </div>
              ) : null}

              {!item.replyTo && replyCount > 0 ? (
                <button
                  type="button"
                  className={`comment_reply_toggle${isRepliesExpanded ? " is_expanded" : ""}`}
                  onClick={() => toggleReplyGroup(item.id)}
                  aria-label={isRepliesExpanded ? "답글 닫기" : `답글 ${replyCount}개 펼치기`}
                  aria-expanded={isRepliesExpanded}
                >
                  <span className="comment_reply_toggle_bar" aria-hidden="true" />
                  <span>{isRepliesExpanded ? "답글 닫기" : `답글 ${replyCount}개`}</span>
                  <img src={iconCaretLeft} alt="" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="comment_side">
            <div className="comment_actions">
              {isMyComment ? (
                <button
                  type="button"
                  className="comment_menu_toggle"
                  aria-label="댓글 메뉴"
                  aria-haspopup="menu"
                  aria-expanded={openMenuCommentId === item.id}
                  onClick={() => toggleCommentMenu(item.id)}
                >
                  <img src={iconDots} alt="" aria-hidden="true" />
                </button>
              ) : (
                <span className="comment_menu_spacer" aria-hidden="true" />
              )}

              {openMenuCommentId === item.id ? (
                <div
                  className="comment_menu"
                  role="menu"
                  aria-label="댓글 메뉴"
                >
                  <button type="button" role="menuitem" onClick={() => startEdit(item)}>
                    수정
                  </button>
                  <button type="button" role="menuitem" onClick={() => requestDeleteComment(item.id)}>
                    삭제
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className={item.likedByCurrentUser ? "comment_like_button is_active" : "comment_like_button"}
              aria-label={item.likedByCurrentUser ? "댓글 좋아요 취소" : "댓글 좋아요"}
              aria-pressed={item.likedByCurrentUser}
              onClick={() => toggleCommentLike(item.id)}
            >
              <img
                className={likeAnimatingIds.has(item.id) ? "comment_like_icon is_like_animated" : "comment_like_icon"}
                src={item.likedByCurrentUser ? iconBeersteinActive : iconBeerstein}
                alt=""
                aria-hidden="true"
              />
              <span>{item.likeCount ?? 0}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const mainCommentInputForm = (
    <form className="comment_input" onSubmit={handleSubmit}>
      {isMentionPicking && mentionCandidates.length > 0 ? (
        <div className="comment_mention_panel" role="listbox" aria-label="태그할 유저 목록">
          {mentionCandidates.map((user) => (
            <button
              key={user.id}
              type="button"
              className="comment_mention_item"
              role="option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyMention(user)}
            >
              <span className="comment_mention_name">@{user.name}</span>
              <span className="comment_mention_meta">{user.meta}</span>
            </button>
          ))}
        </div>
      ) : null}

      <input
        ref={mainInputRef}
        className="comment_input_field"
        value={commentValue}
        onChange={(event) => {
          setCommentValue(event.target.value)
          setAlertMessage(null)
          setCursorIndex(event.target.selectionStart ?? event.target.value.length)
          setIsMentionOpen(true)
        }}
        onFocus={() => setIsMentionOpen(true)}
        onBlur={() => setIsMentionOpen(false)}
        onKeyUp={(event) => {
          const target = event.currentTarget
          setCursorIndex(target.selectionStart ?? target.value.length)
          if (!isMentionOpen) setIsMentionOpen(true)
        }}
        onClick={(event) => {
          const target = event.currentTarget
          setCursorIndex(target.selectionStart ?? target.value.length)
        }}
        placeholder="댓글을 입력해보세요"
        aria-label="댓글 입력"
      />
      <button type="submit" aria-label="댓글 등록">
        등록
      </button>
    </form>
  )

  return (
    <>
      {alertMessage ? <AlertModal message={alertMessage} onConfirm={() => setAlertMessage(null)} /> : null}
      {pendingDeleteCommentId !== null ? (
        <PurchaseConfirmModal
          ariaLabel="댓글 삭제 확인"
          message={"댓글을 삭제하시겠습니까?\n삭제한 댓글은 복구할 수 없습니다"}
          confirmLabel="삭제"
          cancelLabel="취소"
          onCancel={() => setPendingDeleteCommentId(null)}
          onConfirm={confirmDeleteComment}
        />
      ) : null}
      <section className="comment_section_shell" id="comments" aria-label="댓글 영역">
        <div
          className="comment_list"
          aria-label="댓글 목록"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            swipeStartRef.current = { x: event.clientX, y: event.clientY }
          }}
          onPointerUp={(event) => {
            const start = swipeStartRef.current
            swipeStartRef.current = null
            if (!start) return

            const deltaX = event.clientX - start.x
            const deltaY = event.clientY - start.y
            if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) return

            // swipe left -> next page (newer), swipe right -> previous page (older)
            if (deltaX < 0) {
              if (canGoNext) goToNextPage()
            } else {
              if (canGoPrev) goToPrevPage()
            }
          }}
          onPointerCancel={() => {
            swipeStartRef.current = null
          }}
          onPointerLeave={() => {
            swipeStartRef.current = null
          }}
        >
          <div className="comment_list_header">
            <h3 className="comment_list_title">댓글 {countOffset + visibleCommentCount}</h3>
          </div>
          {mainCommentInputForm}
        <div
          className={`comment_slide_viewport${openMenuCommentId !== null ? " has_open_menu" : ""}`}
          style={commentViewportHeight !== null ? { height: commentViewportHeight } : undefined}
        >
          <div
            className="comment_page_track"
            style={{
              width: `${Math.max(1, pagedComments.length) * 100}%`,
              transform: `translateX(-${safePageIndex * (100 / Math.max(1, pagedComments.length))}%)`,
            }}
          >
            {pagedComments.map((page) => (
              <div
                className={`comment_page${page.index === safePageIndex ? " is_active" : ""}`}
                key={page.index}
                ref={(element) => {
                  if (element) commentPageRefs.current.set(page.index, element)
                  else commentPageRefs.current.delete(page.index)
                }}
                style={{ width: `${100 / Math.max(1, pagedComments.length)}%` }}
              >
                {page.parents.map((parent) => {
                  const replies = commentGroups.repliesByParentId.get(parent.id) ?? []
                  const isRepliesExpanded = expandedReplyParentIds.has(parent.id)
                  const hasOpenReplyMenu = replies.some((reply) => reply.id === openMenuCommentId)
                  const hasOpenMenu = parent.id === openMenuCommentId || hasOpenReplyMenu

                  return (
                    <div className={`comment_thread${hasOpenMenu ? " has_open_menu" : ""}`} key={parent.id}>
                      {renderCommentRow(parent)}
                      <AnimatePresence initial={false}>
                        {isRepliesExpanded && replies.length > 0 ? (
                          <motion.div
                            className={`comment_reply_group${hasOpenReplyMenu ? " has_open_menu" : ""}`}
                            key={`replies-${parent.id}`}
                            initial={{ height: 0, opacity: 0, y: -6 }}
                            animate={{ height: "auto", opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -6 }}
                            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                          >
                            {replies.map((reply) => renderCommentRow(reply))}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  )
                })}
                {page.orphanReplies.map((reply) => renderCommentRow(reply))}
              </div>
            ))}
            </div>
          </div>
        </div>
        <div className="comment_pager comment_pager_bottom" aria-label="댓글 페이지 이동">
          <div className="comment_pager_left" aria-label="처음/이전 페이지">
            <button
              type="button"
              className={`comment_pager_button${hiddenPagerButtonIndexes.has(0) ? " is_hidden" : ""}`}
              onClick={goToFirstPage}
              disabled={!canGoPrev}
              aria-label="처음 페이지"
            >
              <img className="comment_pager_icon is_flipped" src={iconCaretDoubleRight} alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`comment_pager_button${hiddenPagerButtonIndexes.has(1) ? " is_hidden" : ""}`}
              onClick={goToPrevPage}
              disabled={!canGoPrev}
              aria-label="이전 페이지"
            >
              <img className="comment_pager_icon" src={iconCaretLeft} alt="" aria-hidden="true" />
            </button>
          </div>

          <span className="comment_pager_label" aria-label="현재 페이지">
            {visibleCommentCount === 0 ? "0/0" : `${safePageIndex + 1}/${maxPageIndex + 1}`}
          </span>

          <div className="comment_pager_right" aria-label="다음/마지막 페이지">
            <button
              type="button"
              className={`comment_pager_button${hiddenPagerButtonIndexes.has(2) ? " is_hidden" : ""}`}
              onClick={goToNextPage}
              disabled={!canGoNext}
              aria-label="다음 페이지"
            >
              <img className="comment_pager_icon is_flipped" src={iconCaretLeft} alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`comment_pager_button${hiddenPagerButtonIndexes.has(3) ? " is_hidden" : ""}`}
              onClick={goToLastPage}
              disabled={!canGoNext}
              aria-label="마지막 페이지"
            >
              <img className="comment_pager_icon" src={iconCaretDoubleRight} alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
