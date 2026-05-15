import imgDrinkReview1 from "../assets/fd_drink_review_img1.png"
import imgDrinkReview2 from "../assets/fd_drink_review_img2.png"
import imgDrinkReview3 from "../assets/fd_drink_review_img3.png"
import { feedPosts, type FeedPost } from "../utils/communityPosts"
import type { DrinkReview } from "../utils/productReviews"
import { resolveReviewImage } from "../utils/reviewImages"
import { resolveUserAvatar } from "../utils/userAvatars"
import { usersMockById } from "../utils/usersMock"

const productPairingReviewIds = [1101, 1102]
const getProductReviewAuthor = (authorId: number): DrinkReview["author"] => {
  const user = usersMockById[authorId]

  return {
    name: user?.name ?? "익명",
    grade: user?.grade ?? "리뷰어",
    preference: user?.profile ?? "",
    avatar: resolveUserAvatar(authorId) ?? "",
  }
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
      grade: user?.grade ?? "리뷰어",
      preference: user?.profile ?? "",
      avatar: resolveUserAvatar(post.authorId) ?? "",
    },
  }
}

export const productPairingReviews: DrinkReview[] = productPairingReviewIds
  .map((id) => feedPosts.find((post) => post.id === id))
  .filter((post): post is FeedPost => Boolean(post))
  .map(toProductPairingReview)

const drinkReviewSeeds: Array<Omit<DrinkReview, "author"> & { authorId: number }> = [
  {
    id: "30001",
    title: "과일향이 은근하게 오래 남는 한 잔",
    body:
      "첫 향에서 배랑 멜론 같은 산뜻한 느낌이 살짝 올라오고, 마셨을 때 단맛이 과하게 남지 않아서 좋았어요. 차갑게 두고 천천히 마시니까 향이 더 또렷해졌고, 회나 담백한 안주랑 같이 두면 장점이 잘 살아나는 술이었습니다.",
    tags: ["#과일향", "#깔끔함", "#프리미엄", "#드라이"],
    images: [],
    likes: 542,
    comments: 3,
    rating: "5.0",
    createdAt: "2026-05-10T12:00:00+09:00",
    recommendScore: 98,
    authorId: 3001,
  },
  {
    id: "30002",
    title: "회식 자리 분위기까지 좋아졌던 사케",
    body:
      "회식 자리에서 마셨는데 생각보다 훨씬 부담 없이 잘 들어갔어요. 향이 과하게 튀지 않고 드라이하게 정리돼서 술 잘 못 마시는 사람들도 반응이 괜찮았습니다. 가격대는 있지만 깔끔한 맛 덕분에 기름진 안주랑도 잘 어울렸어요.",
    tags: ["#과일향", "#부드러움"],
    images: [imgDrinkReview3],
    likes: 235,
    comments: 12,
    rating: "5.0",
    createdAt: "2026-05-12T09:00:00+09:00",
    recommendScore: 78,
    authorId: 3002,
  },
  {
    id: "30003",
    title: "입문자도 편하게 마실 수 있었어요",
    body:
      "사케를 자주 마시는 편은 아닌데 첫 잔부터 부담이 크지 않았어요. 단맛이 아주 강한 타입은 아니지만 목넘김이 부드러워서 천천히 마시기 좋았고, 끝에 남는 쌀향도 깔끔해서 입문용으로 추천하고 싶습니다.",
    tags: ["#과일향", "#부드러움"],
    images: [],
    likes: 235,
    comments: 4,
    rating: "5.0",
    createdAt: "2026-05-09T18:00:00+09:00",
    recommendScore: 84,
    authorId: 3003,
  },
  {
    id: "30004",
    title: "음식이랑 먹을 때 더 매력적이에요",
    body:
      "그냥 마셔도 괜찮지만 음식이랑 같이 먹을 때 훨씬 좋았어요. 생선구이나 가벼운 튀김처럼 기름기가 있는 안주를 깔끔하게 잡아주고, 향은 튀지 않아서 식사 흐름을 방해하지 않았습니다.",
    tags: ["#드라이", "#깔끔함"],
    images: [imgDrinkReview1, imgDrinkReview2],
    likes: 198,
    comments: 2,
    rating: "5.0",
    createdAt: "2026-05-11T21:00:00+09:00",
    recommendScore: 91,
    authorId: 3004,
  },
  {
    id: "30005",
    title: "산뜻한 향 뒤에 여운이 길게 남아요",
    body:
      "처음에는 산뜻하고 깨끗한 인상이 강한데, 마시고 나면 쌀의 단정한 여운이 생각보다 길게 남습니다. 위스키처럼 강한 임팩트보다 균형 잡힌 향과 마무리를 보는 분들에게 잘 맞을 것 같아요.",
    tags: ["#과일향", "#부드러움"],
    images: [],
    likes: 235,
    comments: 5,
    rating: "5.0",
    createdAt: "2026-05-08T16:30:00+09:00",
    recommendScore: 72,
    authorId: 3005,
  },
  {
    id: "30006",
    title: "차갑게 마셨을 때 균형이 더 좋았어요",
    body:
      "처음에는 향이 은은해서 가볍게 느껴졌는데, 온도가 조금 내려가니 산미와 단맛이 깔끔하게 잡혔어요. 음식 없이 마셔도 부담이 적고, 식사 자리에서는 입안을 정리해 주는 느낌이라 만족스러웠습니다.",
    tags: ["#깔끔한", "#부드러운", "#식사주"],
    images: [],
    likes: 164,
    comments: 6,
    rating: "4.5",
    createdAt: "2026-05-07T20:10:00+09:00",
    recommendScore: 69,
    authorId: 3006,
  },
]

export const drinkReviews: DrinkReview[] = drinkReviewSeeds.map(({ authorId, ...review }) => ({
  ...review,
  author: getProductReviewAuthor(authorId),
}))
