type Props = {
  shopName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function PurchaseConfirmModal({ shopName, onConfirm, onCancel }: Props) {
  return (
    <div className="purchase_confirm_overlay" role="dialog" aria-modal="true" aria-label="이동 확인">
      <div className="purchase_confirm_modal">
        <p className="purchase_confirm_text">{shopName}로 이동할까요?</p>
        <div className="purchase_confirm_actions">
          <button type="button" className="purchase_confirm_button is_cancel" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="purchase_confirm_button is_confirm" onClick={onConfirm}>
            이동
          </button>
        </div>
      </div>
    </div>
  )
}
