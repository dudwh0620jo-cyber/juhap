type AiScanActionsProps = {
  primaryLabel: string
  secondaryLabel: string
  disabled?: boolean
  onPrimary: () => void
  onSecondary: () => void
}

export default function AiScanActions({ primaryLabel, secondaryLabel, disabled = false, onPrimary, onSecondary }: AiScanActionsProps) {
  return (
    <div className="ai_scan_actions" aria-label="?ㅼ틪 ?숈옉">
      <button type="button" className="ai_scan_action is_secondary" onClick={onSecondary} disabled={disabled}>
        {secondaryLabel}
      </button>
      <button type="button" className="ai_scan_action is_primary" onClick={onPrimary} disabled={disabled}>
        {primaryLabel}
      </button>
    </div>
  )
}


