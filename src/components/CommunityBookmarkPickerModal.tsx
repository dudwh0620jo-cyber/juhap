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
  onDismiss,
  onSelectList,
  onSecondary,
  onPrimary,
}: Props) {
  return (
    <div className="bookmark_modal_backdrop" role="presentation" onClick={onDismiss}>
      <div
        className="bookmark_modal"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="bookmark_modal_title">{titleText}</p>

        <div className="bookmark_list_picker" role="radiogroup" aria-label={listPickerAriaLabel}>
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

        <div className="bookmark_modal_actions">
          <button type="button" className="bookmark_modal_button" onClick={onSecondary}>
            {secondaryLabel}
          </button>
          <button type="button" className="bookmark_modal_button is_primary" onClick={onPrimary}>
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
