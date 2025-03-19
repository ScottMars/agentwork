"use client"

import { useState, useEffect } from "react"
import type { EcosystemState, Entity } from "@/types/ecosystem"
import { entities, guardianTraits, type EntityType, type EnvironmentType } from "@/constants/ecosystem"
import { randomInt, clamp } from "@/utils/ecosystem-utils"
import { useEcosystem as useEcosystemContext } from "@/context/ecosystem-context"

const initialState: EcosystemState = {
  cycle: 1,
  environment: "tranquil",
  environmentFrame: 0,
  entities: [],
  params: {
    resonance: 50,
    complexity: 30,
    harmony: 65,
    entropy: 25,
  },
  counts: {
    resonant: 0,
    prismatic: 0,
    weaver: 0,
    dancer: 0,
    collective: 0,
    guardian: 0,
  },
  codexEntries: [],
  guardian: {
    active: false,
    mood: "analytical",
    focus: "general harmony",
    position: { x: 30, y: 5 },
    lastAction: 0,
    actionCooldown: 20,
    suggestionHistory: [],
  },
}

export function useEcosystem() {
  const [state, setState] = useState<EcosystemState>(initialState)

  // Получаем доступ к контексту экосистемы для пользовательских сущностей
  const { entities: contextEntities } = useEcosystemContext()

  // Initialize ecosystem
  useEffect(() => {
    initialize()
    const intervalId = setInterval(update, 1000)
    return () => clearInterval(intervalId)
  }, [])

  // Initialize function
  const initialize = () => {
    createEntity("resonant", { x: 10, y: 10 })
    createEntity("resonant", { x: 25, y: 8 })
    createEntity("resonant", { x: 40, y: 12 })
    createEntity("prismatic", { x: 60, y: 8 })
    createGuardian()
  }

  // Create the guardian entity
  const createGuardian = () => {
    createEntity("guardian", { x: 30, y: 5 })
    setState((prev) => ({
      ...prev,
      guardian: {
        ...prev.guardian,
        active: true,
        lastAction: prev.cycle,
      },
    }))
    updateGuardianMood()
    updateGuardianFocus()
    addCodexEntry("The Etheric Guardian has manifested in the ecosystem.")
  }

  // Update guardian mood randomly
  const updateGuardianMood = () => {
    const mood = guardianTraits.moods[Math.floor(Math.random() * guardianTraits.moods.length)]
    setState((prev) => ({
      ...prev,
      guardian: {
        ...prev.guardian,
        mood,
      },
    }))
  }

  // Update guardian focus randomly
  const updateGuardianFocus = () => {
    const focus = guardianTraits.focuses[Math.floor(Math.random() * guardianTraits.focuses.length)]
    setState((prev) => ({
      ...prev,
      guardian: {
        ...prev.guardian,
        focus,
      },
    }))
  }

  // Update function - called on each tick
  const update = () => {
    setState((prev) => {
      const newState = { ...prev, cycle: prev.cycle + 1 }

      // Gradually shift parameters
      driftParameters(newState)

      // Environment cycles
      updateEnvironment(newState)

      // Update entity positions
      updateEntities(newState)

      // Random events
      processRandomEvents(newState)

      // Entity spawning/despawning
      processEntityLifecycle(newState)

      // Update guardian
      updateGuardian(newState)

      return newState
    })
  }

  // Create an entity and add to state
  const createEntity = (type: EntityType, position: { x: number; y: number }) => {
    setState((prev) => {
      // Получаем шаблон из стандартных сущностей или из контекста
      let pattern
      if (entities[type]) {
        pattern = entities[type].patterns[0] // Default pattern from standard entities
      } else if (contextEntities[type]) {
        pattern = contextEntities[type].patterns[0] // Pattern from context
      } else {
        // Если шаблон не найден, используем простой запасной вариант
        pattern = ["*", "/|\\", "/ \\"]
        console.warn(`Entity type ${type} not found, using default pattern`)
      }

      const entity: Entity = {
        type: type,
        position: position,
        pattern: pattern,
        frame: 0,
        age: 0,
        direction: {
          x: Math.random() > 0.5 ? 1 : -1,
          y: Math.random() > 0.5 ? 1 : -1,
        },
        speed: type === "prismatic" ? 2 : 1,
      }

      const newEntities = [...prev.entities, entity]

      // Инициализируем счетчик для нового типа, если его еще нет
      const newCounts = { ...prev.counts }
      if (!(type in newCounts)) {
        newCounts[type] = 0
      }
      newCounts[type]++

      // Add discovery to codex if new entity type is found
      if (newCounts[type] === 1 && type !== "guardian") {
        addCodexEntry(`Discovered first ${type.charAt(0).toUpperCase() + type.slice(1)} entity at cycle ${prev.cycle}.`)
      }

      return {
        ...prev,
        entities: newEntities,
        counts: newCounts,
      }
    })
  }

  // Remove an entity from state
  const removeEntity = (index: number) => {
    setState((prev) => {
      const entity = prev.entities[index]

      // Don't remove the guardian
      if (entity.type === "guardian") return prev

      const newEntities = [...prev.entities]
      newEntities.splice(index, 1)

      return {
        ...prev,
        entities: newEntities,
        counts: {
          ...prev.counts,
          [entity.type]: prev.counts[entity.type] - 1,
        },
      }
    })
  }

  // Add entry to codex
  const addCodexEntry = (text: string) => {
    setState((prev) => ({
      ...prev,
      codexEntries: [...prev.codexEntries, { cycle: prev.cycle, text }],
    }))
  }

  // Randomly change parameters slightly
  const driftParameters = (currentState: EcosystemState) => {
    currentState.params.resonance = clamp(currentState.params.resonance + randomInt(-2, 2), 0, 100)
    currentState.params.complexity = clamp(currentState.params.complexity + randomInt(-1, 1), 0, 100)
    currentState.params.harmony = clamp(currentState.params.harmony + randomInt(-2, 2), 0, 100)
    currentState.params.entropy = clamp(currentState.params.entropy + randomInt(-1, 2), 0, 100)
  }

  // Update environment state
  const updateEnvironment = (currentState: EcosystemState) => {
    currentState.environmentFrame++

    // Every 50 cycles, consider changing environment
    if (currentState.cycle % 50 === 0 && !currentState.guardian.active) {
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

      if (newEnvironment !== currentState.environment) {
        currentState.environment = newEnvironment
        addCodexEntry(`Etheric Sea shifted to ${newEnvironment} state.`)
      }
    }
  }

  // Update entity positions and states
  const updateEntities = (currentState: EcosystemState) => {
    currentState.entities.forEach((entity) => {
      // Age the entity
      entity.age++

      // Animate entity (cycle through frames)
      if (currentState.cycle % 3 === 0) {
        // Проверяем, существует ли тип сущности в стандартном объекте entities
        if (entities[entity.type]) {
          entity.frame = (entity.frame + 1) % entities[entity.type].patterns.length
        }
        // Если нет, проверяем в контексте
        else if (contextEntities[entity.type]) {
          entity.frame = (entity.frame + 1) % contextEntities[entity.type].patterns.length
        }
        // Если тип не найден нигде, не меняем frame
      }

      // Move entity (except guardian)
      if (currentState.cycle % (5 - entity.speed) === 0 && entity.type !== "guardian") {
        // Chance to change direction
        if (Math.random() < 0.1) {
          entity.direction.x = Math.random() > 0.5 ? 1 : -1
          entity.direction.y = Math.random() > 0.5 ? 1 : -1
        }

        // Move in current direction
        entity.position.x += entity.direction.x
        entity.position.y += entity.direction.y

        // Boundary checking
        if (entity.position.x < 0) {
          entity.position.x = 0
          entity.direction.x *= -1
        }
        if (entity.position.x > 70) {
          entity.position.x = 70
          entity.direction.x *= -1
        }
        if (entity.position.y < 0) {
          entity.position.y = 0
          entity.direction.y *= -1
        }
        if (entity.position.y > 15) {
          entity.position.y = 15
          entity.direction.y *= -1
        }
      }
    })
  }

  // Process random events
  const processRandomEvents = (currentState: EcosystemState) => {
    // Rare chance for special events
    if (Math.random() < 0.05) {
      // Entity interaction
      checkEntityInteractions(currentState)

      // Harmonic convergence
      if (currentState.params.resonance > 70 && currentState.params.harmony > 75) {
        addCodexEntry("Harmonic convergence detected in the Etheric Sea.")
        currentState.params.resonance += 5
      }

      // Energy flux
      if (currentState.params.entropy > 60) {
        addCodexEntry("Energy flux destabilizing the ecosystem.")
        currentState.params.harmony -= 5
      }
    }
  }

  // Check for entity interactions
  const checkEntityInteractions = (currentState: EcosystemState) => {
    // Simple version: check for entities close to each other
    for (let i = 0; i < currentState.entities.length; i++) {
      for (let j = i + 1; j < currentState.entities.length; j++) {
        const ent1 = currentState.entities[i]
        const ent2 = currentState.entities[j]

        // Skip if either is guardian
        if (ent1.type === "guardian" || ent2.type === "guardian") continue

        const dx = Math.abs(ent1.position.x - ent2.position.x)
        const dy = Math.abs(ent1.position.y - ent2.position.y)

        // If entities are close
        if (dx < 10 && dy < 5) {
          // Resonant + Resonant near a Prismatic can form a Thought Weaver
          if (
            ent1.type === "resonant" &&
            ent2.type === "resonant" &&
            currentState.entities.some(
              (e) =>
                e.type === "prismatic" &&
                Math.abs(e.position.x - ent1.position.x) < 15 &&
                Math.abs(e.position.y - ent1.position.y) < 8,
            )
          ) {
            if (Math.random() < 0.3 && currentState.params.complexity > 40) {
              createEntity("weaver", {
                x: Math.floor((ent1.position.x + ent2.position.x) / 2),
                y: Math.floor((ent1.position.y + ent2.position.y) / 2),
              })
              addCodexEntry("Two Resonants harmonized near a Prismatic Drifter to form a Thought Weaver.")
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
            if (Math.random() < 0.2 && currentState.params.resonance > 60) {
              createEntity("dancer", {
                x: Math.floor((ent1.position.x + ent2.position.x) / 2),
                y: Math.floor((ent1.position.y + ent2.position.y) / 2),
              })
              addCodexEntry("A Prismatic Drifter and Thought Weaver merged into a Void Dancer.")
              // Don't remove the parent entities for this transformation
              return
            }
          }
        }
      }
    }
  }

  // Process entity lifecycle (spawning/despawning)
  const processEntityLifecycle = (currentState: EcosystemState) => {
    // Spawn new entities occasionally
    if (Math.random() < 0.1) {
      const spawnRoll = Math.random() * 100

      if (spawnRoll < currentState.params.resonance / 2) {
        createEntity("resonant", { x: randomInt(5, 70), y: randomInt(2, 15) })
      } else if (spawnRoll < currentState.params.resonance / 2 + currentState.params.complexity / 3) {
        createEntity("prismatic", { x: randomInt(5, 65), y: randomInt(2, 12) })
      }

      // Special condition for Crystalline Collective
      if (
        currentState.params.harmony > 80 &&
        currentState.params.complexity > 70 &&
        currentState.counts.weaver >= 2 &&
        currentState.counts.dancer >= 1 &&
        Math.random() < 0.1
      ) {
        createEntity("collective", { x: randomInt(10, 60), y: randomInt(5, 12) })
        addCodexEntry("High harmony and complexity allowed a Crystalline Collective to form!")
      }
    }

    // Despawn old entities
    for (let i = currentState.entities.length - 1; i >= 0; i--) {
      const entity = currentState.entities[i]

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
        default:
          // Для пользовательских типов используем стандартный срок жизни
          lifespan = 150 + randomInt(0, 100)
      }

      // Entropy shortens lifespan
      lifespan -= Math.floor(currentState.params.entropy / 10)

      // Remove if too old
      if (entity.age > lifespan || Math.random() < 0.001) {
        removeEntity(i)
      }
    }
  }

  // Update the guardian entity
  const updateGuardian = (currentState: EcosystemState) => {
    if (!currentState.guardian.active) return

    // Occasionally update mood and focus
    if (currentState.cycle % 50 === 0) {
      updateGuardianMood()
    }
    if (currentState.cycle % 100 === 0) {
      updateGuardianFocus()
    }
  }

  // Button functions
  const observeNaturally = () => {
    addCodexEntry("You observe the system without intervention. The flow continues naturally.")
  }

  const stabilizeResonance = () => {
    setState((prev) => ({
      ...prev,
      params: {
        ...prev.params,
        resonance: Math.min(prev.params.resonance + 10, 100),
        entropy: Math.max(prev.params.entropy - 5, 0),
      },
    }))
    addCodexEntry("You introduce a stabilizing resonance. The Etheric Sea grows more harmonious.")
  }

  const amplifyShift = () => {
    setState((prev) => ({
      ...prev,
      params: {
        ...prev.params,
        entropy: prev.params.entropy + 15,
        complexity: prev.params.complexity + 10,
      },
    }))
    addCodexEntry("You amplify the energy currents. The system grows more chaotic but also more complex.")
  }

  const focusEntity = () => {
    // Find the most interesting entity type present
    let targetType: EntityType | null = null

    if (state.counts.collective > 0) targetType = "collective"
    else if (state.counts.dancer > 0) targetType = "dancer"
    else if (state.counts.weaver > 0) targetType = "weaver"
    else if (state.counts.prismatic > 0) targetType = "prismatic"
    else if (state.counts.resonant > 0) targetType = "resonant"

    if (targetType) {
      addCodexEntry(
        `You focus your attention on a ${targetType.charAt(0).toUpperCase() + targetType.slice(1)}. It seems to respond to your awareness.`,
      )

      // Find a random entity of that type
      const entities = state.entities.filter((e) => e.type === targetType)

      if (entities.length > 0) {
        const target = entities[Math.floor(Math.random() * entities.length)]

        // Boost its lifespan
        setState((prev) => {
          const newEntities = [...prev.entities]
          const index = newEntities.findIndex((e) => e === target)

          if (index !== -1) {
            newEntities[index] = {
              ...newEntities[index],
              age: Math.max(newEntities[index].age - 50, 0),
            }
          }

          return {
            ...prev,
            entities: newEntities,
          }
        })

        // Maybe spawn a similar entity nearby
        if (Math.random() < 0.3) {
          createEntity(targetType, {
            x: target.position.x + randomInt(-10, 10),
            y: target.position.y + randomInt(-5, 5),
          })
          addCodexEntry(`Your focus caused resonance, manifesting another ${targetType}!`)
        }
      }
    } else {
      addCodexEntry("You focus your attention, but find no entities to connect with.")
    }
  }

  return {
    state,
    observeNaturally,
    stabilizeResonance,
    amplifyShift,
    focusEntity,
  }
}

