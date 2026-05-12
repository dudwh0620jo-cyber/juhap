import { useLayoutEffect, useMemo } from "react"
import { useLocation, useNavigate } from "react-router"

import RelatedContentPostCard from "../components/RelatedContentPostCard"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import "../styles/community.css"
import { getPairingTierByUserId, getPairingTierLabelByUserId } from "../utils/pairingTier"
import { getTierClassName } from "../utils/tier"
import { extractPairingTitle, feedPosts, matchesCommunityTag, type CommunityTagType } from "../utils/communityPosts"
import { currentUserMock, usersMockById } from "../utils/usersMock"

type TagType = CommunityTagType

type NavState = {
  tagType: TagType
  tagValue: string
}

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

    return feedPosts.filter((post) => {
      if (post.isQna) return false
      return matchesCommunityTag(post, tagType, tagValue)
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
          filtered.map((item) => {
            const pairingTitle = extractPairingTitle(item.title)
            return (
            <RelatedContentPostCard
              key={item.id}
              postId={item.id}
              showImages={item.authorId === currentUserMock.id ? Boolean(item.photoIds?.length) : true}
              imageCount={item.authorId === currentUserMock.id ? Math.min(3, item.photoIds?.length ?? 0) : 2}
              authorName={usersMockById[item.authorId]?.name ?? "익명"}
              profile={usersMockById[item.authorId]?.profile ?? ""}
              badgeClassName={getTierClassName(getPairingTierByUserId(item.authorId), "feed_post_badge")}
              badgeText={getPairingTierLabelByUserId(item.authorId)}
              followButtonClassName="follow_toggle_button"
              followAriaLabel="팔로우"
              followText="팔로우"
              onToggleFollow={() => {}}
              linkTo={`/community/pairing/${item.id}`}
              linkState={{
                pairingTitle,
                authorId: item.authorId,
                authorName: usersMockById[item.authorId]?.name ?? "익명",
                profile: usersMockById[item.authorId]?.profile ?? "",
                locationLabel: item.locationLabel,
                drinkType: item.drinkType,
                features: item.features ?? [],
                source: "feed",
              }}
              title={pairingTitle}
              body={`${item.locationLabel} 분위기에서 즐긴 조합이에요.`}
              likeActive={false}
              likeAriaLabel="좋아요"
              likeText="0"
              onToggleLike={() => {}}
              commentText="0"
              onViewComments={() =>
                navigate(`/community/pairing/${item.id}`, {
                  state: {
                    pairingTitle,
                    authorId: item.authorId,
                    authorName: usersMockById[item.authorId]?.name ?? "익명",
                    profile: usersMockById[item.authorId]?.profile ?? "",
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
            )
          })
        )}
      </div>
    </section>
  )
}
