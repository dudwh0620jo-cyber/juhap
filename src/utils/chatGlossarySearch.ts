import { glossarySearchTerms } from "../data/chatGlossary"

function normalizeGlossaryKeyword(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "")
}

export function findGlossaryTopicMatch(rawInput: string, allowedTopics?: readonly string[]) {
  const input = normalizeGlossaryKeyword(rawInput)
  if (!input) return null

  const allowedTopicSet = allowedTopics ? new Set(allowedTopics) : null

  return glossarySearchTerms.find(({ topic, aliases }) =>
    (!allowedTopicSet || allowedTopicSet.has(topic)) &&
    aliases.some((alias) => input.includes(normalizeGlossaryKeyword(alias))),
  )?.topic ?? null
}
