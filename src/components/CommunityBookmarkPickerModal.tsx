import PurchaseConfirmModal from "./PurchaseConfirmModal"

type Props = {
  ariaLabel: string
  titleText: string
  helperText: string
  primaryLabel: string
  secondaryLabel: string
  onDismiss: () => void
  onSecondary: () => void
  onPrimary: () => void
}

export default function CommunityBookmarkPickerModal({
  ariaLabel,
  titleText,
  helperText,
  primaryLabel,
  secondaryLabel,
  onDismiss: _onDismiss,
  onSecondary,
  onPrimary,
}: Props) {
  return (
    <PurchaseConfirmModal
      ariaLabel={ariaLabel}
      message={titleText}
      cancelLabel={secondaryLabel}
      confirmLabel={primaryLabel}
      onCancel={onSecondary}
      onConfirm={onPrimary}
    >
      <p className="bookmark_picker_helper">{helperText}</p>
    </PurchaseConfirmModal>
  )
}
