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
  selectedWine: WineCandidate | null
  recommendations: WineCandidate[]
  onSelectGlossaryTopic: (value: string) => void
  onSelectPartyMood: (value: string) => void
  onSelectFood: (value: string) => void
  onSelectWineStyle: (value: string) => void
  onOpenDetail: (wineId: string, label: string) => void
  onOpenPairing: () => void
  onBackToRecommend: () => void
  onMoreRecommendations: () => void
  onConfirmSelection: () => void
  onClose: () => void
}

export default function ChatStepPanel({
  step,
  isVisible,
  selectionEcho,
  selectedWine,
  recommendations,
  onSelectGlossaryTopic,
  onSelectPartyMood,
  onSelectFood,
  onSelectWineStyle,
  onOpenDetail,
  onOpenPairing,
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
          {glossaryOptions.map((item) => (
            <button type="button" key={item} className="chat_chip" onClick={() => onSelectGlossaryTopic(item)}>
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
              className={item === "사케" ? "chat_chip" : "chat_chip chat_chip_static"}
              onClick={() => onSelectWineStyle(item)}
              disabled={item !== "사케"}
              aria-disabled={item !== "사케"}
            >
              {item}
            </button>
          ))}
        </ChatChoiceRow>
      ) : null}

      {step === "recommend" ? (
        <ChatRecommendPanel
          recommendations={recommendations}
          onOpenDetail={(wineId, label) => onOpenDetail(wineId, label)}
          onMore={onMoreRecommendations}
        />
      ) : null}

      {step === "detail" && selectedWine ? (
        <ChatDetailPanel wine={selectedWine} onOpenPairing={onOpenPairing} onBack={onBackToRecommend} />
      ) : null}

      {step === "pairing" && selectedWine ? (
        <ChatPairingPanel wine={selectedWine} onConfirm={onConfirmSelection} onBack={onBackToRecommend} />
      ) : null}

      {step === "done" && selectedWine ? (
        <ChatDonePanel wine={selectedWine} onClose={onClose} />
      ) : null}
    </div>
  )
}

