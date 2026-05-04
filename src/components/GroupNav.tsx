type Group = {
  id: string
  label: string
  items: string[]
}

type Props = {
  groups: Group[]
  activeGroupId: string
  onGroupChange: (id: string) => void
  ariaLabel: string
}

export default function GroupNav({ groups, activeGroupId, onGroupChange, ariaLabel }: Props) {
  return (
    <aside className="group_nav" aria-label={ariaLabel}>
      {groups.map((group) => (
        <button
          className={group.id === activeGroupId ? "is_selected" : ""}
          key={group.id}
          onClick={() => onGroupChange(group.id)}
          type="button"
        >
          {group.label}
        </button>
      ))}
    </aside>
  )
}
