import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"

import AlertModal from "./AlertModal"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import iconCaretDoubleRight from "../assets/svg/caretdoubleright.svg"
import iconDots from "../assets/svg/dotsthreevertical.svg"
import iconReplyArrow from "../assets/svg/arrowbenddownright.svg"
import { COMMUNITY_FOLLOWED_USERS_KEY, getPairingCommentsStorageKey } from "../utils/communityStorage"
import { mentionDirectoryMock } from "../utils/usersMock"

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

const isLegacyInitialComments = (items: unknown): items is CommentItem[] => {
  if (!Array.isArray(items)) return false
  if (items.length !== initialComments.length) return false
  return items.every((item, index) => {
    const base = initialComments[index]
    return (
      item &&
      typeof item === "object" &&
      typeof (item as CommentItem).id === "number" &&
      typeof (item as CommentItem).userId === "number" &&
      typeof (item as CommentItem).userName === "string" &&
      typeof (item as CommentItem).userMeta === "string" &&
      typeof (item as CommentItem).text === "string" &&
      (item as CommentItem).userName === base.userName &&
      (item as CommentItem).text === base.text
    )
  })
}

const mockCommentsByPairingId: Record<string, CommentItem[]> = {
  "1001": [
    { id: 1, userId: 2101, userName: "지훈", userMeta: "부산 · 20대", text: "하이볼에 새우깡은 진짜 인정입니다." },
    { id: 2, userId: 2102, userName: "도윤", userMeta: "대구 · 30대", text: "얼음 크게 넣으면 더 깔끔하게 마셔져요." },
  ],
  "1002": [
    { id: 1, userId: 2003, userName: "민지", userMeta: "서울 · 30대", text: "막걸리 향이 해물파전 기름짐 잡아줘요." },
    { id: 2, userId: 2019, userName: "태형", userMeta: "광주 · 20대", text: "비 오는 날에 이 조합이면 끝이죠." },
    { id: 3, userId: 2103, userName: "나연", userMeta: "인천 · 30대", text: "김치전으로 바꿔도 잘 어울릴까요?" },
  ],
  "1005": [
    { id: 1, userId: 2104, userName: "수빈", userMeta: "제주 · 30대", text: "스테이크 굽기 미디움으로 맞추면 최고예요." },
    { id: 2, userId: 2002, userName: "현우", userMeta: "대전 · 20대", text: "탄닌 있는 레드 추천도 부탁해요." },
    { id: 3, userId: 2025, userName: "윤아", userMeta: "서울 · 20대", text: "감자퓨레랑 같이 먹으면 더 맛있더라구요." },
    { id: 4, userId: 2101, userName: "지훈", userMeta: "부산 · 20대", text: "가격대 비슷한 대체 와인도 궁금합니다." },
    { id: 5, userId: 2102, userName: "도윤", userMeta: "대구 · 30대", text: "고기 시즈닝 강하면 와인도 묵직한 게 맞아요." },
  ],
  "1006": [
    { id: 1, userId: 2001, userName: "민지", userMeta: "서울 · 30대", text: "IPA 쓴맛이 치즈 느끼함 잡아주는 게 포인트죠." },
  ],
  "1007": [
    { id: 1, userId: 2103, userName: "나연", userMeta: "인천 · 30대", text: "족발은 마늘이랑 같이 먹어야 진짜죠." },
    { id: 2, userId: 2019, userName: "태형", userMeta: "광주 · 20대", text: "새우젓 찍고 소주 한잔하면 밸런스 좋아요." },
    { id: 3, userId: 2003, userName: "민지", userMeta: "서울 · 30대", text: "매운 무침 곁들이면 더 잘 어울립니다." },
    { id: 4, userId: 2104, userName: "수빈", userMeta: "제주 · 30대", text: "야식으로 이만한 조합이 없어요." },
  ],
  "1009": [
    { id: 1, userId: 2102, userName: "도윤", userMeta: "대구 · 30대", text: "타코엔 라임 계열 칵테일이 제일 깔끔해요." },
    { id: 2, userId: 2025, userName: "윤아", userMeta: "서울 · 20대", text: "데킬라 베이스에 소금 테두리도 추천합니다." },
    { id: 3, userId: 2101, userName: "지훈", userMeta: "부산 · 20대", text: "살사 매운맛이 강하면 단맛 있는 칵테일도 좋아요." },
    { id: 4, userId: 2002, userName: "현우", userMeta: "대전 · 20대", text: "홈파티 메뉴로 바로 가져갈게요." },
    { id: 5, userId: 2103, userName: "나연", userMeta: "인천 · 30대", text: "무알콜 버전도 하나 있으면 좋겠네요." },
    { id: 6, userId: 2019, userName: "태형", userMeta: "광주 · 20대", text: "타코 종류별 추천도 올려주세요." },
  ],
  "1003": [
    { id: 1, userId: 2102, userName: "도윤", userMeta: "대구 · 30대", text: "버번 다음이면 블렌디드부터 가는 게 편해요." },
    { id: 2, userId: 2002, userName: "현우", userMeta: "대전 · 20대", text: "피트향 약한 싱글몰트로 넘어가도 괜찮습니다." },
    { id: 3, userId: 2103, userName: "나연", userMeta: "인천 · 30대", text: "하이볼 위주면 산뜻한 스타일 먼저 드셔보세요." },
    { id: 4, userId: 2025, userName: "윤아", userMeta: "서울 · 20대", text: "입문이면 도수 40도 안팎 제품이 무난했어요." },
    { id: 5, userId: 2019, userName: "태형", userMeta: "광주 · 20대", text: "예산대 알려주시면 더 구체적으로 추천 가능해요." },
  ],
  "1004": [
    { id: 1, userId: 2101, userName: "지훈", userMeta: "부산 · 20대", text: "명란구이+오이는 준비도 쉽고 사케랑 잘 맞아요." },
    { id: 2, userId: 2003, userName: "민지", userMeta: "서울 · 30대", text: "두부김치도 의외로 괜찮았어요. 너무 맵지만 않게요." },
    { id: 3, userId: 2104, userName: "수빈", userMeta: "제주 · 30대", text: "연어구이 소량으로 곁들이는 것도 추천합니다." },
    { id: 4, userId: 2002, userName: "현우", userMeta: "대전 · 20대", text: "전자레인지 가능한 안주면 계란찜도 좋아요." },
  ],
  "1008": [
    { id: 1, userId: 2102, userName: "도윤", userMeta: "대구 · 30대", text: "기름진 회면 사케, 담백한 흰살생선이면 화이트와인 추천해요." },
    { id: 2, userId: 2103, userName: "나연", userMeta: "인천 · 30대", text: "와사비 강하면 사케 쪽이 더 부드럽게 잡아주더라구요." },
    { id: 3, userId: 2001, userName: "민지", userMeta: "서울 · 30대", text: "산미 원하는 날은 화이트, 감칠맛 원하면 사케로 고릅니다." },
    { id: 4, userId: 2019, userName: "태형", userMeta: "광주 · 20대", text: "둘 다 두고 회 종류별로 번갈아 마셔도 재밌어요." },
    { id: 5, userId: 2025, userName: "윤아", userMeta: "서울 · 20대", text: "가격 맞추기 쉬운 건 사케 쪽이었어요." },
    { id: 6, userId: 2101, userName: "지훈", userMeta: "부산 · 20대", text: "광어/도미는 화이트, 참치 뱃살은 사케가 좋았습니다." },
  ],
  "1011": [
    { id: 1, userId: 2003, userName: "민지", userMeta: "서울 · 30대", text: "입문이면 40~43도 버번이 가장 무난했어요." },
    { id: 2, userId: 2104, userName: "수빈", userMeta: "제주 · 30대", text: "다크초콜릿은 카카오 70% 전후가 잘 맞더라구요." },
    { id: 3, userId: 2102, userName: "도윤", userMeta: "대구 · 30대", text: "버번이 달면 초콜릿은 너무 달지 않은 걸 추천합니다." },
    { id: 4, userId: 2002, userName: "현우", userMeta: "대전 · 20대", text: "소량씩 번갈아 먹으면 밸런스 잡기 쉬워요." },
    { id: 5, userId: 2103, userName: "나연", userMeta: "인천 · 30대", text: "초콜릿 먼저 한 입 먹고 버번 마시면 좋았어요." },
    { id: 6, userId: 2019, userName: "태형", userMeta: "광주 · 20대", text: "입문용으로는 바닐라 향 나는 버번도 괜찮습니다." },
    { id: 7, userId: 2101, userName: "지훈", userMeta: "부산 · 20대", text: "도수 부담되면 큰 얼음 한 개 넣어서 드셔보세요." },
  ],
  "1012": [
    { id: 1, userId: 2103, userName: "나연", userMeta: "인천 · 30대", text: "맥주는 라거/IPA 반반 준비하면 대부분 좋아해요." },
    { id: 2, userId: 2001, userName: "민지", userMeta: "서울 · 30대", text: "전통주는 막걸리+전 조합이 실패가 적었습니다." },
    { id: 3, userId: 2102, userName: "도윤", userMeta: "대구 · 30대", text: "와인은 화이트 1, 레드 1 정도가 안전해요." },
    { id: 4, userId: 2002, userName: "현우", userMeta: "대전 · 20대", text: "안주는 짠맛/담백한 맛 둘 다 준비하면 좋아요." },
    { id: 5, userId: 2101, userName: "지훈", userMeta: "부산 · 20대", text: "처음엔 도수 낮은 술부터 내는 순서 추천합니다." },
    { id: 6, userId: 2025, userName: "윤아", userMeta: "서울 · 20대", text: "예산 정해두고 병 수를 먼저 계산하면 편해요." },
    { id: 7, userId: 2104, userName: "수빈", userMeta: "제주 · 30대", text: "무알콜 음료 1~2개 같이 두면 만족도 높아요." },
  ],
  "90001": [
    { id: 1, userId: 2102, userName: "도윤", userMeta: "대구 · 30대", text: "사시미랑 준마이 다이긴죠 조합은 진짜 깔끔하네요." },
    { id: 2, userId: 2104, userName: "수빈", userMeta: "제주 · 30대", text: "레몬 한 방울 팁 좋습니다." },
    { id: 3, userId: 2003, userName: "민지", userMeta: "서울 · 30대", text: "간장보다 소금 쪽이 더 어울린다는 말 공감해요." },
    { id: 4, userId: 2025, userName: "윤아", userMeta: "서울 · 20대", text: "다음 모임 메뉴로 그대로 해볼게요." },
    { id: 5, userId: 2101, userName: "지훈", userMeta: "부산 · 20대", text: "사케 온도는 어느 정도가 좋았나요?" },
    { id: 6, userId: 2002, userName: "현우", userMeta: "대전 · 20대", text: "너무 차갑지 않게 마시면 향이 더 살아요." },
    { id: 7, userId: 2103, userName: "나연", userMeta: "인천 · 30대", text: "플레이팅 팁도 공유해주셔서 좋네요." },
  ],
  "90002": [
    { id: 1, userId: 2019, userName: "태형", userMeta: "광주 · 20대", text: "치즈 플래터랑 사케 조합 의외로 잘 맞네요." },
    { id: 2, userId: 2001, userName: "민지", userMeta: "서울 · 30대", text: "브리 치즈 추천 완전 동의합니다." },
    { id: 3, userId: 2102, userName: "도윤", userMeta: "대구 · 30대", text: "견과류 추가하면 식감이 확실히 살아나요." },
    { id: 4, userId: 2104, userName: "수빈", userMeta: "제주 · 30대", text: "홈파티 메뉴로 딱이에요." },
    { id: 5, userId: 2101, userName: "지훈", userMeta: "부산 · 20대", text: "가격대 비슷한 대체 사케도 궁금합니다." },
    { id: 6, userId: 2002, userName: "현우", userMeta: "대전 · 20대", text: "짠 치즈보다 순한 치즈가 더 낫더라구요." },
    { id: 7, userId: 2025, userName: "윤아", userMeta: "서울 · 20대", text: "저도 다음엔 이 조합으로 준비해볼게요." },
    { id: 8, userId: 2103, userName: "나연", userMeta: "인천 · 30대", text: "크래커랑 과일도 같이 두면 더 좋아요." },
  ],
  "90003": [
    { id: 1, userId: 2003, userName: "민지", userMeta: "서울 · 30대", text: "굴 초회랑 사케는 산뜻해서 좋네요." },
    { id: 2, userId: 2101, userName: "지훈", userMeta: "부산 · 20대", text: "비린 향 잡는 팁 덕분에 따라하기 쉬워요." },
    { id: 3, userId: 2019, userName: "태형", userMeta: "광주 · 20대", text: "차갑게 칠링해서 마셔봐야겠어요." },
  ],
}

