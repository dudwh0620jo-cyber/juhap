import iconArrowRight from "../assets/svg/arrowright_p.svg"
import type { PairingDetailProduct } from "../utils/pairingDetailMock"

type Props = {
  product: PairingDetailProduct
}

export default function PairingDetailProductCard({ product }: Props) {
  return (
    <section className="detail_product_shell" aria-label="연결 상품">
      <div className="detail_product_card">
        <div className="product_thumb" aria-hidden="true">
          <img className="product_thumb_image" src={product.imageSrc} alt="" aria-hidden="true" />
        </div>
        <div className="product_info">
          <div className="product_text">
            <h3>{product.name}</h3>
            <p>{product.priceText}</p>
          </div>
          <div className="chips">
            {product.chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        </div>
        <button className="detail_product_arrow" type="button" aria-label="상품 상세로 이동">
          <img src={iconArrowRight} alt="" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
