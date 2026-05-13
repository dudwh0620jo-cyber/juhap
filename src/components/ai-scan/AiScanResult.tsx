import { aiScanAssets, aiScanCopy, aiScanResult, type AiScanStatus } from "../../data/aiScanContent"
import AiScanActions from "./AiScanActions"
import AiScanTips from "./AiScanTips"
import AiScanTopBar from "./AiScanTopBar"

type AiScanResultProps = {
  status: Extract<AiScanStatus, "success" | "failure">
  onBack: () => void
  onClose: () => void
  onUpload: () => void
  onRetry: () => void
  onOpenDetail: () => void
  onSave: () => void
}

const specIconByType = {
  taste: aiScanAssets.tasteIcon,
  aroma: aiScanAssets.aromaIcon,
  finish: aiScanAssets.finishIcon,
} as const

const pairingImageByType = {
  sashimi: aiScanAssets.pairingSashimi,
  uni: aiScanAssets.pairingUni,
  nabe: aiScanAssets.pairingNabe,
} as const

const badPairingIconByType = {
  mara: aiScanAssets.iconMara,
  spicy: aiScanAssets.iconSpicy,
} as const

function SuccessResult({ onBack, onClose, onOpenDetail, onSave }: Pick<AiScanResultProps, "onBack" | "onClose" | "onOpenDetail" | "onSave">) {
  const { product } = aiScanResult

  return (
    <div className="ai_scan_result_page">
      <AiScanTopBar tone="dark" onBack={onBack} onClose={onClose} />

      <section className="ai_scan_result_intro" aria-label="스캔 결과 안내">
        <img className="ai_scan_result_mascot" src={aiScanAssets.scanMascotGotit} alt="" aria-hidden="true" />
        <div className="right">
          <div className="ai_scan_speech_bubble">
            {aiScanCopy.successMessage.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="ai_scan_result_panel" aria-label="스캔 성공 결과">
        <div className="ai_scan_product_block">
          <div className="ai_scan_product_summary">
            <img className="ai_scan_product_image" src={aiScanAssets.productDassai23} alt={product.name} />
            <div className="ai_scan_product_text">
              <p>“{product.quote}”</p>
              <h1>{product.name}</h1>
              <span>{product.category}</span>
              <span>{product.origin}</span>
              <div className="ai_scan_rating" aria-label={`평점 ${product.rating}, 리뷰 ${product.reviewCount}개`}>
                <span aria-hidden="true">★★★★★</span>
                <strong>{product.rating}</strong>
                <em>({product.reviewCount})</em>
              </div>
            </div>
          </div>

          <div className="ai_scan_spec_grid" aria-label="제품 주요 정보">
            {product.specs.map((spec) => (
              <div key={spec.label} className="ai_scan_spec_card">
                <img src={specIconByType[spec.icon]} alt="" aria-hidden="true" />
                <span>{spec.label}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="ai_scan_pairing_section" aria-label="추천 페어링">
          <h2>추천 페어링</h2>
          <div className="ai_scan_pairing_scroller">
            {aiScanResult.pairings.map((pairing) => (
              <article key={pairing.title} className="ai_scan_pairing_card">
                <img src={pairingImageByType[pairing.image]} alt="" aria-hidden="true" />
                <div className="ai_scan_pairing_text">
                  <span className="ai_scan_best_badge">best</span>
                  <strong>{pairing.title}</strong>
                  <div className="ai_scan_pairing_tags">
                    <span className="is_drink">{pairing.drinkTag}</span>
                    <span className="is_food">{pairing.foodTag}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="ai_scan_pairing_section" aria-label="비추천 페어링">
          <h2>비추천 페어링</h2>
          <div className="ai_scan_bad_pairings">
            {aiScanResult.badPairings.map((pairing) => (
              <span key={pairing.label}>
                <img className="ai_scan_bad_pairing_icon" src={badPairingIconByType[pairing.icon]} alt="" aria-hidden="true" />
                {pairing.label}
              </span>
            ))}
          </div>
        </section>
      </section>

      <AiScanActions
        secondaryLabel={aiScanCopy.detail}
        primaryLabel={aiScanCopy.save}
        onSecondary={onOpenDetail}
        onPrimary={onSave}
      />
    </div>
  )
}

function FailureResult({ onBack, onClose, onUpload, onRetry }: Pick<AiScanResultProps, "onBack" | "onClose" | "onUpload" | "onRetry">) {
  return (
    <div className="ai_scan_result_page is_failure">
      <AiScanTopBar tone="dark" onBack={onBack} onClose={onClose} />

      <section className="ai_scan_failure_body" aria-label="스캔 실패 결과">
        <div className="ai_scan_speech_bubble is_failure">
          {aiScanCopy.failureMessage.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <img className="ai_scan_failure_mascot" src={aiScanAssets.scanMascotSad} alt="" aria-hidden="true" />
      </section>

      <div className="ai_scan_failure_tips_panel">
        <AiScanTips compact />
      </div>

      <AiScanActions
        secondaryLabel={aiScanCopy.upload}
        primaryLabel={aiScanCopy.retry}
        onSecondary={onUpload}
        onPrimary={onRetry}
      />
    </div>
  )
}

export default function AiScanResult({
  status,
  onBack,
  onClose,
  onUpload,
  onRetry,
  onOpenDetail,
  onSave,
}: AiScanResultProps) {
  if (status === "failure") {
    return <FailureResult onBack={onBack} onClose={onClose} onUpload={onUpload} onRetry={onRetry} />
  }

  return <SuccessResult onBack={onBack} onClose={onClose} onOpenDetail={onOpenDetail} onSave={onSave} />
}
