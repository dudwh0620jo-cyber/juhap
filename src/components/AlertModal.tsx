type Props = {
  message: string
  confirmLabel?: string
  onConfirm: () => void
}

export default function AlertModal({ message, confirmLabel = "확인", onConfirm }: Props) {
  return (
    <div className="alert_modal_overlay" role="dialog" aria-modal="true" aria-label="알림">
      <div className="alert_modal" role="document">
        <p className="alert_modal_text">{message}</p>
        <div className="alert_modal_actions">
          <button type="button" className="alert_modal_button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

