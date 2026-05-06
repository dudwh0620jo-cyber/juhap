import { useState } from "react"
import { formatWon, type WineCandidate } from "../utils/chatBotFlow"

type ChatDonePanelProps = {
  wine: WineCandidate
  onClose: () => void
}

type ExternalLink = {
  label: string
  url: string
}

const prepItems: ExternalLink[] = [
  { label: "사케 잔", url: "https://search.shopping.naver.com/search/all?query=%EC%82%AC%EC%BC%80%EC%9E%94" },
  { label: "치즈 플래터", url: "https://search.shopping.naver.com/search/all?query=%EC%B9%98%EC%A6%88%20%ED%94%8C%EB%9E%98%ED%84%B0" },
  { label: "해산물 안주", url: "https://search.shopping.naver.com/search/all?query=%ED%95%B4%EC%82%B0%EB%AC%BC%20%EC%95%88%EC%A3%BC" },
  { label: "도쿠리 세트", url: "https://search.shopping.naver.com/search/all?query=%EB%8F%84%EC%BF%A0%EB%A6%AC%20%EC%84%B8%ED%8A%B8" },
]

const lowestPriceShop: ExternalLink = {
  label: "네이버 쇼핑",
  url: "https://search.shopping.naver.com/search/all?query=%EC%82%AC%EC%BC%80",
}

export default function ChatDonePanel({ wine, onClose }: ChatDonePanelProps) {
  const [pendingLink, setPendingLink] = useState<ExternalLink | null>(null)

  function openPendingLink() {
    if (!pendingLink) return
    window.open(pendingLink.url, "_blank", "noopener,noreferrer")
    setPendingLink(null)
  }

  return (
    <div className="chat_done_panel chat_done_panel_full" aria-label="선택 완료">
      <div className="chat_done_hero">
        <h3 className="chat_done_title">완벽한 선택이 될 거예요!</h3>
        <div className="chat_done_photo" aria-hidden="true" />
      </div>

      <div className="chat_done_product">
        <div>
          <div className="chat_done_name">{wine.name}</div>
          <div className="chat_recommend_card_subtitle">{wine.subtitle}</div>
        </div>
        <div className="chat_done_price">{formatWon(wine.priceWon)}</div>
      </div>

      <button type="button" className="chat_done_banner_button" onClick={() => setPendingLink(lowestPriceShop)}>
        최저가 구매처 보러가기
      </button>

      <div className="chat_done_section_title">준비하면 좋은 것</div>
      <div className="chat_done_banner_list">
        {prepItems.map((item) => (
          <button type="button" key={item.label} className="chat_done_banner_button" onClick={() => setPendingLink(item)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="chat_action_row">
        <button type="button" className="chat_action_button" onClick={onClose}>
          홈으로 돌아가기
        </button>
      </div>

      {pendingLink ? (
        <div className="chat_link_confirm_overlay" role="dialog" aria-modal="true" aria-label="사이트 이동 확인">
          <div className="chat_link_confirm_modal">
            <p className="chat_link_confirm_text">{pendingLink.label} 사이트로 이동할까요?</p>
            <div className="chat_link_confirm_actions">
              <button
                type="button"
                className="chat_link_confirm_button chat_link_confirm_button_secondary"
                onClick={() => setPendingLink(null)}
              >
                취소
              </button>
              <button type="button" className="chat_link_confirm_button" onClick={openPendingLink}>
                이동
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
