import { forwardRef } from "react"
import iconSearch from "../assets/svg/magnifyingglass.svg"

type Props = {
  value: string
  onChange: (value: string) => void
}

const CategorySearch = forwardRef<HTMLInputElement, Props>(({ value, onChange }, ref) => {
  const handleConfirm = () => {
    if (ref && "current" in ref) ref.current?.blur()
  }

  return (
    <div className="category_search">
      <div className="category_search_field">
        <img className="category_search_icon" src={iconSearch} alt="" aria-hidden="true" />
        <input
          className="category_search_input"
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="카테고리 또는 종류 검색..."
          aria-label="카테고리 또는 종류 검색"
        />
      </div>
      {value.trim() ? (
        <button type="button" className="category_search_confirm" aria-label="검색 확인" onClick={handleConfirm}>
          확인
        </button>
      ) : null}
    </div>
  )
})

CategorySearch.displayName = "CategorySearch"
export default CategorySearch
