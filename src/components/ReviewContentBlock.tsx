import type { ReactNode } from "react"
import iconLocation from "../assets/svg/mappin.svg"
import PairingTagRow from "./PairingTagRow"

type Props = {
  className?: string
  mainClassName?: string
  introClassName?: string
  title: ReactNode
  liquorTag: string
  foodTag: string
  body: string
  hashtags?: string[]
  locationLabel?: string
  titleClassName?: string
  bodyClassName?: string
  hashtagsClassName?: string
  locationClassName?: string
  locationIconClassName?: string
  liquorTo?: string
  foodTo?: string
  liquorState?: unknown
  foodState?: unknown
  onSelectLiquor?: () => void
  onSelectFood?: () => void
  tagRowClassName?: string
  tagClassName?: string
}

export default function ReviewContentBlock({
  className = "review_content_block",
  mainClassName = "review_content_block_main",
  introClassName = "review_content_block_intro",
  title,
  liquorTag,
  foodTag,
  body,
  hashtags,
  locationLabel,
  titleClassName,
  bodyClassName,
  hashtagsClassName = "community_review_hashtags",
  locationClassName = "community_review_location",
  locationIconClassName,
  liquorTo,
  foodTo,
  liquorState,
  foodState,
  onSelectLiquor,
  onSelectFood,
  tagRowClassName = "community_review_pair_tags",
  tagClassName = "community_review_pair_chip",
}: Props) {
  const visibleHashtags = hashtags ?? []

  return (
    <div className={className}>
      <div className={mainClassName}>
        <div className={introClassName}>
          {title ? <div className={titleClassName}>{title}</div> : null}
          <PairingTagRow
            liquorTag={liquorTag}
            foodTag={foodTag}
            liquorTo={liquorTo}
            foodTo={foodTo}
            liquorState={liquorState}
            foodState={foodState}
            onSelectLiquor={onSelectLiquor}
            onSelectFood={onSelectFood}
            containerClassName={tagRowClassName}
            tagClassName={tagClassName}
          />
        </div>
        <p className={bodyClassName}>{body}</p>
        {visibleHashtags.length > 0 ? (
          <div className={hashtagsClassName} aria-label="해시태그">
            {visibleHashtags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        ) : null}
      </div>

      {locationLabel ? (
        <p className={locationClassName}>
          <img className={locationIconClassName} src={iconLocation} alt="" aria-hidden="true" />
          <span>{locationLabel}</span>
        </p>
      ) : null}
    </div>
  )
}
