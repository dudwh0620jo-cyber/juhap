import { forwardRef } from "react"

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
      <input
        className="category_search_input"
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="검색하기"
        aria-label="카테고리 검색"
      />
      {value.trim() ? (
        <button
          type="button"
          className="category_search_confirm"
          aria-label="검색 확인"
          onClick={handleConfirm}
        >
          확인
        </button>
      ) : null}
    </div>
  )
})

CategorySearch.displayName = "CategorySearch"
export default CategorySearch
