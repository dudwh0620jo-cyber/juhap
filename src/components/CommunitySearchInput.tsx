import type { RefObject } from "react"
import iconSearch from "../assets/svg/magnifyingglass.svg"

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
  onFocusInput?: () => void
  focusOnClear?: boolean
  confirmLabel?: string
  showConfirmButton?: boolean
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
  onFocusInput,
  focusOnClear = true,
  confirmLabel = "확인",
  showConfirmButton = true,
}: Props) {
  const hasValue = Boolean(value.trim())

  const handleClear = () => {
    onClear()
    if (!focusOnClear) return
    window.setTimeout(() => inputRef?.current?.focus(), 0)
  }

  return (
    <div className="feed_filter_search_shell" aria-label={shellAriaLabel}>
      <div className="feed_filter_search">
        <img className="category_search_icon" src={iconSearch} alt="" aria-hidden="true" />
        <input
          ref={inputRef}
          className="feed_filter_search_input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocusInput}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return
            event.preventDefault()
            onEnter()
          }}
          placeholder={placeholder}
          aria-label={inputAriaLabel}
        />
        {hasValue ? (
          <button type="button" className="feed_filter_search_clear" aria-label={clearAriaLabel} onClick={handleClear} />
        ) : null}
      </div>
      {hasValue && showConfirmButton ? (
        <button type="button" className="feed_filter_search_confirm" onClick={onEnter}>
          {confirmLabel}
        </button>
      ) : null}
    </div>
  )
}
