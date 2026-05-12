type Props = {
  title?: string
  message?: string
  confirmLabel?: string
  secondaryLabel?: string
  variant?: "default" | "preparing" | "signup"
  confirmTone?: "neutral" | "primary"
  secondaryDisabled?: boolean
  onSecondary?: () => void
  onConfirm: () => void
}

export default function AlertModal({
  title,
  message,
  confirmLabel = "확인",
  secondaryLabel,
  variant = "default",
  confirmTone = variant === "preparing" ? "neutral" : "primary",
  secondaryDisabled = false,
  onSecondary,
  onConfirm,
}: Props) {
  const dialogTitle = title?.trim() || "알림"
  const modalClassName = [
    "alert_modal",
    variant === "preparing" ? "is_preparing" : "",
    variant === "signup" ? "is_signup" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="alert_modal_overlay" role="dialog" aria-modal="true" aria-label={dialogTitle}>
      <div className={modalClassName} role="document">
        <div className="alert_modal_body">
          <p className="alert_modal_title">{dialogTitle}</p>
          {message ? <p className="alert_modal_text">{message}</p> : null}
        </div>
        <div className={secondaryLabel ? "alert_modal_actions is_stacked" : "alert_modal_actions"}>
          {secondaryLabel ? (
            <button
              type="button"
              className="alert_modal_button is_secondary"
              disabled={secondaryDisabled}
              onClick={onSecondary}
            >
              {secondaryLabel}
            </button>
          ) : null}
          <button
            type="button"
            className={confirmTone === "primary" ? "alert_modal_button is_primary" : "alert_modal_button"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
