type AiScanActionsProps = {
  primaryLabel: string
  secondaryLabel: string
  disabled?: boolean
  foodModeHint?: string | null
  onPrimary: () => void
  onSecondary: () => void
}

export default function AiScanActions({
  primaryLabel,
  secondaryLabel,
  disabled = false,
  foodModeHint = null,
  onPrimary,
  onSecondary,
}: AiScanActionsProps) {
  return (
    <div className="ai_scan_actions" aria-label="스캔 동작">
      <button type="button" className="ai_scan_action is_secondary" onClick={onSecondary} disabled={disabled}>
        {secondaryLabel}
      </button>
      <div className="ai_scan_action_primary_col">
        <button type="button" className="ai_scan_action is_primary" onClick={onPrimary} disabled={disabled}>
          {primaryLabel}
        </button>
        {foodModeHint ? <p className="ai_scan_action_balloon">{foodModeHint}</p> : null}
      </div>
    </div>
  )
}
