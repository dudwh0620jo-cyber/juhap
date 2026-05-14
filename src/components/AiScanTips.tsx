import { aiScanAssets, aiScanCopy } from "../data/aiScanContent"

function getTipIcon(icon: string) {
  if (icon === "sun") return aiScanAssets.iconSun
  if (icon === "barcode") return aiScanAssets.iconBarcode
  return aiScanAssets.iconShake
}

export default function AiScanTips({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`ai_scan_tips${compact ? " is_compact" : ""}`} aria-label="스캔 팁">
      <div className="ai_scan_tips_title">
        <img className="ai_scan_tips_icon" src={aiScanAssets.iconTips} alt="" aria-hidden="true" />
        <span>{aiScanCopy.scanningTipLead}</span>
      </div>
      <div className="ai_scan_tip_list">
        {aiScanCopy.scanningTips.map((tip) => (
          <div key={tip.icon} className="ai_scan_tip_item">
            <img src={getTipIcon(tip.icon)} alt="" aria-hidden="true" />
            <span>{tip.title}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

