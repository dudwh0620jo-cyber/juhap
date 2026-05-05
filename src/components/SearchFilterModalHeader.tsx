import CommunitySearchInput from "./CommunitySearchInput"

type Props = {
  shellAriaLabel: string
  inputAriaLabel: string
  clearAriaLabel: string
  placeholder: string
  value: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (nextValue: string) => void
  onEnter: (term?: string) => void
  onClear: () => void
  onClose: () => void
}

export default function SearchFilterModalHeader({
  shellAriaLabel,
  inputAriaLabel,
  clearAriaLabel,
  placeholder,
  value,
  inputRef,
  onChange,
  onEnter,
  onClear,
  onClose,
}: Props) {
  return (
    <div className="feed_filter_popup_top">
      <CommunitySearchInput
        shellAriaLabel={shellAriaLabel}
        inputAriaLabel={inputAriaLabel}
        clearAriaLabel={clearAriaLabel}
        placeholder={placeholder}
        value={value}
        inputRef={inputRef}
        onChange={onChange}
        onEnter={onEnter}
        onClear={onClear}
      />
      <button type="button" className="feed_filter_close_button" aria-label="취소" onClick={onClose}>
        취소
      </button>
    </div>
  )
}

