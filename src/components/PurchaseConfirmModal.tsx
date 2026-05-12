import type { ReactNode } from "react"

type Props = {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  ariaLabel?: string
  title?: string
  children?: ReactNode
}

export default function PurchaseConfirmModal({
  title,
  message,
  children,
  onConfirm,
  onCancel,
  confirmLabel = "이동",
  cancelLabel = "취소",
  ariaLabel = "이동 확인",
}: Props) {
  return (
    <div className="purchase_confirm_overlay" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className="purchase_confirm_modal">
        {title ? <p className="purchase_confirm_title">{title}</p> : null}
        <p className="purchase_confirm_text">{message}</p>
        {children ? <div className="purchase_confirm_content">{children}</div> : null}
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
