type Props = {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  ariaLabel?: string
}

export default function PurchaseConfirmModal({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "이동",
  cancelLabel = "취소",
  ariaLabel = "이동 확인",
}: Props) {
  return (
    <div className="purchase_confirm_overlay" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className="purchase_confirm_modal">
        <p className="purchase_confirm_text">{message}</p>
        <div className="purchase_confirm_actions">
          <button type="button" className="purchase_confirm_button is_cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="purchase_confirm_button is_confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
