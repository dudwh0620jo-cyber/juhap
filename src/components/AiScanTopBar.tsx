type AiScanTopBarProps = {
  tone?: "light" | "dark"
  onBack: () => void
}

export default function AiScanTopBar({ tone = "light", onBack }: AiScanTopBarProps) {
  return (
    <header className={`ai_scan_topbar is_${tone}`} aria-label="상단 메뉴">
      <button type="button" className="ai_scan_topbar_button" aria-label="뒤로 가기" onClick={onBack}>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path d="M15 5L8 12L15 19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </header>
  )
}
