type Props = {
  suggestions: string[]
  onSelect: (suggestion: string) => void
}

export default function SuggestionChips({ suggestions, onSelect }: Props) {
  return (
    <div className="category_list_suggestions" aria-label="비슷한 카테고리 추천">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          className="category_list_suggestion_chip"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
