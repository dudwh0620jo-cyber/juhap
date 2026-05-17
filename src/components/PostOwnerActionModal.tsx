type Props = {
  title?: string
  onEdit: () => void
  onDelete: () => void
  onCancel: () => void
}

export default function PostOwnerActionModal({
  title = "게시글 설정",
  onEdit,
  onDelete,
  onCancel,
}: Props) {
  return (
    <div className="post_owner_action_overlay" role="presentation" onClick={onCancel}>
      <div
        className="post_owner_action_modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="post_owner_action_title">{title}</p>
        <div className="post_owner_action_buttons">
          <button type="button" className="post_owner_action_button" onClick={onEdit}>
            수정하기
          </button>
          <button type="button" className="post_owner_action_button is_danger" onClick={onDelete}>
            삭제하기
          </button>
          <button type="button" className="post_owner_action_button" onClick={onCancel}>
            취소
          </button>
        </div>
      </div>
    </div>
  )
}
