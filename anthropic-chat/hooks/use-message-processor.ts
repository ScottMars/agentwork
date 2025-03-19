"use client"

import { useCallback } from "react"
import type { EcosystemState } from "@/types/ecosystem"
import type { EntityType } from "@/constants/ecosystem"
import { randomInt } from "@/utils/ecosystem-utils"
import { useCodex } from "./use-codex"
import { useEcosystemParameters } from "./use-ecosystem-parameters"
import { useEntityManagement } from "./use-entity-management"

// Constants for message processing
const USER_MESSAGE_INFLUENCE_CHANCE = 0.4

// Entity names mapping for detection in user messages
const ENTITY_NAMES = {
  resonant: ["resonant", "resonants", "resonance entity"],
  prismatic: ["prismatic", "prismatic drifter", "drifter", "prismatic drifters", "drifters"],
  weaver: ["weaver", "thought weaver", "weavers", "thought weavers"],
  dancer: ["dancer", "void dancer", "dancers", "void dancers"],
  collective: ["collective", "crystalline collective", "collectives", "crystalline collectives"],
  guardian: ["guardian", "etheric guardian"],
}

// Action words to detect entity requests
const ADD_ACTIONS = ["add", "create", "spawn", "make", "generate", "manifest", "bring", "summon"]
const REMOVE_ACTIONS = ["remove", "delete", "destroy", "eliminate", "kill", "despawn", "vanish", "banish"]

// Keywords for influencing ecosystem parameters
const INFLUENCE_KEYWORDS = {
  // Positive keywords increase parameters
  positive: ["harmony", "balance", "peace", "calm", "growth", "create", "build", "help", "love", "light"],
  // Negative keywords decrease parameters
  negative: ["chaos", "destroy", "break", "disrupt", "conflict", "dark", "death", "kill", "hate", "fear"],
  // Environment keywords can trigger environment changes
  environments: {
    tranquil: ["calm", "peace", "quiet", "still", "serene"],
    harmonic: ["balance", "harmony", "resonance", "flow", "music"],
    prismatic: ["color", "light", "rainbow", "crystal", "prism"],
    quantum: ["chaos", "random", "quantum", "uncertain", "probability"],
  },
}

export function useMessageProcessor(state: EcosystemState) {
  const { addCodexEntry } = useCodex(state)
  const { adjustParameter } = useEcosystemParameters(state)
  const { addEntity } = useEntityManagement(state)

  // Parse a user message to detect entity requests
  const parseEntityRequest = useCallback((message: string) => {
    const lowerMessage = message.toLowerCase()

    // Try to identify an action (add or remove)
    let action = null
    if (ADD_ACTIONS.some((word) => lowerMessage.includes(word))) {
      action = "add"
    } else if (REMOVE_ACTIONS.some((word) => lowerMessage.includes(word))) {
      action = "remove"
    }

    if (!action) return null

    // Try to identify an entity type
    let entityType: EntityType | null = null

    for (const [type, names] of Object.entries(ENTITY_NAMES)) {
      if (names.some((name) => lowerMessage.includes(name))) {
        entityType = type as EntityType
        break
      }
    }

    if (!entityType) return null

    // Return the parsed request
    return {
      action,
      entityType,
    }
  }, [])

  // Process a user message for ecosystem influence
  const processUserMessage = useCallback(
    (message: string, onEntityRequest?: (action: string, entityType: EntityType) => void) => {
      // Check for entity requests
      const entityRequest = parseEntityRequest(message)

      if (entityRequest && onEntityRequest) {
        // Send the request to the handler
        onEntityRequest(entityRequest.action, entityRequest.entityType)
        return // Skip the random influence
      }

      // Regular random influence processing
      if (Math.random() > USER_MESSAGE_INFLUENCE_CHANCE) return

      // Convert message to lowercase for easier matching
      const lowerMessage = message.toLowerCase()

      // Check for positive keywords
      const hasPositive = INFLUENCE_KEYWORDS.positive.some((keyword) => lowerMessage.includes(keyword))

      // Check for negative keywords
      const hasNegative = INFLUENCE_KEYWORDS.negative.some((keyword) => lowerMessage.includes(keyword))

      // Apply parameter changes based on keywords
      if (hasPositive) {
        // Increase harmony and resonance
        adjustParameter("harmony", randomInt(5, 15))
        adjustParameter("resonance", randomInt(5, 15))
      }

      if (hasNegative) {
        // Increase entropy and complexity
        adjustParameter("entropy", randomInt(5, 15))
        adjustParameter("complexity", randomInt(5, 15))
      }

      // Check for environment keywords
      Object.entries(INFLUENCE_KEYWORDS.environments).forEach(([envName, keywords]) => {
        if (keywords.some((keyword) => lowerMessage.includes(keyword)) && Math.random() < 0.3) {
          // 30% chance to change environment if keywords match
          state.environment = envName as any
        }
      })

      // Random entity creation based on message length
      if (message.length > 20 && Math.random() < 0.2) {
        const entityTypes: EntityType[] = ["resonant", "prismatic", "weaver", "dancer", "collective"]
        const randomType = entityTypes[randomInt(0, entityTypes.length - 1)]

        // Create the entity
        addEntity(randomType)

        // Add codex entry
        addCodexEntry(`User message influenced the manifestation of a ${randomType}.`)
      }
    },
    [parseEntityRequest, adjustParameter, addEntity, addCodexEntry],
  )

  return {
    parseEntityRequest,
    processUserMessage,
  }
}

