import PurchaseConfirmModal from "./PurchaseConfirmModal"

type BookmarkList = {
  id: string
  label: string
}

type BookmarkPickerState = {
  postId: number
  selectedListId: string
}

type Props = {
  picker: BookmarkPickerState
  lists: readonly BookmarkList[]
  ariaLabel: string
  titleText: string
  listPickerAriaLabel: string
  primaryLabel: string
  secondaryLabel: string
  onDismiss: () => void
  onSelectList: (listId: string) => void
  onSecondary: () => void
  onPrimary: () => void
}

export default function CommunityBookmarkPickerModal({
  picker,
  lists,
  ariaLabel,
  titleText,
  listPickerAriaLabel,
  primaryLabel,
  secondaryLabel,
  onDismiss: _onDismiss,
  onSelectList,
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
      <div className="bookmark_list_picker" role="radiogroup" aria-label={listPickerAriaLabel} onClick={(e) => e.stopPropagation()}>
        {lists.map((list) => (
          <button
            key={list.id}
            type="button"
            className={picker.selectedListId === list.id ? "bookmark_list_item is_active" : "bookmark_list_item"}
            role="radio"
            aria-checked={picker.selectedListId === list.id}
            onClick={() => onSelectList(list.id)}
          >
            {list.label}
          </button>
        ))}
      </div>
    </PurchaseConfirmModal>
  )
}
