import type { WineCandidate } from "../utils/chatBotFlow"

type ChatPairingPanelProps = {
  wine: WineCandidate
  onConfirm: () => void
  onBack: () => void
}

export default function ChatPairingPanel({ wine, onConfirm, onBack }: ChatPairingPanelProps) {
  return (
    <div className="chat_pairing_panel" aria-label="페어링과 팁">
      <div className="chat_pairing_title">추천 페어링 음식</div>
      <div className="chat_chip_group">
        {wine.pairingFoods.map((item) => (
          <span className="chat_chip chat_chip_static" key={item}>
            {item}
          </span>
        ))}
      </div>
      <div className="chat_pairing_title">즐기는 팁</div>
      <ul className="chat_detail_list">
        {wine.tips.slice(0, 3).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="chat_action_row">
        <button type="button" className="chat_action_button" onClick={onConfirm}>
          이 주류로 선택할게요!
        </button>
        <button type="button" className="chat_action_button chat_action_button_secondary" onClick={onBack}>
          다른 주류 추천받기
        </button>
      </div>
    </div>
  )
}
