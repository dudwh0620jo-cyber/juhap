import { Link } from "react-router"

type Props = {
  liquorTag: string
  foodTag: string
  liquorTo?: string
  foodTo?: string
  liquorState?: unknown
  foodState?: unknown
  onSelectLiquor?: () => void
  onSelectFood?: () => void
  containerClassName?: string
  tagClassName?: string
  joinerClassName?: string
  showJoiner?: boolean
  wrapJoinerToNextLine?: boolean
  lineClassName?: string
  ariaLabel?: string
}

type RenderTagProps = {
  label: string
  toneClassName: string
  tagClassName: string
  to?: string
  state?: unknown
  onClick?: () => void
}

function RenderTag({ label, toneClassName, tagClassName, to, state, onClick }: RenderTagProps) {
  const className = [tagClassName, toneClassName].filter(Boolean).join(" ")
  const content = (
    <>
      <span className={`${tagClassName}_label`}>{label}</span>
      <span className={`${tagClassName}_icon`} aria-hidden="true" />
    </>
  )

  if (to) {
    return (
      <Link className={className} to={to} state={state} onClick={(event) => event.stopPropagation()}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={(event) => {
          event.stopPropagation()
          onClick()
        }}
      >
        {content}
      </button>
    )
  }

  return <span className={className}>{content}</span>
}

export default function PairingTagRow({
  liquorTag,
  foodTag,
  liquorTo,
  foodTo,
  liquorState,
  foodState,
  onSelectLiquor,
  onSelectFood,
  containerClassName = "community_review_pair_tags",
  tagClassName = "community_review_pair_chip",
  joinerClassName = "similar_card_joiner",
  showJoiner = false,
  wrapJoinerToNextLine = false,
  lineClassName = "",
  ariaLabel = "페어링 태그",
}: Props) {
  const safeLiquorTag = liquorTag.trim()
  const safeFoodTag = foodTag.trim()

  if (!safeLiquorTag || !safeFoodTag) return null

  return (
    <div className={containerClassName} aria-label={ariaLabel}>
      {wrapJoinerToNextLine && showJoiner ? (
        <>
          <span className={lineClassName}>
            <RenderTag
              label={safeLiquorTag}
              toneClassName="is_drink"
              tagClassName={tagClassName}
              to={liquorTo}
              state={liquorState}
              onClick={onSelectLiquor}
            />
          </span>
          <span className={lineClassName}>
            <span className={joinerClassName}>&</span>{" "}
            <RenderTag
              label={safeFoodTag}
              toneClassName="is_food"
              tagClassName={tagClassName}
              to={foodTo}
              state={foodState}
              onClick={onSelectFood}
            />
          </span>
        </>
      ) : (
        <>
          <RenderTag
            label={safeLiquorTag}
            toneClassName="is_drink"
            tagClassName={tagClassName}
            to={liquorTo}
            state={liquorState}
            onClick={onSelectLiquor}
          />
          {showJoiner ? <span className={joinerClassName}>&</span> : null}
          <RenderTag
            label={safeFoodTag}
            toneClassName="is_food"
            tagClassName={tagClassName}
            to={foodTo}
            state={foodState}
            onClick={onSelectFood}
          />
        </>
      )}
    </div>
  )
}
