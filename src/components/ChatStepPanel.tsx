import {
  foodCategoryOptions,
  glossaryOptions,
  partyMoodOptions,
  wineStyleOptions,
  type ChatStep,
  type WineCandidate,
} from "../utils/chatBotFlow"
import ChatChoiceRow from "./ChatChoiceRow"
import ChatDetailPanel from "./ChatDetailPanel"
import ChatDonePanel from "./ChatDonePanel"
import ChatPairingPanel from "./ChatPairingPanel"
import ChatRecommendPanel from "./ChatRecommendPanel"

type ChatStepPanelProps = {
  step: ChatStep
  isVisible: boolean
  selectionEcho: string | null
  glossaryItems?: string[]
  activeGlossaryOption?: string | null
  selectedWine: WineCandidate | null
  recommendations: WineCandidate[]
  onSelectGlossaryTopic: (value: string) => void
  onSelectPartyMood: (value: string) => void
  onSelectFood: (value: string) => void
  onSelectWineStyle: (value: string) => void
  onSelectRecommendation: (wineId: string) => void
  onGoProductDetail: (wineId: string) => void
  onBackToRecommend: () => void
  onMoreRecommendations: () => void
  onConfirmSelection: () => void
  onClose: () => void
}

export default function ChatStepPanel({
  step,
  isVisible,
  selectionEcho,
  glossaryItems = glossaryOptions,
  activeGlossaryOption,
  selectedWine,
  recommendations,
  onSelectGlossaryTopic,
  onSelectPartyMood,
  onSelectFood,
  onSelectWineStyle,
  onSelectRecommendation,
  onGoProductDetail,
  onBackToRecommend,
  onMoreRecommendations,
  onConfirmSelection,
  onClose,
}: ChatStepPanelProps) {
  if (!isVisible) return null

  return (
    <div className="chat_step_panel" aria-label="선택지">
      {step === "glossary" ? (
        <ChatChoiceRow echoText={selectionEcho}>
          {glossaryItems.map((item) => (
            <button
              type="button"
              key={item}
              className={item === activeGlossaryOption ? "chat_chip is_active" : "chat_chip"}
              onClick={() => onSelectGlossaryTopic(item)}
            >
              {item}
            </button>
          ))}
        </ChatChoiceRow>
      ) : null}

      {step === "party_mood" ? (
        <ChatChoiceRow echoText={selectionEcho}>
          {partyMoodOptions.map((item) => (
            <button type="button" key={item} className="chat_chip" onClick={() => onSelectPartyMood(item)}>
              {item}
            </button>
          ))}
        </ChatChoiceRow>
      ) : null}

      {step === "food" ? (
        <ChatChoiceRow echoText={selectionEcho}>
          {foodCategoryOptions.map((item) => (
            <button type="button" key={item} className="chat_chip" onClick={() => onSelectFood(item)}>
              {item}
            </button>
          ))}
        </ChatChoiceRow>
      ) : null}

      {step === "wine_style" ? (
        <ChatChoiceRow echoText={selectionEcho}>
          {wineStyleOptions.map((item) => (
            <button
              type="button"
              key={item}
              className="chat_chip"
              onClick={() => onSelectWineStyle(item)}
            >
              {item}
            </button>
          ))}
        </ChatChoiceRow>
      ) : null}

      {step === "recommend" ? (
        <ChatRecommendPanel
          recommendations={recommendations}
          selectedWineId={selectedWine?.id ?? null}
          onSelect={(wineId) => onSelectRecommendation(wineId)}
          onGoProductDetail={(wineId) => onGoProductDetail(wineId)}
          onMore={onMoreRecommendations}
        />
      ) : null}

      {step === "detail" && selectedWine ? <ChatDetailPanel wine={selectedWine} onBack={onBackToRecommend} onConfirm={onConfirmSelection} /> : null}

      {step === "pairing" && selectedWine ? <ChatPairingPanel wine={selectedWine} onConfirm={onConfirmSelection} onBack={onBackToRecommend} /> : null}

      {step === "done" && selectedWine ? <ChatDonePanel wine={selectedWine} onClose={onClose} /> : null}
    </div>
  )
}
