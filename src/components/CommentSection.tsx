import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"

import AlertModal from "./AlertModal"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconDots from "../assets/svg/dotsthreevertical.svg"
import iconReplyArrow from "../assets/svg/arrowbenddownright.svg"

const getPairingCommentsStorageKey = (pairingId: string) => `pairing_detail_comments_${pairingId}`
const COMMUNITY_FOLLOWED_USERS_KEY = "community_followed_user_ids"

type CommentItem = {
  id: number
  userId: number
  userName: string
  userMeta: string
  text: string
  replyTo?: { userName: string; commentId: number }
}

const initialComments: CommentItem[] = [
  { id: 1, userId: 2001, userName: "민지", userMeta: "서울 · 30대", text: "이 조합 진짜 맛있겠는데요. 저장해둘게요!" },
  { id: 2, userId: 2002, userName: "현우", userMeta: "대전 · 20대", text: "다음 주말 메뉴로 그대로 따라가 볼게요." },
  { id: 3, userId: 2104, userName: "수빈", userMeta: "제주 · 30대", text: "스테이크랑 레드/샤프한 거 조합이 정답 같아요." },
  { id: 4, userId: 2102, userName: "도윤", userMeta: "대구 · 30대", text: "오늘 저녁에 바로 실천합니다." },
]

type Props = {
  pairingId: string | undefined
  currentUser: { id: number; name: string; meta: string }
  getTierClassName: (userId: number) => string
  getTierLabel: (userId: number) => string
  onCountChange: (count: number) => void
}

const PAGE_SIZE = 5

type MentionUser = { id: number; name: string; meta: string }
type MentionContext = { start: number; end: number; query: string }

const mentionDirectory: MentionUser[] = [
  { id: 2001, name: "민지", meta: "서울 · 30대" },
  { id: 2002, name: "현우", meta: "대전 · 20대" },
  { id: 2003, name: "서연", meta: "경기 · 30대" },
  { id: 2004, name: "지훈", meta: "인천 · 20대" },
  { id: 2101, name: "유나", meta: "서울 · 20대" },
  { id: 2102, name: "도윤", meta: "대구 · 30대" },
  { id: 2103, name: "지민", meta: "광주 · 20대" },
  { id: 2104, name: "수빈", meta: "제주 · 30대" },
]

export default function CommentSection({
  pairingId,
  currentUser,
  getTierClassName,
  getTierLabel,
  onCountChange,
}: Props) {
  const [commentValue, setCommentValue] = useState("")
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentValue, setEditingCommentValue] = useState("")
  const [openMenuCommentId, setOpenMenuCommentId] = useState<number | null>(null)
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
  const getActiveInput = () => (inlineReplyCommentId !== null ? inlineInputRef.current : mainInputRef.current)

  const commentsStorageKey = useMemo(
    () => (pairingId ? getPairingCommentsStorageKey(pairingId) : null),
    [pairingId],
  )

  const [commentItems, setCommentItems] = useState<CommentItem[]>(() => {
    if (!pairingId) return initialComments
    try {
      const raw = window.localStorage.getItem(getPairingCommentsStorageKey(pairingId))
      if (!raw) return initialComments
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return initialComments
      return parsed.filter(
        (item): item is CommentItem =>
          item &&
          typeof item === "object" &&
          typeof item.id === "number" &&
          typeof item.userId === "number" &&
          typeof item.userName === "string" &&
          typeof item.userMeta === "string" &&
          typeof item.text === "string",
      )
    } catch {
      return initialComments
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

  useEffect(() => {
    setPageIndex((prev) => Math.min(prev, maxPageIndex))
  }, [pageIndex, maxPageIndex])

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

  useEffect(() => {
    setOpenMenuCommentId(null)
    setEditingCommentId(null)
    setEditingCommentValue("")
    setInlineReplyCommentId(null)
  }, [pageIndex])

  const visibleComments = useMemo(() => {
    const start = pageIndex * PAGE_SIZE
    return sortedComments.slice(start, start + PAGE_SIZE)
  }, [pageIndex, sortedComments])

  useLayoutEffect(() => {
    if (!commentsStorageKey) return
    try {
      window.localStorage.setItem(commentsStorageKey, JSON.stringify(commentItems))
    } catch {
      // ignore storage errors
    }
    onCountChange(commentItems.length)
  }, [commentItems, commentsStorageKey, onCountChange])

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
    return { userName: target.userName, commentId: target.id } as const
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
    for (const user of mentionDirectory) userById.set(user.id, user)
    for (const item of commentItems) {
      if (!userById.has(item.userId)) {
        userById.set(item.userId, { id: item.userId, name: item.userName, meta: item.userMeta })
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
            return target ? ({ userName: target.userName, commentId: target.id } as const) : null
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
        text: storedText,
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

  const goToPrevPage = () => setPageIndex((prev) => Math.max(0, prev - 1))
  const goToNextPage = () => setPageIndex((prev) => Math.min(maxPageIndex, prev + 1))

  const canGoPrev = pageIndex > 0
  const canGoNext = pageIndex < maxPageIndex

  return (
    <>
      {alertMessage ? <AlertModal message={alertMessage} onConfirm={() => setAlertMessage(null)} /> : null}
      <div
        className="comment_list"
        id="comments"
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
        {visibleComments.map((item) => (
          <div className={item.replyTo ? "comment_row is_reply" : "comment_row"} key={item.id}>
            <div className="avatar" />
            <div>
              <div className="comment_header_row">
                <h4>
                  {item.userName} <span className="comment_meta">{item.userMeta}</span>
                  <span className={getTierClassName(item.userId)}>{getTierLabel(item.userId)}</span>
                </h4>

                {item.userId === currentUser.id ? (
                  <div className="comment_actions">
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

                    {openMenuCommentId === item.id ? (
                      <div className="comment_menu" role="menu" aria-label="댓글 메뉴">
                        <button type="button" role="menuitem" onClick={() => startEdit(item)}>
                          수정
                        </button>
                        <button type="button" role="menuitem" onClick={() => removeComment(item.id)}>
                          삭제
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="comment_actions">
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

                    {openMenuCommentId === item.id ? (
                      <div className="comment_menu" role="menu" aria-label="댓글 메뉴">
                        <button type="button" role="menuitem" onClick={() => mentionFromComment(item)}>
                          멘션하기
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

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
              ) : (
                <>
                  {item.replyTo ? (
                    <p className="comment_reply_meta" aria-label="대댓글 대상">
                      <img className="comment_reply_icon" src={iconReplyArrow} alt="" aria-hidden="true" />@
                      {item.replyTo.userName}
                    </p>
                  ) : null}
                  <p>{item.text}</p>
                </>
              )}

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
        ))}

        <div className="comment_pager comment_pager_bottom" aria-label="댓글 페이지 이동">
          <div className="comment_pager_left" aria-label="처음/이전 페이지">
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
            {sortedComments.length === 0 ? "0/0" : `${pageIndex + 1}/${maxPageIndex + 1}`}
          </span>

          <button
            type="button"
            className="comment_pager_button"
            onClick={goToNextPage}
            disabled={!canGoNext}
            aria-label="다음 페이지"
          >
            <img className="comment_pager_icon is_flipped" src={iconCaretLeft} alt="" aria-hidden="true" />
          </button>
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
    </>
  )
}
