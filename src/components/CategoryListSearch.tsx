import { forwardRef } from "react"

type Props = {
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
}

const CategoryListSearch = forwardRef<HTMLInputElement, Props>(({ value, onChange, onConfirm }, ref) => {
  const handleConfirm = () => {
    onConfirm()
    if (ref && "current" in ref) ref.current?.blur()
  }

  return (
    <div className="category_list_search" aria-label="검색하기">
      <input
        ref={ref}
        className="category_list_search_input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return
          event.preventDefault()
          if (!value.trim()) return
          handleConfirm()
        }}
        placeholder="검색하기"
        aria-label="카테고리 리스트 검색"
      />
      {value.trim() ? (
        <button
          type="button"
          className="category_list_search_confirm"
          aria-label="검색 확인"
          onClick={handleConfirm}
        >
          확인
        </button>
      ) : null}
    </div>
  )
})

CategoryListSearch.displayName = "CategoryListSearch"
export default CategoryListSearch
