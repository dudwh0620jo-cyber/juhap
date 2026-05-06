import { useState } from "react"
import iconCaretLeft from "../assets/svg/caretleft.svg"

export default function SakeGuideAccordion() {
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <section className="product_guide" aria-label="사케 입문 가이드">
      <button className="product_guide_toggle" type="button" onClick={() => setIsGuideOpen((current) => !current)}>
        <span>사케 입문 가이드</span>
        <img
          className={isGuideOpen ? "product_guide_caret is_open" : "product_guide_caret"}
          src={iconCaretLeft}
          alt=""
          aria-hidden="true"
        />
      </button>

      {isGuideOpen ? (
        <div className="product_guide_body">
          <article className="product_guide_section">
            <h3>쌀과 정미율</h3>
            <p>사케는 정미율에 따라 등급이 나뉩니다.</p>
            <div className="polish_table" aria-label="정미율 표">
              <div className="polish_row is_header">
                <strong>정미율</strong>
                <span>70% 이하</span>
                <span>60% 이하</span>
                <span>50% 이하</span>
              </div>
              <div className="polish_row">
                <strong>주정 무첨가</strong>
                <span>
                  준마이
                  <br />
                  (정미율 제한 X)
                </span>
                <span>준마이 긴죠</span>
                <span>
                  준마이
                  <br />
                  다이긴죠
                </span>
              </div>
              <div className="polish_row">
                <strong>주정 첨가</strong>
                <span>혼죠조</span>
                <span>긴죠</span>
                <span>다이긴죠</span>
              </div>
            </div>
          </article>

          <article className="product_guide_section">
            <h3>일본 주도</h3>
            <p>일본 주도는 술의 비중, 즉 단맛을 표현하는 단위입니다.</p>
            <div className="guide_scale">
              <span>-</span>
              <span>←</span>
              <strong>±0</strong>
              <span>→</span>
              <span>+</span>
              <div className="guide_scale_caption is_left">
                달달한
                <br />
                부드러운
                <br />
                아마구치
              </div>
              <div className="guide_scale_bottle" aria-hidden="true" />
              <div className="guide_scale_caption is_right">
                드라이한
                <br />
                깔끔한
                <br />
                가라구치
              </div>
            </div>
            <p>
              당분이 많아 술의 비중이 물보다 커질 때 -로 표시됩니다. 사케에 입문한다면 -2 정도의 달콤한 맛부터
              시작해보세요.
            </p>
          </article>

          <article className="product_guide_section">
            <h3>산도</h3>
            <p>산도는 사케에 포함된 산의 양을 뜻합니다.</p>
            <div className="guide_scale">
              <span>-</span>
              <span>←</span>
              <strong>0</strong>
              <span>→</span>
              <span>+</span>
              <div className="guide_scale_caption is_left">
                담백한
                <br />
                깔끔한
              </div>
              <div className="guide_scale_bottle" aria-hidden="true" />
              <div className="guide_scale_caption is_right">
                깊은
                <br />
                농후한
              </div>
            </div>
            <p>
              사케의 산도는 사케 제조 과정에서 생긴 젖산, 사과산 등을 의미합니다. 산도의 평균은 1.3~1.5이기
              때문에, 1~1.5 사이를 고르는 것을 추천합니다.
            </p>
          </article>
        </div>
      ) : null}
    </section>
  )
}
