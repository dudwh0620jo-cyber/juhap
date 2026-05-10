import { formatWon, type WineCandidate } from "../utils/chatBotFlow"

type ChatRecommendPanelProps = {
  recommendations: WineCandidate[]
  selectedWineId: string | null
  onSelect: (wineId: string) => void
  onGoProductDetail: (wineId: string) => void
  onAskMore: (wineId: string) => void
  onMore: () => void
}

export default function ChatRecommendPanel({
  recommendations,
  selectedWineId,
  onSelect,
  onGoProductDetail,
  onAskMore,
  onMore,
}: ChatRecommendPanelProps) {
  const selected = selectedWineId ? recommendations.find((item) => item.id === selectedWineId) ?? null : null

  return (
    <div className="chat_recommend_panel" aria-label="추천 결과">
      <div className="chat_recommend_list">
        {recommendations.map((candidate) => (
          <div key={candidate.id} className={candidate.id === selectedWineId ? "chat_recommend_item is_selected" : "chat_recommend_item"}>
            <button
              type="button"
              className={candidate.id === selectedWineId ? "chat_recommend_card is_selected" : "chat_recommend_card"}
              onClick={() => onSelect(candidate.id)}
              aria-pressed={candidate.id === selectedWineId}
              aria-label={`${candidate.name} 선택`}
            >
              <div className="chat_recommend_card_inner">
                <div className="chat_recommend_card_thumb" aria-hidden="true">
                  <span>{candidate.tags.includes("사케") ? "SAKE" : "WINE"}</span>
                </div>
                <div className="chat_recommend_card_body">
                  <div className="chat_recommend_card_title">{candidate.name}</div>
                  <div className="chat_recommend_card_subtitle">{candidate.subtitle}</div>
                  <div className="chat_recommend_card_tags" aria-label="태그">
                    {candidate.tags.slice(0, 4).map((tag) => (
                      <span className="chat_recommend_tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="chat_recommend_card_price">{formatWon(candidate.priceWon)}</div>
                </div>
              </div>
            </button>
            {candidate.id === selectedWineId ? (
              <button type="button" className="chat_recommend_selected_cta" onClick={() => onGoProductDetail(candidate.id)}>
                상품 상세페이지 가기
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <div className="chat_action_row">
        <button type="button" className="chat_action_button" onClick={() => (selected ? onAskMore(selected.id) : undefined)} disabled={!selected}>
          더 자세한 정보 보기
        </button>
        <button type="button" className="chat_action_button chat_action_button_secondary" onClick={onMore}>
          다른 추천 보기
        </button>
      </div>
    </div>
  )
}
