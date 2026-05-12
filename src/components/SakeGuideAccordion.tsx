import { useState } from "react"
import imgGuideBottle from "../assets/fd_guide_scale_bottle.png"
import iconCaretLeft from "../assets/svg/caretleft.svg"
import imgPolishFive from "../assets/svg/fd_polish_row_five.svg"
import imgPolishSeven from "../assets/svg/fd_polish_row_seven.svg"
import imgPolishSix from "../assets/svg/fd_polish_row_six.svg"

export default function SakeGuideAccordion() {
  const [isGuideOpen, setIsGuideOpen] = useState(true)

  return (
    <section className="product_guide" aria-label="사케 입문 가이드">
      <button className="product_guide_toggle" type="button" aria-expanded={isGuideOpen} onClick={() => setIsGuideOpen((current) => !current)}>
        <span>사케 입문 가이드</span>
        <img
          className={isGuideOpen ? "product_guide_caret is_open" : "product_guide_caret"}
          src={iconCaretLeft}
          alt=""
          aria-hidden="true"
        />
      </button>

      <div className={isGuideOpen ? "product_guide_body is_open" : "product_guide_body"} aria-hidden={!isGuideOpen}>
          <article className="product_guide_section product_polish_section">
            <div className="product_guide_intro">
              <h3>쌀과 정미율</h3>
              <p>사케는 정미율에 따라 등급이 나눠집니다.</p>
            </div>
            <div className="polish_table" aria-label="정미율 표">
              <div className="polish_label">정미율</div>
              <div className="polish_cell">
                <img src={imgPolishSeven} alt="" aria-hidden="true" />
                <strong>70% 이하</strong>
              </div>
              <div className="polish_cell">
                <img src={imgPolishSix} alt="" aria-hidden="true" />
                <strong>60% 이하</strong>
              </div>
              <div className="polish_cell">
                <img src={imgPolishFive} alt="" aria-hidden="true" />
                <strong>50% 이하</strong>
              </div>
              <div className="polish_label">주정<br />무첨가</div>
              <div className="polish_cell is_compact">
                <span className="polish_main">준마이</span>
                <span className="polish_sub">(정미율제한X)</span>
              </div>
              <div className="polish_cell">준마이<br />긴죠</div>
              <div className="polish_cell">준마이<br />다이긴죠</div>
              <div className="polish_label">주정첨가</div>
              <div className="polish_cell">혼죠조</div>
              <div className="polish_cell">긴죠</div>
              <div className="polish_cell">다이긴죠</div>
            </div>
          </article>

          <article className="product_guide_section">
            <div className="product_guide_scale_group">
              <div className="product_guide_intro">
                <h3>일본 주도</h3>
                <p>일본 주도는 술의 비중, 즉 단맛을 표현하는 단위 입니다.</p>
              </div>
              <div className="guide_scale">
                <div className="guide_scale_marks" aria-hidden="true">
                  <span>-</span>
                  <span>←</span>
                  <strong>0</strong>
                  <span>→</span>
                  <span>+</span>
                </div>
                <div className="guide_scale_content">
                  <div className="guide_scale_caption is_left">
                    <span className="guide_scale_text">달콤한</span>
                    <span className="guide_scale_text">부드러운</span>
                    <span className="guide_scale_text">
                      아마구치
                      <small>(甘口)</small>
                    </span>
                  </div>
                  <img className="guide_scale_bottle" src={imgGuideBottle} alt="" aria-hidden="true" />
                  <div className="guide_scale_caption is_right">
                    <span className="guide_scale_text">드라이한</span>
                    <span className="guide_scale_text">깔끔한</span>
                    <span className="guide_scale_text">
                      가라구치
                      <small>(辛口)</small>
                    </span>
                  </div>
                </div>
              </div>
              <p>
                당분이 많아 술의 비중이 물보다 커질 때 -로 표시합니다.<br />
                <strong> 사케에 입문한다면 -2 정도의 달콤한 맛부터</strong> 시작해보세요.
              </p>
            </div>
          </article>

          <article className="product_guide_section">
            <div className="product_guide_scale_group">
              <div className="product_guide_intro">
                <h3>산도</h3>
                <p>산도는 사케에 포함된 산의 양을 뜻합니다.</p>
              </div>
              <div className="guide_scale">
                <div className="guide_scale_marks" aria-hidden="true">
                  <span>-</span>
                  <span>←</span>
                  <strong>0</strong>
                  <span>→</span>
                  <span>+</span>
                </div>
                <div className="guide_scale_content">
                  <div className="guide_scale_caption is_left">
                    <span className="guide_scale_text">담백한</span>
                    <span className="guide_scale_text">깔끔한</span>
                  </div>
                  <img className="guide_scale_bottle" src={imgGuideBottle} alt="" aria-hidden="true" />
                  <div className="guide_scale_caption is_right">
                    <span className="guide_scale_text">깊은</span>
                    <span className="guide_scale_text">농후한</span>
                  </div>
                </div>
              </div>
              <p>
                사케의 산도는 사케 제조 과정에서 생긴 젖산, 사과산 등을 의미합니다.
                <strong> 산도의 평균은 1.3~1.5이기 때문에, 1~1.5 사이를</strong> 고르는 것을 추천합니다.
              </p>
            </div>
          </article>
      </div>
    </section>
  )
}
