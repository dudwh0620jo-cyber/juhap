import { formatWon, type WineCandidate } from "../utils/chatBotFlow"

type ChatRecommendPanelProps = {
  recommendations: WineCandidate[]
  onOpenDetail: (wineId: string, label: string) => void
  onMore: () => void
}

export default function ChatRecommendPanel({ recommendations, onOpenDetail, onMore }: ChatRecommendPanelProps) {
  return (
    <div className="chat_recommend_panel" aria-label="추천 결과">
      <div className="chat_recommend_list">
        {recommendations.map((candidate) => (
          <button
            type="button"
            key={candidate.id}
            className="chat_recommend_card"
            onClick={() => onOpenDetail(candidate.id, candidate.name)}
            aria-label={`${candidate.name} 상세 보기`}
          >
            <div className="chat_recommend_card_title">{candidate.name}</div>
            <div className="chat_recommend_card_subtitle">{candidate.subtitle}</div>
            <div className="chat_recommend_card_price">{formatWon(candidate.priceWon)}</div>
          </button>
        ))}
      </div>
      <div className="chat_action_row">
        <button type="button" className="chat_action_button" onClick={onMore}>
          다른 추천 보기
        </button>
      </div>
    </div>
  )
}
