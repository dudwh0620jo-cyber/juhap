import { useState } from "react"
import "../styles/ai-scan.css"

type ScanMode = "drink" | "food"

const recentScans: Array<{ emoji: string; label: string }> = [
  { emoji: "🍶", label: "막걸리" },
  { emoji: "🥩", label: "삼겹살" },
  { emoji: "🍺", label: "카스" },
]

export default function AiScan() {
  const [mode, setMode] = useState<ScanMode>("drink")

  const hint = mode === "drink" ? "술병 라벨을 프레임 안에 맞춰주세요" : "음식을 프레임 안에 맞춰주세요"

  return (
    <section className="ai_scan_page page_screen" aria-label="AI 스캔">
      <div className="ai_scan_header">
        <h1 className="ai_scan_title">AI 스캔</h1>
        <p className="ai_scan_subtitle">술병이나 음식을 스캔해 페어링을 추천받으세요</p>
      </div>

      <div className="ai_scan_tabs" role="tablist">
        <button
          role="tab"
          type="button"
          className={`ai_scan_tab${mode === "drink" ? " is_active" : ""}`}
          onClick={() => setMode("drink")}
        >
          🍶 술 스캔
        </button>
        <button
          role="tab"
          type="button"
          className={`ai_scan_tab${mode === "food" ? " is_active" : ""}`}
          onClick={() => setMode("food")}
        >
          🍽️ 음식 스캔
        </button>
      </div>

      <div className="ai_scan_viewfinder" aria-label="카메라 뷰파인더">
        <span className="ai_scan_corner top_left" aria-hidden="true" />
        <span className="ai_scan_corner top_right" aria-hidden="true" />
        <span className="ai_scan_corner bottom_left" aria-hidden="true" />
        <span className="ai_scan_corner bottom_right" aria-hidden="true" />
        <div className="ai_scan_camera_circle" aria-hidden="true">📷</div>
        <p className="ai_scan_hint">{hint}</p>
      </div>

      <button type="button" className="ai_scan_start_button">
        ⚡ AI 스캔 시작
      </button>

      <div>
        <p className="ai_scan_recent_title">최근 스캔</p>
        <div className="ai_scan_recent_chips">
          {recentScans.map((item) => (
            <button key={item.label} type="button" className="ai_scan_chip">
              <span className="ai_scan_chip_emoji">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
