"use client"

import { useCallback } from "react"
import type { EcosystemState } from "@/types/ecosystem"
import type { EntityType, EnvironmentType } from "@/constants/ecosystem"
import { randomInt } from "@/utils/ecosystem-utils"
import { useCodex } from "./use-codex"
import { useEntityManagement } from "./use-entity-management"

// Constants for evolution
const AUTO_ENTITY_TYPES: EntityType[] = ["resonant", "prismatic", "weaver", "dancer", "collective"]

export function useEcosystemEvolution(state: EcosystemState) {
  const { addCodexEntry } = useCodex(state)
  const { addEntity, removeEntity, findOldestEntity, areEntitiesClose } = useEntityManagement(state)

  // Update environment state
  const updateEnvironment = useCallback(() => {
    state.environmentFrame++

    // Every 50 cycles, consider changing environment
    if (state.cycle % 50 === 0 && !state.guardian.active) {
      const roll = Math.random() * 100
      let newEnvironment: EnvironmentType

      if (roll < 15) {
        newEnvironment = "quantum"
      } else if (roll < 30) {
        newEnvironment = "prismatic"
      } else if (roll < 60) {
        newEnvironment = "harmonic"
      } else {
        newEnvironment = "tranquil"
      }

      if (newEnvironment !== state.environment) {
        state.environment = newEnvironment
        addCodexEntry(`Etheric Sea shifted to ${newEnvironment} state.`)
      }
    }
  }, [state, addCodexEntry])

  // Process random events
  const processRandomEvents = useCallback(() => {
    // Rare chance for special events
    if (Math.random() < 0.05) {
      // Entity interaction
      checkEntityInteractions()

      // Harmonic convergence
      if (state.params.resonance > 70 && state.params.harmony > 75) {
        addCodexEntry("Harmonic convergence detected in the Etheric Sea.")
        state.params.resonance += 5
      }

      // Energy flux
      if (state.params.entropy > 60) {
        addCodexEntry("Energy flux destabilizing the ecosystem.")
        state.params.harmony -= 5
      }
    }
  }, [state, addCodexEntry])

  // Check for entity interactions
  const checkEntityInteractions = useCallback(() => {
    // Simple version: check for entities close to each other
    for (let i = 0; i < state.entities.length; i++) {
      for (let j = i + 1; j < state.entities.length; j++) {
        const ent1 = state.entities[i]
        const ent2 = state.entities[j]

        // Skip if either is guardian
        if (ent1.type === "guardian" || ent2.type === "guardian") continue

        // If entities are close
        if (areEntitiesClose(ent1, ent2)) {
          // Resonant + Resonant near a Prismatic can form a Thought Weaver
          if (
            ent1.type === "resonant" &&
            ent2.type === "resonant" &&
            state.entities.some(
              (e) =>
                e.type === "prismatic" &&
                Math.abs(e.position.x - ent1.position.x) < 15 &&
                Math.abs(e.position.y - ent1.position.y) < 8,
            )
          ) {
            if (Math.random() < 0.3 && state.params.complexity > 40) {
              // Create a new weaver at the midpoint between the two resonants
              const newPosition = {
                x: Math.floor((ent1.position.x + ent2.position.x) / 2),
                y: Math.floor((ent1.position.y + ent2.position.y) / 2),
              }

              addEntity("weaver")
              addCodexEntry("Two Resonants harmonized near a Prismatic Drifter to form a Thought Weaver.")

              // Remove the original resonants
              removeEntity(i)
              removeEntity(j - 1) // j-1 because i was removed
              return // Exit as indices are now invalid
            }
          }

          // Prismatic + Weaver can form a Void Dancer
          if (
            (ent1.type === "prismatic" && ent2.type === "weaver") ||
            (ent1.type === "weaver" && ent2.type === "prismatic")
          ) {
            if (Math.random() < 0.2 && state.params.resonance > 60) {
              // Create a new dancer at the midpoint
              const newPosition = {
                x: Math.floor((ent1.position.x + ent2.position.x) / 2),
                y: Math.floor((ent1.position.y + ent2.position.y) / 2),
              }

              addEntity("dancer")
              addCodexEntry("A Prismatic Drifter and Thought Weaver merged into a Void Dancer.")
              // Don't remove the parent entities for this transformation
              return
            }
          }
        }
      }
    }
  }, [state, addEntity, removeEntity, areEntitiesClose, addCodexEntry])

  // Process entity lifecycle (spawning/despawning)
  const processEntityLifecycle = useCallback(() => {
    // Spawn new entities occasionally
    if (Math.random() < 0.1) {
      const spawnRoll = Math.random() * 100

      if (spawnRoll < state.params.resonance / 2) {
        addEntity("resonant")
      } else if (spawnRoll < state.params.resonance / 2 + state.params.complexity / 3) {
        addEntity("prismatic")
      }

      // Special condition for Crystalline Collective
      if (
        state.params.harmony > 80 &&
        state.params.complexity > 70 &&
        state.counts.weaver >= 2 &&
        state.counts.dancer >= 1 &&
        Math.random() < 0.1
      ) {
        addEntity("collective")
        addCodexEntry("High harmony and complexity allowed a Crystalline Collective to form!")
      }
    }

    // Despawn old entities
    for (let i = state.entities.length - 1; i >= 0; i--) {
      const entity = state.entities[i]

      // Skip guardian
      if (entity.type === "guardian") continue

      // Each entity type has different lifespan
      let lifespan = 100 // Default

      switch (entity.type) {
        case "resonant":
          lifespan = 150 + randomInt(0, 50)
          break
        case "prismatic":
          lifespan = 200 + randomInt(0, 100)
          break
        case "weaver":
          lifespan = 120 + randomInt(0, 80)
          break
        case "dancer":
          lifespan = 100 + randomInt(0, 50)
          break
        case "collective":
          lifespan = 250 + randomInt(0, 150)
          break
      }

      // Entropy shortens lifespan
      lifespan -= Math.floor(state.params.entropy / 10)

      // Remove if too old
      if (entity.age > lifespan || Math.random() < 0.001) {
        removeEntity(i)
      }
    }
  }, [state, addEntity, removeEntity, addCodexEntry])

  // Autonomous entity evolution - either create a new entity or remove an old one
  const evolveEcosystemEntities = useCallback(
    (onNewEntityRequest?: () => void, onEntityRemoved?: (entityType: EntityType) => void) => {
      // Skip if the guardian is not active
      if (!state.guardian.active) return

      // Let the Guardian decide: add or remove (25% chance to remove if we have entities, otherwise always add)
      const shouldRemove = state.entities.length > 5 && Math.random() < 0.25

      if (shouldRemove) {
        // Find the oldest non-guardian entity
        const oldestEntityIndex = findOldestEntity()

        if (oldestEntityIndex !== -1) {
          const entityToRemove = state.entities[oldestEntityIndex]
          const entityType = entityToRemove.type

          // Remove the entity
          if (removeEntity(oldestEntityIndex)) {
            // Add codex entry
            addCodexEntry(`Guardian autonomously dissolved a ${entityType} entity that had completed its cycle.`)

            // Notify about entity removal
            if (onEntityRemoved) {
              onEntityRemoved(entityType)
            }
          }
        }
      } else {
        // Create a new entity - potentially a unique one
        const useExistingType = Math.random() < 0.7 // 70% chance to use existing types

        if (useExistingType) {
          // Choose a random existing entity type
          const randomType = AUTO_ENTITY_TYPES[Math.floor(Math.random() * AUTO_ENTITY_TYPES.length)]

          // Create the entity
          addEntity(randomType)

          // Add codex entry
          addCodexEntry(`Guardian autonomously manifested a new ${randomType} entity in response to ecosystem needs.`)
        } else if (onNewEntityRequest) {
          // Request a new entity type
          onNewEntityRequest()
        }
      }
    },
    [state, findOldestEntity, removeEntity, addEntity, addCodexEntry],
  )

  return {
    updateEnvironment,
    processRandomEvents,
    checkEntityInteractions,
    processEntityLifecycle,
    evolveEcosystemEntities,
  }
}

