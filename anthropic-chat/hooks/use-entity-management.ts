"use client"

import { useCallback } from "react"
import type { EcosystemState, Entity } from "@/types/ecosystem"
import type { EntityType } from "@/constants/ecosystem"
import { entities } from "@/constants/ecosystem"
import { getSafePosition } from "@/utils/ecosystem-operations"
import { useEcosystem } from "@/context/ecosystem-context"

export function useEntityManagement(state: EcosystemState) {
  // Получаем доступ к контексту экосистемы для пользовательских сущностей
  const { entities: contextEntities } = useEcosystem()

  // Create a new entity with optimized defaults
  const createEntity = useCallback(
    (type: EntityType, position: { x: number; y: number }): Entity => {
      // Проверяем, существует ли этот тип в стандартных сущностях
      if (entities[type]) {
        return {
          type,
          position,
          pattern: entities[type].patterns[0],
          frame: 0,
          age: 0,
          direction: { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 },
          speed: type === "prismatic" ? 2 : 1,
        }
      }
      // Если нет, проверяем в контексте экосистемы
      else if (contextEntities[type]) {
        return {
          type,
          position,
          pattern: contextEntities[type].patterns[0],
          frame: 0,
          age: 0,
          direction: { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 },
          speed: 1, // Стандартная скорость для пользовательских сущностей
        }
      }
      // Если тип не найден нигде, используем стандартный шаблон
      else {
        console.warn(`Entity type ${type} not found, using default pattern`)
        return {
          type,
          position,
          pattern: ["*", "/|\\", "/ \\"],
          frame: 0,
          age: 0,
          direction: { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 },
          speed: 1,
        }
      }
    },
    [contextEntities],
  )

  // Add entity to the ecosystem
  const addEntity = useCallback(
    (type: EntityType) => {
      const safePosition = getSafePosition()

      // Create the entity with safe position
      const newEntity = createEntity(type, safePosition)
      state.entities.push(newEntity)

      // Инициализируем счетчик для нового типа, если его еще нет
      if (!(type in state.counts)) {
        state.counts[type] = 0
      }

      // Update counts
      state.counts[type]++

      // Add to codex if this is a new discovery
      if (state.counts[type] === 1 && type !== "guardian") {
        state.codexEntries.push({
          cycle: state.cycle,
          text: `Discovered first ${type.charAt(0).toUpperCase() + type.slice(1)} entity at cycle ${state.cycle}.`,
        })
      }

      return newEntity
    },
    [state, createEntity],
  )

  // Remove an entity from the ecosystem
  const removeEntity = useCallback(
    (index: number) => {
      if (index < 0 || index >= state.entities.length) return false

      const entity = state.entities[index]

      // Don't remove the guardian
      if (entity.type === "guardian") return false

      // Remove the entity
      state.entities.splice(index, 1)

      // Update counts
      state.counts[entity.type]--

      return true
    },
    [state],
  )

  // Find the oldest entity of a specific type
  const findOldestEntity = useCallback(
    (type?: EntityType) => {
      let oldestEntityIndex = -1
      let maxAge = -1

      state.entities.forEach((entity, index) => {
        if (entity.type !== "guardian" && (type === undefined || entity.type === type) && entity.age > maxAge) {
          maxAge = entity.age
          oldestEntityIndex = index
        }
      })

      return oldestEntityIndex
    },
    [state.entities],
  )

  // Find a random entity of a specific type
  const findRandomEntity = useCallback(
    (type: EntityType) => {
      const entitiesOfType = state.entities.filter((e) => e.type === type)
      if (entitiesOfType.length === 0) return -1

      const randomIndex = Math.floor(Math.random() * entitiesOfType.length)
      return state.entities.findIndex((e) => e === entitiesOfType[randomIndex])
    },
    [state.entities],
  )

  // Check if entities are close to each other
  const areEntitiesClose = useCallback((entity1: Entity, entity2: Entity, maxDistance = 10) => {
    const dx = Math.abs(entity1.position.x - entity2.position.x)
    const dy = Math.abs(entity1.position.y - entity2.position.y)
    return dx < maxDistance && dy < maxDistance / 2
  }, [])

  return {
    createEntity,
    addEntity,
    removeEntity,
    findOldestEntity,
    findRandomEntity,
    areEntitiesClose,
  }
}

