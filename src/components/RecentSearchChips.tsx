type Props = {
  terms: readonly string[]
  onSelect: (term: string) => void
  onDelete: (term: string) => void
}

export default function RecentSearchChips({ terms, onSelect, onDelete }: Props) {
  if (terms.length === 0) {
    return null
  }

  return (
    <div className="feed_filter_group">
      <h3 className="feed_filter_group_title">최근검색</h3>
      <div className="feed_filter_group_chips">
        {terms.map((term) => (
          <div className="recent_search_item" key={term}>
            <button type="button" className="feed_filter_chip" onClick={() => onSelect(term)}>
              {term}
            </button>
            <button
              type="button"
              className="recent_search_delete"
              aria-label="최근검색 삭제"
              onClick={() => onDelete(term)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

