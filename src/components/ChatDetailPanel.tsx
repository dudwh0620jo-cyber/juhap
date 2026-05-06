import { formatWon, type WineCandidate } from "../utils/chatBotFlow"

type ChatDetailPanelProps = {
  wine: WineCandidate
  onOpenPairing: () => void
  onBack: () => void
}

export default function ChatDetailPanel({ wine, onOpenPairing, onBack }: ChatDetailPanelProps) {
  return (
    <div className="chat_detail_panel" aria-label="상세 설명">
      <div className="chat_detail_header">
        <div className="chat_detail_title">{wine.name}</div>
        <div className="chat_detail_price">{formatWon(wine.priceWon)}</div>
      </div>
      <ul className="chat_detail_list">
        {wine.notes.slice(0, 3).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="chat_action_row">
        <button type="button" className="chat_action_button" onClick={onOpenPairing}>
          페어링/팁 보기
        </button>
        <button type="button" className="chat_action_button chat_action_button_secondary" onClick={onBack}>
          다른 주류 보기
        </button>
      </div>
    </div>
  )
}
