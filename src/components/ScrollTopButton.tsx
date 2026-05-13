import "../styles/scroll-top-button.css"

type ScrollTopButtonProps = {
  className?: string
}

export default function ScrollTopButton({ className = "" }: ScrollTopButtonProps) {
  const mergedClassName = ["scroll_top_button", className].filter(Boolean).join(" ")

  return (
    <button
      className={mergedClassName}
      type="button"
      aria-label="맨 위로 이동"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  )
}
