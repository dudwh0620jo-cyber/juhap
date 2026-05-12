import iconCaretLeft from "../assets/svg/caretleft.svg"
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
      <button type="button" className="feed_filter_close_button" aria-label="뒤로가기" onClick={onClose}>
        <img src={iconCaretLeft} alt="" aria-hidden="true" />
      </button>
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
    </div>
  )
}
