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
import type { WineCandidate } from "../utils/chatBotFlow"

type ChatRecommendPanelProps = {
  recommendations: WineCandidate[]
  selectedWineId: string | null
  onSelect: (wineId: string) => void
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

const RESULT_LABEL = "\uCD94\uCC9C \uACB0\uACFC"
const TAG_LABEL = "\uD0DC\uADF8"
const DETAILS_LABEL = "\uC790\uC138\uD788 \uBCF4\uAE30"
const SAVE_LABEL = "\uCD94\uCC9C \uC800\uC7A5\uD558\uAE30"
const MORE_LABEL = "\uB2E4\uB978 \uC220 \uB354\uBCF4\uAE30"

function getCandidateImage(candidateId: string) {
  return featuredImageById[candidateId] ?? categoryListImageById[candidateId]
}

function getFallbackLabel(candidateId: string) {
  return candidateId.startsWith("sake-") ? "SAKE" : "WINE"
}

export default function ChatRecommendPanel({
  recommendations,
  selectedWineId,
  onSelect,
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
              <p className="chat_recommend_quote">{candidate.notes[0]}</p>
              <div className="chat_recommend_card_inner">
                <div className="chat_recommend_card_thumb" aria-hidden="true">
                  {imageSrc ? <img src={imageSrc} alt="" /> : <span>{getFallbackLabel(candidate.id)}</span>}
                </div>
                <div className="chat_recommend_card_body">
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
                      className="chat_action_button chat_action_button_secondary"
                      onClick={() => onSelect(candidate.id)}
                    >
                      {SAVE_LABEL}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}

        <article className="chat_recommend_card chat_recommend_more_card">
          <button type="button" className="chat_action_button chat_action_button_secondary" onClick={onMore}>
            {MORE_LABEL}
          </button>
        </article>
      </div>
    </div>
  )
}
