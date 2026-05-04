import { Link } from "react-router"

type Props = {
  onBack: () => void
}

export default function ProductDetailHeader({ onBack }: Props) {
  return (
    <header className="product_detail_header" aria-label="상단 메뉴">
      <button type="button" className="icon_button" aria-label="뒤로가기" onClick={onBack}>
        ←
      </button>
      <div className="header_actions">
        <Link className="icon_button" to="/home" aria-label="홈">
          ⌂
        </Link>
        <button type="button" className="icon_button" aria-label="공유">
          ↗
        </button>
      </div>
    </header>
  )
}
