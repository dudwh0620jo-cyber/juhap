import { useNavigate } from "react-router"
import { homeAssets } from "../data/homeContent"

type AiCardProps = {
  title: string
  subtitle: string
  hint: string
  buttonLabel: string
}

function AiCardScanButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="home_ai_scan_button" type="button" onClick={onClick}>
      <img className="home_ai_scan_thumb" src={homeAssets.mainScanButton} alt="" aria-hidden="true" />
      <img className="home_ai_scan_icon" src={homeAssets.scanIcon} alt="" aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}

export default function AiCard({ title, subtitle, hint, buttonLabel }: AiCardProps) {
  const navigate = useNavigate()
  return (
    <section className="home_ai_card">
      <div className="home_ai_copy">
        <h2>{title}</h2>
        <p className="home_ai_subtitle">{subtitle}</p>
        <p className="home_ai_hint">{hint}</p>
      </div>
      <AiCardScanButton label={buttonLabel} onClick={() => navigate("/ai-scan")} />
    </section>
  )
}
