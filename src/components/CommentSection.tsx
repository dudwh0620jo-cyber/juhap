import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"

import iconDots from "../imgs/svg/dotsthreevertical.svg"

const getPairingCommentsStorageKey = (pairingId: string) => `pairing_detail_comments_${pairingId}`

type CommentItem = {
  id: number
  userId: number
  userName: string
  userMeta: string
  text: string
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

export default function CommentSection({
  pairingId,
  currentUser,
  getTierClassName,
  getTierLabel,
  onCountChange,
}: Props) {
  const [commentValue, setCommentValue] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentValue, setEditingCommentValue] = useState("")
  const [openMenuCommentId, setOpenMenuCommentId] = useState<number | null>(null)

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

  const nextId = useMemo(
    () => commentItems.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
    [commentItems],
  )

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = commentValue.trim()
    if (!trimmed) return

    setCommentItems((prev) => [
      ...prev,
      { id: nextId, userId: currentUser.id, userName: currentUser.name, userMeta: currentUser.meta, text: trimmed },
    ])
    setCommentValue("")
  }

  const startEdit = (item: CommentItem) => {
    setEditingCommentId(item.id)
    setEditingCommentValue(item.text)
    setOpenMenuCommentId(null)
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

  return (
    <>
      <div className="comment_list" id="comments">
        {commentItems.map((item) => (
          <div className="comment_row" key={item.id}>
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
                ) : null}
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
                <p>{item.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form className="comment_input" onSubmit={handleSubmit}>
        <input
          className="comment_input_field"
          value={commentValue}
          onChange={(event) => setCommentValue(event.target.value)}
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
