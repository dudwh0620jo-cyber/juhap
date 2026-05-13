import bubbleLarge from "../assets/svg/boll_l.svg"
import bubbleMedium from "../assets/svg/boll_m.svg"
import bubbleSmall from "../assets/svg/boll_s.svg"
import iconBeerStein from "../assets/svg/beerstein_p.svg"
import iconBeerSteinActive from "../assets/svg/beerstein_active.svg"

type Props = {
  baseCount: number
  isActive: boolean
  isAnimating: boolean
  onToggle: () => void
}

export default function ProductReviewLikeButton({ baseCount, isActive, isAnimating, onToggle }: Props) {
  return (
    <button
      type="button"
      className={isActive ? "review_toast_button is_active" : "review_toast_button"}
      aria-label={isActive ? "짠 취소" : "짠"}
      aria-pressed={isActive}
      onClick={onToggle}
    >
      <span className="review_toast_icon_wrap" aria-hidden="true">
        {isAnimating ? (
          <span className="review_like_bubbles">
            <img className="review_like_bubble is_large" src={bubbleLarge} alt="" />
            <img className="review_like_bubble is_medium" src={bubbleMedium} alt="" />
            <img className="review_like_bubble is_small" src={bubbleSmall} alt="" />
            <img className="review_like_bubble is_small_alt" src={bubbleSmall} alt="" />
            <img className="review_like_bubble is_medium_alt" src={bubbleMedium} alt="" />
          </span>
        ) : null}
        <img
          className={isAnimating ? "review_toast_icon is_like_animated" : "review_toast_icon"}
          src={isActive ? iconBeerSteinActive : iconBeerStein}
          alt=""
        />
      </span>
      {baseCount + (isActive ? 1 : 0)}
    </button>
  )
}
