import type { RefObject } from "react"

type Props = {
  shellAriaLabel: string
  inputAriaLabel: string
  clearAriaLabel: string
  placeholder: string
  value: string
  inputRef?: RefObject<HTMLInputElement | null>
  onChange: (nextValue: string) => void
  onEnter: () => void
  onClear: () => void
  focusOnClear?: boolean
}

export default function CommunitySearchInput({
  shellAriaLabel,
  inputAriaLabel,
  clearAriaLabel,
  placeholder,
  value,
  inputRef,
  onChange,
  onEnter,
  onClear,
  focusOnClear = true,
}: Props) {
  const hasValue = Boolean(value.trim())

  const handleClear = () => {
    onClear()
    if (!focusOnClear) {
      return
    }
    window.setTimeout(() => inputRef?.current?.focus(), 0)
  }

  return (
    <div className="feed_filter_search_shell" aria-label={shellAriaLabel}>
      <div className="feed_filter_search">
        <span className="feed_filter_search_magnifier" aria-hidden="true" />
        <input
          ref={inputRef}
          className="feed_filter_search_input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") {
              return
            }
            event.preventDefault()
            onEnter()
          }}
          placeholder={placeholder}
          aria-label={inputAriaLabel}
        />
        {hasValue ? (
          <button
            type="button"
            className="feed_filter_search_clear"
            aria-label={clearAriaLabel}
            onClick={handleClear}
          />
        ) : null}
      </div>
    </div>
  )
}
