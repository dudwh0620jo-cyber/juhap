import { useLayoutEffect, useMemo } from "react"
import { useLocation, useNavigate } from "react-router"

import RelatedContentPostCard from "../components/RelatedContentPostCard"
import iconCaretLeft from "../imgs/svg/caretleft.svg"
import "../styles/community.css"

type TagType = "liquor" | "food"

type NavState = {
  tagType: TagType
  tagValue: string
}

type PairingItem = {
  id: number
  pairingTitle: string
  authorId: number
  authorName: string
  profile: string
  locationLabel: string
  drinkType: string
}

const pairingTiersByAuthorId: Record<number, 1 | 2 | 3 | 4 | 5> = {
  2001: 2,
  2002: 3,
  2003: 4,
  2004: 2,
  2101: 1,
  2102: 2,
  2103: 2,
  2104: 3,
  9999: 1,
}

const pairingTierLabels: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "뉴비 맛잘알",
  2: "찐조합러",
  3: "미식 탐험가",
  4: "페어링 고수",
  5: "조합 장인",
}

const getTierClassNameByUserId = (userId: number) => {
  const tier = pairingTiersByAuthorId[userId] ?? 1
  return `feed_post_badge is_tier${tier}`
}

const getTierLabelByUserId = (userId: number) => {
  const tier = pairingTiersByAuthorId[userId] ?? 1
  return pairingTierLabels[tier]
}

const pairingsMock: PairingItem[] = [
  {
    id: 1000,
    pairingTitle: "라거 + 감자튀김",
    authorId: 2103,
    authorName: "지민",
    profile: "20대 / 광주 / 맥주 · 페어링",
    locationLabel: "퇴근 후 소파 앞",
    drinkType: "맥주",
  },
  {
    id: 1010,
    pairingTitle: "라거 + 치킨",
    authorId: 2002,
    authorName: "현우",
    profile: "20대 / 대전 / 맥주 러버",
    locationLabel: "치맥은 진리",
    drinkType: "맥주",
  },
  {
    id: 1011,
    pairingTitle: "하이볼 + 삼겹살",
    authorId: 2003,
    authorName: "서연",
    profile: "30대 / 서울 / 소주 · 맥주 선호",
    locationLabel: "아늑한 내방",
    drinkType: "기타",
  },
  {
    id: 1002,
    pairingTitle: "막걸리 + 해물파전",
    authorId: 2001,
    authorName: "민지",
    profile: "20대 / 부산 / 전통주 입문",
    locationLabel: "비 오는 베란다",
    drinkType: "전통주",
  },
  {
    id: 1006,
    pairingTitle: "IPA + 햄버거",
    authorId: 2002,
    authorName: "현우",
    profile: "20대 / 대전 / 맥주 러버",
    locationLabel: "늦은 밤은 걷는다",
    drinkType: "맥주",
  },
  {
    id: 1005,
    pairingTitle: "레드 와인 + 스테이크",
    authorId: 2001,
    authorName: "민지",
    profile: "30대 / 서울 / 단맛 선호",
    locationLabel: "여행지 근처",
    drinkType: "와인",
  },
  {
    id: 1009,
    pairingTitle: "하이볼 + 치킨",
    authorId: 2102,
    authorName: "도윤",
    profile: "30대 / 대구 / 위스키 입문",
    locationLabel: "친구들과 홈파티",
    drinkType: "기타",
  },
  {
    id: 1012,
    pairingTitle: "소주 + 족발",
    authorId: 2101,
    authorName: "유나",
    profile: "20대 / 서울 / 깔끔하고 은은한 맛 선호",
    locationLabel: "동네 포장마차",
    drinkType: "소주",
  },
]

export default function PairingTagList() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as Partial<NavState>
  const tagType = state.tagType
  const tagValue = state.tagValue?.trim() ?? ""

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const filtered = useMemo(() => {
    if (!tagType || !tagValue) return []
    const normalizedTag = tagValue.replace(/\s+/g, "").toLowerCase()
    return pairingsMock.filter((item) => {
      const [liquorRaw, foodRaw] = item.pairingTitle.split("+").map((value) => value.trim())
      const liquor = (liquorRaw ?? "").replace(/\s+/g, "").toLowerCase()
      const food = (foodRaw ?? "").replace(/\s+/g, "").toLowerCase()
      if (tagType === "liquor") return liquor === normalizedTag || liquor.includes(normalizedTag)
      return food === normalizedTag || food.includes(normalizedTag)
    })
  }, [tagType, tagValue])

  return (
    <section className="community_page page_screen" aria-label="태그 관련 글">
      <header className="tag_list_header" aria-label="관련 글 헤더">
        <button type="button" className="tag_list_back" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <img src={iconCaretLeft} alt="" aria-hidden="true" />
        </button>
        <h3 className="tag_list_title">{tagValue || "관련 글"}</h3>
      </header>

      <div className="feed_cards" aria-label="관련 글 목록">
        {filtered.length === 0 ? (
          <p className="tag_list_empty" role="status">
            관련 글이 없어요
          </p>
        ) : (
          filtered.map((item) => (
            <RelatedContentPostCard
              key={item.id}
              postId={item.id}
              authorName={item.authorName}
              profile={item.profile}
              badgeClassName={getTierClassNameByUserId(item.authorId)}
              badgeText={getTierLabelByUserId(item.authorId)}
              followButtonClassName="follow_toggle_button"
              followAriaLabel="팔로우"
              followText="팔로우"
              onToggleFollow={() => {}}
              linkTo={`/community/pairing/${item.id}`}
              linkState={{
                pairingTitle: item.pairingTitle,
                authorId: item.authorId,
                authorName: item.authorName,
                profile: item.profile,
                locationLabel: item.locationLabel,
                drinkType: item.drinkType,
                source: "feed",
              }}
              title={item.pairingTitle}
              body={`${item.locationLabel} 분위기에서 즐긴 조합이에요.`}
              likeActive={false}
              likeAriaLabel="좋아요"
              likeText="0"
              onToggleLike={() => {}}
              commentText="0"
              onViewComments={() =>
                navigate(`/community/pairing/${item.id}`, {
                  state: {
                    pairingTitle: item.pairingTitle,
                    authorId: item.authorId,
                    authorName: item.authorName,
                    profile: item.profile,
                    locationLabel: item.locationLabel,
                    drinkType: item.drinkType,
                    source: "feed",
                  },
                })
              }
              bookmarkActive={false}
              bookmarkAriaLabel="북마크"
              onOpenBookmarkPicker={() => {}}
            />
          ))
        )}
      </div>
    </section>
  )
}
