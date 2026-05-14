type Props = {
  title?: string
  message?: string
  primaryLabel: string
  secondaryLabel: string
  cancelLabel: string
  onPrimary: () => void
  onSecondary: () => void
  onCancel: () => void
}

export default function ThreeOptionModal({
  title,
  message,
  primaryLabel,
  secondaryLabel,
  cancelLabel,
  onPrimary,
  onSecondary,
  onCancel,
}: Props) {
  const dialogTitle = title?.trim() || "알림"

  return (
    <div className="alert_modal_overlay" role="dialog" aria-modal="true" aria-label={dialogTitle}>
      <div className="alert_modal" role="document">
        <div className="alert_modal_body">
          <p className="alert_modal_title">{dialogTitle}</p>
          {message ? <p className="alert_modal_text">{message}</p> : null}
        </div>
        <div className="alert_modal_actions is_stacked">
          <button type="button" className="alert_modal_button is_secondary" onClick={onSecondary}>
            {secondaryLabel}
          </button>
          <button type="button" className="alert_modal_button is_primary" onClick={onPrimary}>
            {primaryLabel}
          </button>
          <button type="button" className="alert_modal_button is_cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