type Props = {
  pairingId: string | undefined
  currentUser: { id: number; name: string; meta: string }
  getTierClassName: (userId: number) => string
  getTierLabel: (userId: number) => string
  onCountChange: (count: number) => void
  emptyByDefault?: boolean
}

const PAGE_SIZE = 5

type MentionUser = { id: number; name: string; meta: string }
type MentionContext = { start: number; end: number; query: string }

export default function CommentSection({
  pairingId,
  currentUser,
  getTierClassName,
  getTierLabel,
  onCountChange,
  emptyByDefault,
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
    if (!pairingId) return emptyByDefault ? [] : initialComments
    try {
      const raw = window.localStorage.getItem(getPairingCommentsStorageKey(pairingId))
      if (!raw) return emptyByDefault ? [] : mockCommentsByPairingId[pairingId] ?? initialComments
      const parsed = JSON.parse(raw)
      if (isLegacyInitialComments(parsed)) {
        return emptyByDefault ? [] : mockCommentsByPairingId[pairingId] ?? initialComments
      }
      if (!Array.isArray(parsed)) return emptyByDefault ? [] : mockCommentsByPairingId[pairingId] ?? initialComments
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
      return emptyByDefault ? [] : (pairingId ? mockCommentsByPairingId[pairingId] ?? initialComments : initialComments)
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

  const placeholderRowCount = Math.max(0, PAGE_SIZE - visibleComments.length)

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
    for (const user of mentionDirectoryMock) userById.set(user.id, user)
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
  const goToFirstPage = () => setPageIndex(0)

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
                          대댓글달기
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
                    <p className="comment_reply_line">
                      <span className="comment_reply_meta" aria-label="대댓글 대상">
                        <img className="comment_reply_icon" src={iconReplyArrow} alt="" aria-hidden="true" />@
                        {item.replyTo.userName}
                      </span>
                      <span className="comment_reply_text">{item.text}</span>
                    </p>
                  ) : (
                    <p>{item.text}</p>
                  )}
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

        {placeholderRowCount > 0
          ? Array.from({ length: placeholderRowCount }).map((_, index) => (
              <div className="comment_row is_placeholder" key={`comment-placeholder-${pageIndex}-${index}`} aria-hidden="true">
                <div className="avatar" />
                <div>
                  <div className="comment_header_row">
                    <h4>
                      &nbsp;<span className="comment_meta">&nbsp;</span>
                      <span className={getTierClassName(currentUser.id)}>{getTierLabel(currentUser.id)}</span>
                    </h4>
                  </div>
                  <p>&nbsp;</p>
                </div>
              </div>
            ))
          : null}

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
