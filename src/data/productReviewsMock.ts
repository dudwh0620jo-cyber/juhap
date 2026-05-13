import imgDrinkReviewProfile1 from "../assets/fd_drink_review_profile1.png"
import imgDrinkReviewProfile2 from "../assets/fd_drink_review_profile2.png"
import imgDrinkReviewProfile3 from "../assets/fd_drink_review_profile3.png"
import imgDrinkReviewProfile4 from "../assets/fd_drink_review_profile4.png"
import imgDrinkReviewProfile5 from "../assets/fd_drink_review_profile5.png"
import imgDrinkReview1 from "../assets/fd_drink_review_img1.png"
import imgDrinkReview2 from "../assets/fd_drink_review_img2.png"
import imgDrinkReview3 from "../assets/fd_drink_review_img3.png"
import { feedPosts, type FeedPost } from "../utils/communityPosts"
import type { DrinkReview } from "../utils/productReviews"
import { resolveReviewImage } from "../utils/reviewImages"
import { resolveUserAvatar } from "../utils/userAvatars"
import { usersMockById } from "../utils/usersMock"

const productPairingReviewIds = [1101, 1102]
const productReviewAuthorGradeByUserId: Record<number, string> = {
  2119: "셀렉터",
  2120: "셀렉터",
}

const toProductPairingReview = (post: FeedPost): DrinkReview => {
  const user = usersMockById[post.authorId]

  return {
    id: `pairing-review-${post.id}`,
    pairingPostId: post.id,
    title: post.pairingSummary?.trim() || post.title,
    body: post.body,
    tags: post.searchTags ?? [],
    images: (post.photoIds ?? []).map((photoId) => resolveReviewImage(photoId)).filter((src): src is string => Boolean(src)),
    likes: post.likeCount,
    comments: post.commentCount,
    rating: (post.rating ?? 5).toFixed(1),
    createdAt: post.createdAt,
    recommendScore: post.popularityScore,
    alcoholTag: post.title.split("+")[0]?.trim(),
    foodTag: post.title.split("+")[1]?.trim() || post.foods?.[0],
    location: post.locationLabel,
    author: {
      name: user?.name ?? post.authorName ?? "익명",
      grade: productReviewAuthorGradeByUserId[post.authorId] ?? "리뷰어",
      preference: user?.profile ?? "",
      avatar: resolveUserAvatar(post.authorId) ?? "",
    },
  }
}

const productPairingReviews = productPairingReviewIds
  .map((id) => feedPosts.find((post) => post.id === id))
  .filter((post): post is FeedPost => Boolean(post))
  .map(toProductPairingReview)

export const drinkReviews: DrinkReview[] = [
  {
    id: "review-photo-1",
    title: "과일향이 은근하게 오래 남는 한 잔",
    body:
      "첫 향에서 배랑 멜론 같은 산뜻한 느낌이 살짝 올라오고, 마셨을 때 단맛이 과하게 남지 않아서 좋았어요. 차갑게 두고 천천히 마시니까 향이 더 또렷해졌고, 회나 담백한 안주랑 같이 두면 장점이 잘 살아나는 술이었습니다.",
    tags: ["#과일향", "#깔끔함", "#프리미엄", "#드라이"],
    images: [],
    likes: 542,
    comments: 253,
    rating: "5.0",
    createdAt: "2026-05-10T12:00:00+09:00",
    recommendScore: 98,
    author: {
      name: "순대렐라",
      grade: "테이스터",
      preference: "20대 / 여 / 사케, 화이트와인 / 은은한 과일향 선호",
      avatar: imgDrinkReviewProfile1,
    },
  },
  {
    id: "review-text-1",
    title: "회식 자리 분위기까지 좋아졌던 사케",
    body:
      "회식 자리에서 마셨는데 생각보다 훨씬 부담 없이 잘 들어갔어요. 향이 과하게 튀지 않고 드라이하게 정리돼서 술 잘 못 마시는 사람들도 반응이 괜찮았습니다. 가격대는 있지만 깔끔한 맛 덕분에 기름진 안주랑도 잘 어울렸어요.",
    tags: ["#과일향", "#부드러움"],
    images: [imgDrinkReview3],
    likes: 235,
    comments: 58,
    rating: "5.0",
    createdAt: "2026-05-12T09:00:00+09:00",
    recommendScore: 78,
    author: {
      name: "벼랑위의 당뇨",
      grade: "소믈리에",
      preference: "30대 / 남 / 사케, 와인 / 깔끔하고 드라이한 맛 선호",
      avatar: imgDrinkReviewProfile4,
    },
  },
  {
    id: "review-text-2",
    title: "입문자도 편하게 마실 수 있었어요",
    body:
      "사케를 자주 마시는 편은 아닌데 첫 잔부터 부담이 크지 않았어요. 단맛이 아주 강한 타입은 아니지만 목넘김이 부드러워서 천천히 마시기 좋았고, 끝에 남는 쌀향도 깔끔해서 입문용으로 추천하고 싶습니다.",
    tags: ["#과일향", "#부드러움"],
    images: [],
    likes: 235,
    comments: 58,
    rating: "5.0",
    createdAt: "2026-05-09T18:00:00+09:00",
    recommendScore: 84,
    author: {
      name: "이웃집 또터러",
      grade: "입문러",
      preference: "20대 / 남 / 사케 / 부담 없는 단맛과 부드러운 목넘김 선호",
      avatar: imgDrinkReviewProfile3,
    },
  },
  {
    id: "review-photo-2",
    title: "음식이랑 먹을 때 더 매력적이에요",
    body:
      "그냥 마셔도 괜찮지만 음식이랑 같이 먹을 때 훨씬 좋았어요. 생선구이나 가벼운 튀김처럼 기름기가 있는 안주를 깔끔하게 잡아주고, 향은 튀지 않아서 식사 흐름을 방해하지 않았습니다.",
    tags: ["#드라이", "#깔끔함"],
    images: [imgDrinkReview1, imgDrinkReview2],
    likes: 198,
    comments: 41,
    rating: "5.0",
    createdAt: "2026-05-11T21:00:00+09:00",
    recommendScore: 91,
    author: {
      name: "엄마곗돈",
      grade: "리뷰어",
      preference: "30대 / 여 / 사케, 맥주 / 음식과 잘 맞는 깔끔한 술 선호",
      avatar: imgDrinkReviewProfile2,
    },
  },
  {
    id: "review-text-3",
    title: "산뜻한 향 뒤에 여운이 길게 남아요",
    body:
      "처음에는 산뜻하고 깨끗한 인상이 강한데, 마시고 나면 쌀의 단정한 여운이 생각보다 길게 남습니다. 위스키처럼 강한 임팩트보다 균형 잡힌 향과 마무리를 보는 분들에게 잘 맞을 것 같아요.",
    tags: ["#과일향", "#부드러움"],
    images: [],
    likes: 235,
    comments: 58,
    rating: "5.0",
    createdAt: "2026-05-08T16:30:00+09:00",
    recommendScore: 72,
    author: {
      name: "달려야하니",
      grade: "탐험가",
      preference: "40대 / 남 / 사케, 위스키 / 산뜻한 향과 긴 여운 선호",
      avatar: imgDrinkReviewProfile5,
    },
  },
  ...productPairingReviews,
]
