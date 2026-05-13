import { useLayoutEffect, useMemo } from "react"
import { useLocation, useNavigate } from "react-router"

import iconCaretLeft from "../assets/svg/caretleft.svg"
import CommunityReviewCard from "../components/CommunityReviewCard"
import "../styles/community.css"
import {
  deriveCommunityTagBundle,
  extractPairingTitle,
  feedPosts,
  matchesCommunityTag,
  type CommunityTagType,
  type FeedPost,
} from "../utils/communityPosts"
import { getPairingTierByUserId, getPairingTierLabelByUserId } from "../utils/pairingTier"
import type { PairingDetailNavState } from "../utils/pairingDetail"
import { getTierClassName } from "../utils/tier"
import { usersMockById } from "../utils/usersMock"

type NavState = {
  tagType: CommunityTagType
  tagValue: string
  bottomNavActive?: "category"
}

function getReviewLinkState(post: FeedPost, bottomNavActive?: "category"): PairingDetailNavState {
  const pairingTitle = extractPairingTitle(post.title)
  const authorId = post.authorId
  const authorName = usersMockById[authorId]?.name ?? post.authorName ?? "익명"
  const tagBundle = deriveCommunityTagBundle({
    pairingTitle,
    title: post.title,
    drinkType: post.drinkType ?? "",
    foods: post.foods,
    features: post.features,
  })

  return {
    pairingTitle,
    body: post.body,
    pairingSummary: post.pairingSummary ?? "",
    authorId,
    authorName,
    profile: usersMockById[authorId]?.profile ?? "",
    locationLabel: post.locationLabel ?? "",
    drinkType: post.drinkType ?? "",
    foods: post.foods,
    features: tagBundle.featureTags,
    source: "feed",
    feedFilter: "review",
    hideDetailSections: true,
    bottomNavActive,
  }
}

export default function PairingTagList() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as Partial<NavState>
  const tagType = state.tagType
  const tagValue = state.tagValue?.trim() ?? ""
  const bottomNavActive = state.bottomNavActive

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
    <section className="community_page page_screen" aria-label="태그 글">
      <header className="tag_list_header" aria-label="태그 글 헤더">
        <button type="button" className="tag_list_back" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <img src={iconCaretLeft} alt="" aria-hidden="true" />
        </button>
        <h3 className="tag_list_title">{tagValue || "태그 글"}</h3>
      </header>

      <div className="feed_cards" aria-label="태그 글 목록">
        {filtered.length === 0 ? (
          <p className="tag_list_empty" role="status">
            관련 글이 없어요.
          </p>
        ) : (
          filtered.map((post) => {
            const pairingTitle = extractPairingTitle(post.title)
            const authorId = post.authorId
            const authorName = usersMockById[authorId]?.name ?? post.authorName ?? "익명"
            const profile = usersMockById[authorId]?.profile ?? ""
            const tagBundle = deriveCommunityTagBundle({
              pairingTitle,
              title: post.title,
              drinkType: post.drinkType ?? "",
              foods: post.foods,
              features: post.features,
            })
            const linkState = getReviewLinkState(post, bottomNavActive)

            return (
              <CommunityReviewCard
                key={post.id}
                postId={post.id}
                authorId={authorId}
                authorName={authorName}
                authorMeta={profile}
                badgeClassName={getTierClassName(getPairingTierByUserId(authorId), "feed_post_badge")}
                badgeText={getPairingTierLabelByUserId(authorId)}
                followButtonClassName="follow_toggle_button"
                followAriaLabel="팔로우"
                followText="팔로우"
                onToggleFollow={() => {}}
                linkTo={`/community/pairing/${post.id}`}
                linkState={linkState}
                title={post.pairingSummary ?? post.title}
                pairingTitle={pairingTitle}
                body={post.body}
                liquorTag={tagBundle.liquorTag}
                foodTag={tagBundle.foodTag}
                photoIds={post.photoIds}
                hashtags={post.searchTags ?? tagBundle.featureTags}
                locationLabel={post.locationLabel ?? ""}
                likeActive={false}
                likeAriaLabel="좋아요"
                likeText={`${post.likeCount}`}
                onToggleLike={() => {}}
                commentText={`${post.commentCount}`}
                onViewComments={() => navigate(`/community/pairing/${post.id}`, { state: linkState })}
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
