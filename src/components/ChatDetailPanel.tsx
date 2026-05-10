import { formatWon, type WineCandidate } from "../utils/chatBotFlow"

type ChatDetailPanelProps = {
  wine: WineCandidate
  onBack: () => void
  onConfirm: () => void
}

function buildMockReviews(wine: WineCandidate) {
  const base = wine.tags.includes("사케") ? "부드럽고 깔끔해서 입문용으로 좋았어요." : "향이 또렷하고 밸런스가 좋아서 만족스러웠어요."
  return [`"마시기 편하고 조합도 좋았어요." (평점 4.6)`, `"${base}" (평점 4.8)`]
}

export default function ChatDetailPanel({ wine, onBack, onConfirm }: ChatDetailPanelProps) {
  const reviews = buildMockReviews(wine)

  return (
    <div className="chat_detail_panel" aria-label="상세 설명">
      <div className="chat_detail_header">
        <div className="chat_detail_title">{wine.name}</div>
        <div className="chat_detail_price">{formatWon(wine.priceWon)}</div>
      </div>

      <div className="chat_detail_sections">
        <section className="chat_detail_section" aria-label="특징">
          <h3>핵심 특징</h3>
          <ul>
            {wine.notes.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="chat_detail_section" aria-label="테이스팅 노트">
          <h3>테이스팅 노트</h3>
          <ul>
            {wine.tastingNotes.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {wine.awards.length ? (
          <section className="chat_detail_section" aria-label="수상 이력">
            <h3>수상 이력</h3>
            <ul>
              {wine.awards.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="chat_detail_section" aria-label="다른 사람들의 평가">
          <h3>다른 사람들의 평가</h3>
          <ul>
            {reviews.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="chat_detail_section" aria-label="페어링과 팁">
          <h3>페어링과 팁</h3>
          <ul>
            {wine.pairingFoods.slice(0, 3).map((item) => (
              <li key={`pairing-${item}`}>페어링 : {item}</li>
            ))}
            {wine.tips.slice(0, 2).map((item) => (
              <li key={`tip-${item}`}>팁 : {item}</li>
            ))}
          </ul>
        </section>
      </div>
      <div className="chat_action_row">
        <button type="button" className="chat_action_button" onClick={onConfirm}>
          이걸로 선택하기
        </button>
        <button type="button" className="chat_action_button chat_action_button_secondary" onClick={onBack}>
          다른 주류 보기
        </button>
      </div>
    </div>
  )
}
