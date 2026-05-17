import imgDassai23 from "../assets/chat_dassai_23.png"
import imgKubotaManju from "../assets/chat_kubota_manju.png"
import imgDenshuJunmaiDaiginjo from "../assets/drink_denshu_junmai_daiginjo.png"
import imgGekkeikanHorin from "../assets/drink_gekkeikan_horin.png"
import imgHakkaisanDaiginjo from "../assets/drink_hakkaisan_daiginjo.png"
import imgJuyondaiSeries from "../assets/drink_juyondai_series.png"
import imgKamoshibitoKuheiji from "../assets/drink_kamoshibito_kuheiji.png"
import imgKubotaManjyuList from "../assets/drink_kubota_manjyu.png"
import imgNabeshimaDaiginjo from "../assets/drink_nabeshima_daiginjo.png"
import imgOnnanakase from "../assets/drink_onnanakase.png"
import imgDassai23List from "../assets/product_dassai_23.png"
import imgMoreMascot from "../assets/ai_chat_more_01.png"
import iconSparkle from "../assets/svg/boxicons_sparkle_01.svg"
import iconCaretRight from "../assets/svg/caretright.svg"
import type { WineCandidate } from "../utils/chatBotFlow"

type ChatRecommendPanelProps = {
  recommendations: WineCandidate[]
  selectedWineId: string | null
  onSave: (wineId: string) => void
  onGoProductDetail: (wineId: string) => void
  onMore: () => void
}

const featuredImageById: Record<string, string> = {
  "sake-dassai-23": imgDassai23,
  "sake-kubota-manju": imgKubotaManju,
}

const categoryListImageById: Record<string, string> = {
  "sake-dassai-23": imgDassai23List,
  "sake-kubota-manju": imgKubotaManjyuList,
  "sake-kamoshibito-kuheiji": imgKamoshibitoKuheiji,
  "sake-hakkaisan-daiginjo": imgHakkaisanDaiginjo,
  "sake-nabeshima-daiginjo": imgNabeshimaDaiginjo,
  "sake-denshu-junmai-daiginjo": imgDenshuJunmaiDaiginjo,
  "sake-juyondai-series": imgJuyondaiSeries,
  "sake-gekkeikan-horin": imgGekkeikanHorin,
  "sake-onnanakase": imgOnnanakase,
}

const RESULT_LABEL = "추천 결과"
const TAG_LABEL = "태그"
const DETAILS_LABEL = "자세히 보기"
const SAVE_LABEL = "추천 저장하기"
const MORE_LABEL = "다른 술 더보기"

function getCandidateImage(candidateId: string) {
  return featuredImageById[candidateId] ?? categoryListImageById[candidateId]
}

function getFallbackLabel(candidateId: string) {
  return candidateId.startsWith("sake-") ? "SAKE" : "WINE"
}

export default function ChatRecommendPanel({
  recommendations,
  selectedWineId,
  onSave,
  onGoProductDetail,
  onMore,
}: ChatRecommendPanelProps) {
  return (
    <div className="chat_recommend_panel" aria-label={RESULT_LABEL}>
      <div className="chat_recommend_list">
        {recommendations.map((candidate) => {
          const isSelected = candidate.id === selectedWineId
          const imageSrc = getCandidateImage(candidate.id)

          return (
            <article key={candidate.id} className={isSelected ? "chat_recommend_card is_selected" : "chat_recommend_card"}>
              <div className="chat_recommend_card_inner">
                <div className="chat_recommend_card_left">
                  <div className="chat_recommend_badge" aria-label="주아의 추천">
                    <img src={iconSparkle} alt="" aria-hidden="true" />
                    <span>주아의 추천</span>
                  </div>
                  <div className="chat_recommend_card_thumb" aria-hidden="true">
                    {imageSrc ? <img src={imageSrc} alt="" /> : <span>{getFallbackLabel(candidate.id)}</span>}
                  </div>
                </div>
                <div className="chat_recommend_card_body">
                  <p className="chat_recommend_quote">{candidate.notes[0]}</p>
                  <div className="chat_recommend_card_title">{candidate.name}</div>
                  <div className="chat_recommend_card_subtitle">{candidate.subtitle}</div>
                  <p className="chat_recommend_card_desc">{candidate.notes[1] ?? candidate.tips[0]}</p>
                  <div className="chat_recommend_card_tags" aria-label={TAG_LABEL}>
                    {candidate.tastingNotes.slice(0, 3).map((tag) => (
                      <span className="chat_recommend_tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="chat_recommend_card_actions">
                    <button type="button" className="chat_action_button" onClick={() => onGoProductDetail(candidate.id)}>
                      {DETAILS_LABEL}
                    </button>
                    <button
                      type="button"
                      className="chat_action_button chat_action_button_secondary chat_action_button_save"
                      onClick={() => onSave(candidate.id)}
                    >
                      {SAVE_LABEL}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}

        <article className="chat_recommend_card chat_recommend_more_card" aria-label="추가 추천">
          <div className="chat_recommend_more_inner">
            <h4>다른 추천도 준비했어요</h4>
            <p>
              당신의 취향에 맞는
              <br />
              다양한 술을 더 만나보세요!
            </p>
            <img src={imgMoreMascot} alt="" aria-hidden="true" />
            <button type="button" className="chat_action_button chat_action_button_secondary chat_action_button_more" onClick={onMore}>
              <span>{MORE_LABEL}</span>
              <img src={iconCaretRight} alt="" aria-hidden="true" />
            </button>
          </div>
        </article>
      </div>
    </div>
  )
}
