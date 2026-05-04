type Props = {
  isRecommended: boolean
  recommendCount: number
  onToggle: () => void
}

export default function RecommendPanel({ isRecommended, recommendCount, onToggle }: Props) {
  return (
    <article className="recommend_panel">
      <button
        type="button"
        className="recommend_button"
        aria-label="조합 추천"
        aria-pressed={isRecommended}
        onClick={onToggle}
      >
        <div className="recommend_icon" aria-hidden="true">
          💬
        </div>
        <div>
          <h3>추천해요</h3>
          <p>이 조합이 좋으셨다면 추천을 눌러주세요</p>
          <strong>{recommendCount.toLocaleString()}</strong>
        </div>
      </button>
    </article>
  )
}
