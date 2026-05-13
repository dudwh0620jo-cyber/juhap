type AiScanTopBarProps = {
  tone?: "light" | "dark"
  onBack: () => void
  onClose: () => void
}

export default function AiScanTopBar({ tone = "light", onBack, onClose }: AiScanTopBarProps) {
  return (
    <header className={`ai_scan_topbar is_${tone}`} aria-label="상단 메뉴">
      <button type="button" className="ai_scan_topbar_button" aria-label="뒤로가기" onClick={onBack}>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path d="M15 5L8 12L15 19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" className="ai_scan_topbar_button" aria-label="닫기" onClick={onClose}>
        <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true">
          <path d="M6 6L18 18M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  )
}
