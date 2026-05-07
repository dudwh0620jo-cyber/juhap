import type { PreferenceGroup } from "../data/setupContent"

type Props = {
  group: PreferenceGroup
  selectedOptions: string[]
  warning?: string
  onToggleOption: (group: PreferenceGroup, option: string) => void
}

export default function PreferenceGroupSection({ group, selectedOptions, warning, onToggleOption }: Props) {
  return (
    <section className="taste_setup_group" data-selection-type={group.type}>
      <h2>
        {group.title} <em aria-label="필수">*</em>
      </h2>
      <div className="taste_chip_grid">
        {group.options.map((option) => (
          <button
            className={selectedOptions.includes(option) ? "taste_chip is_selected" : "taste_chip"}
            type="button"
            key={option}
            onClick={() => onToggleOption(group, option)}
          >
            {option}
          </button>
        ))}
      </div>
      {warning ? <p className="taste_setup_warning">{warning}</p> : null}
    </section>
  )
}
