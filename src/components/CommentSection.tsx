import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router"

import AlertModal from "./AlertModal"
import PurchaseConfirmModal from "./PurchaseConfirmModal"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconCaretDoubleRight from "../assets/svg/caretdoubleright.svg"
import iconDots from "../assets/svg/dotsthreevertical.svg"
import iconBeerstein from "../assets/svg/beerstein_p.svg"
import iconBeersteinActive from "../assets/svg/beerstein_active.svg"
import iconReplyArrow from "../assets/svg/arrowbenddownright.svg"
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

const COMMENT_TIME_LABELS = ["방금전", "2분전", "38분전", "1시간전", "1시간전", "3시간전", "5시간전", "어제"] as const
const COMMENT_LIKE_COUNTS = [4, 4, 4, 8, 1, 15, 6, 3] as const

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
      timeLabel: seedComment.timeLabel ?? item.timeLabel,
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
  const [cursorIndex, setCursorIndex] = useState(0)
  const [isMentionOpen, setIsMentionOpen] = useState(false)
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
  const inlineInputRef = useRef<HTMLInputElement | null>(null)
  const [likeAnimatingIds, setLikeAnimatingIds] = useState<Set<number>>(() => new Set())
  const likeAnimationTimeoutByIdRef = useRef<Map<number, number>>(new Map())
  const getActiveInput = () => (inlineReplyCommentId !== null ? inlineInputRef.current : mainInputRef.current)

  const commentsStorageKey = useMemo(
    () => (pairingId ? getPairingCommentsStorageKey(pairingId) : null),
    [pairingId],
  )

  const [commentItems, setCommentItems] = useState<CommentItem[]>(() => {
    const defaultComments = emptyByDefault ? [] : getSeedCommentsByTargetId(pairingId)

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

  // id=1 is the oldest comment; higher id means newer.
  // When a comment is a reply, render it right under its parent comment.
  const sortedComments = useMemo(() => {
    const byId = new Map<number, CommentItem>()
    for (const item of commentItems) byId.set(item.id, item)

    const topLevel = commentItems.filter((item) => !item.replyTo).sort((a, b) => a.id - b.id)
    const repliesByParentId = new Map<number, CommentItem[]>()

    for (const item of commentItems) {
      if (!item.replyTo) continue
      const parentId = item.replyTo.commentId
      if (!repliesByParentId.has(parentId)) repliesByParentId.set(parentId, [])
      repliesByParentId.get(parentId)!.push(item)
    }

    for (const replies of repliesByParentId.values()) {
      replies.sort((a, b) => a.id - b.id)
    }

    const result: CommentItem[] = []
    const appended = new Set<number>()

    for (const parent of topLevel) {
      result.push(parent)
      appended.add(parent.id)
      const replies = repliesByParentId.get(parent.id) ?? []
      for (const reply of replies) {
        result.push(reply)
        appended.add(reply.id)
      }
    }

    // orphan replies: parent not in list (defensive)
    const orphans = commentItems
      .filter((item) => item.replyTo && !byId.has(item.replyTo.commentId))
      .sort((a, b) => a.id - b.id)
    for (const orphan of orphans) {
      if (appended.has(orphan.id)) continue
      result.push(orphan)
    }

    // any remaining items (defensive)
    const remaining = commentItems.filter((item) => !appended.has(item.id)).sort((a, b) => a.id - b.id)
    result.push(...remaining)

    return result
  }, [commentItems])
  const maxPageIndex = useMemo(
    () => Math.max(0, Math.ceil(sortedComments.length / PAGE_SIZE) - 1),
    [sortedComments.length],
  )
  const safePageIndex = Math.min(pageIndex, maxPageIndex)

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

  const pagedComments = useMemo(() => {
    const pageCount = Math.max(1, maxPageIndex + 1)
    return Array.from({ length: pageCount }, (_, index) => {
      const start = index * PAGE_SIZE
      const items = sortedComments.slice(start, start + PAGE_SIZE)
      return {
        index,
        items,
      }
    })
  }, [maxPageIndex, sortedComments])

  useLayoutEffect(() => {
    if (!commentsStorageKey) return
    try {
      window.localStorage.setItem(commentsStorageKey, JSON.stringify(commentItems))
      if (pairingId) {
        window.dispatchEvent(
          new CustomEvent(COMMUNITY_PAIRING_COMMENTS_UPDATED_EVENT, {
            detail: { pairingId, count: commentItems.length },
          }),
        )
      }
    } catch {
      // ignore storage errors
    }
    onCountChange(commentItems.length)
  }, [commentItems, commentsStorageKey, onCountChange, pairingId])

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
    // Go to newest page only when posting a new top-level comment.
    if (inlineReplyCommentId === null) {
      const nextCount = commentItems.length + 1
      const nextMaxPage = Math.max(0, Math.ceil(nextCount / PAGE_SIZE) - 1)
      setPageIndex(nextMaxPage)
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
      const input = inlineInputRef.current
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
            <h3 className="comment_list_title">댓글 {countOffset + commentItems.length}</h3>
          </div>
        <div className="comment_slide_viewport">
          <div
            className="comment_page_track"
            style={{
              width: `${Math.max(1, pagedComments.length) * 100}%`,
              transform: `translateX(-${safePageIndex * (100 / Math.max(1, pagedComments.length))}%)`,
            }}
          >
            {pagedComments.map((page) => (
              <div className="comment_page" key={page.index} style={{ width: `${100 / Math.max(1, pagedComments.length)}%` }}>
                {page.items.map((item) => {
                const isMyComment = item.userId === currentUser.id
                const authorAvatarSrc = resolveUserAvatar(item.userId)
                const authorInitial = item.userName?.trim().slice(0, 1) || "?"
                return (
                  <div className={item.replyTo ? "comment_row is_reply" : "comment_row"} key={item.id}>
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
                          <span className="comment_header_dot" aria-hidden="true">ㆍ</span>
                          <span className="comment_time">{item.timeLabel}</span>
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
                              <span className="comment_reply_meta" aria-label="대댓글 대상">
                                <img className="comment_reply_icon" src={iconReplyArrow} alt="" aria-hidden="true" />@
                                {item.replyTo.userName}
                              </span>
                              <span className="comment_reply_text">{item.text}</span>
                            </p>
                          ) : (
                            <p className="comment_text">{item.text}</p>
                          )}

                          <div className="comment_footer">
                            <button type="button" className="comment_reply_button" onClick={() => mentionFromComment(item)}>
                              답글쓰기
                            </button>
                          </div>

                          {inlineReplyCommentId === item.id ? (
                            <form className="comment_inline_reply" onSubmit={handleSubmit}>
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
                                ref={inlineInputRef}
                                className="comment_inline_reply_field"
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
                              onClick={() => setOpenMenuCommentId((prev) => (prev === item.id ? null : item.id))}
                            >
                              <img src={iconDots} alt="" aria-hidden="true" />
                            </button>
                          ) : (
                            <span className="comment_menu_spacer" aria-hidden="true" />
                          )}

                          {openMenuCommentId === item.id ? (
                            <div className="comment_menu" role="menu" aria-label="댓글 메뉴">
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
                            className={
                              likeAnimatingIds.has(item.id) ? "comment_like_icon is_like_animated" : "comment_like_icon"
                            }
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
              })}

                </div>
              ))}
            </div>
          </div>
        </div>

        <form
          className="comment_input"
          onSubmit={handleSubmit}
          style={inlineReplyCommentId !== null ? { display: "none" } : undefined}
        >
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

        <div className="comment_pager comment_pager_bottom" aria-label="댓글 페이지 이동">
          <div className="comment_pager_left" aria-label="처음/이전 페이지">
            <button
              type="button"
              className="comment_pager_button"
              onClick={goToFirstPage}
              disabled={!canGoPrev}
              aria-label="처음 페이지"
            >
              <img className="comment_pager_icon is_flipped" src={iconCaretDoubleRight} alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="comment_pager_button"
              onClick={goToPrevPage}
              disabled={!canGoPrev}
              aria-label="이전 페이지"
            >
              <img className="comment_pager_icon" src={iconCaretLeft} alt="" aria-hidden="true" />
            </button>
          </div>

          <span className="comment_pager_label" aria-label="현재 페이지">
            {sortedComments.length === 0 ? "0/0" : `${safePageIndex + 1}/${maxPageIndex + 1}`}
          </span>

          <div className="comment_pager_right" aria-label="다음/마지막 페이지">
            <button
              type="button"
              className="comment_pager_button"
              onClick={goToNextPage}
              disabled={!canGoNext}
              aria-label="다음 페이지"
            >
              <img className="comment_pager_icon is_flipped" src={iconCaretLeft} alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="comment_pager_button"
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
