import { entities, environments } from "@/constants/ecosystem"
import { randomInt } from "@/utils/ecosystem-utils"
import type { EcosystemState, Entity } from "@/types/ecosystem"
import type { EntityType } from "@/constants/ecosystem"

// Entity boundaries
export const MAX_ENTITY_X = 70
export const MAX_ENTITY_Y = 15

// Create a new entity with optimized defaults
export function createNewEntity(type: EntityType, position: { x: number; y: number }, state: EcosystemState): Entity {
  return {
    type,
    position,
    pattern: entities[type]?.patterns[0] || ["*", "/|\\", "/ \\"],
    frame: 0,
    age: 0,
    direction: { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 },
    speed: type === "prismatic" ? 2 : 1,
  }
}

// Get a safe random position for a new entity
export function getSafePosition() {
  return {
    x: randomInt(10, MAX_ENTITY_X - 10),
    y: randomInt(5, MAX_ENTITY_Y - 5),
  }
}

// Update entity positions with optimized calculations
export function updateEntityPositions(state: EcosystemState) {
  const { entities: stateEntities, params } = state

  // Pre-calculate values used in the loop
  const entropyFactor = params.entropy / 200
  const resonanceThreshold = params.resonance > 70
  const complexityThreshold = params.complexity > 60

  // Calculate dominant directions once if needed
  let dominantX = 0
  let dominantY = 0

  if (resonanceThreshold) {
    const directionSum = stateEntities.reduce((sum, e) => ({ x: sum.x + e.direction.x, y: sum.y + e.direction.y }), {
      x: 0,
      y: 0,
    })
    dominantX = directionSum.x > 0 ? 1 : -1
    dominantY = directionSum.y > 0 ? 1 : -1
  }

  stateEntities.forEach((entity) => {
    // Skip guardian
    if (entity.type === "guardian") return

    // Animate entity (cycle through frames)
    // Проверяем, существует ли тип сущности в стандартном объекте entities
    if (entities[entity.type]?.patterns) {
      entity.frame = (entity.frame + 1) % entities[entity.type].patterns.length
    }
    // Для пользовательских типов не меняем frame, так как у нас нет доступа к контексту здесь

    // Chance to change direction based on entropy
    if (Math.random() < entropyFactor) {
      entity.direction.x = Math.random() > 0.5 ? 1 : -1
      entity.direction.y = Math.random() > 0.5 ? 1 : -1
    }

    // Movement speed based on complexity and entity type
    const baseSpeed = entity.speed || 1

    // Resonance affects movement coherence
    if (resonanceThreshold && Math.random() < params.resonance / 200) {
      entity.direction.x = dominantX
      entity.direction.y = dominantY
    }

    // Complexity affects movement patterns
    if (complexityThreshold && Math.random() < params.complexity / 200) {
      // Use cached values for sin/cos calculations
      const sinValue = Math.sin(entity.age / 10)
      const cosValue = Math.cos(entity.age / 10)
      entity.direction.x = sinValue > 0 ? 1 : -1
      entity.direction.y = cosValue > 0 ? 1 : -1
    }

    // Move in current direction with speed influenced by parameters
    const moveX = entity.direction.x * (baseSpeed + params.entropy / 50)
    const moveY = entity.direction.y * (baseSpeed + params.entropy / 50)

    entity.position.x += moveX
    entity.position.y += moveY

    // Boundary checking with clamping
    if (entity.position.x <= 0 || entity.position.x >= MAX_ENTITY_X) {
      entity.position.x = Math.max(0, Math.min(MAX_ENTITY_X, entity.position.x))
      entity.direction.x *= -1
    }

    if (entity.position.y <= 0 || entity.position.y >= MAX_ENTITY_Y) {
      entity.position.y = Math.max(0, Math.min(MAX_ENTITY_Y, entity.position.y))
      entity.direction.y *= -1
    }
  })
}

// Add environment patterns to grid with optimized loop
export function addEnvironmentToGrid(grid: string[][], state: EcosystemState) {
  if (!grid?.length || !grid[0]?.length || !environments[state.environment]) return

  const pattern = environments[state.environment]
  const gridHeight = grid.length
  const gridWidth = grid[0].length
  const patternHeight = pattern.length

  for (let y = 0; y < patternHeight && y < gridHeight; y++) {
    const patternRow = pattern[y]
    const patternWidth = patternRow.length

    for (let x = 0; x < patternWidth && x < gridWidth; x++) {
      // Only add environment character if it's not a space
      const char = patternRow[x]
      if (char && char !== " ") {
        grid[y][x] = char
      }
    }
  }
}

// Add all entities to grid with optimized loops
export function addEntitiesToGrid(grid: string[][], state: EcosystemState) {
  if (!grid?.length || !grid[0]?.length) return

  const gridHeight = grid.length
  const gridWidth = grid[0].length

  // Получаем доступ к контексту экосистемы для пользовательских сущностей
  let contextEntities = {}

  // Динамически импортируем контекст, если он доступен
  if (typeof window !== "undefined") {
    try {
      // Используем глобальную переменную window.__ECOSYSTEM_CONTEXT__ если она доступна
      if (window.__ECOSYSTEM_CONTEXT__) {
        contextEntities = window.__ECOSYSTEM_CONTEXT__.entities || {}
      }
    } catch (error) {
      // Игнорируем ошибки
    }
  }

  state.entities.forEach((entity) => {
    // Используем шаблон из самой сущности, если он есть
    if (entity.pattern) {
      // Skip if entity position is completely outside grid
      const entityX = Math.floor(entity.position.x)
      const entityY = Math.floor(entity.position.y)

      if (entityX >= gridWidth || entityY >= gridHeight || entityX < 0 || entityY < 0) {
        return
      }

      const pattern = entity.pattern
      if (!pattern) return

      const patternHeight = pattern.length
      for (let y = 0; y < patternHeight; y++) {
        const gridY = entityY + y

        // Skip if row is outside grid
        if (gridY < 0 || gridY >= gridHeight) continue

        const patternRow = pattern[y]
        if (!patternRow) continue

        const patternWidth = patternRow.length

        for (let x = 0; x < patternWidth; x++) {
          const gridX = entityX + x

          // Skip if column is outside grid
          if (gridX < 0 || gridX >= gridWidth) continue

          // Only add entity character if it's not a space
          const char = patternRow[x]
          if (char && char !== " " && grid[gridY]?.[gridX] !== undefined) {
            grid[gridY][gridX] = char
          }
        }
      }
      return
    }

    // Если у сущности нет шаблона, пытаемся найти его в стандартных или пользовательских сущностях
    let entityPatterns

    // Сначала проверяем стандартные сущности
    if (entities[entity.type]?.patterns) {
      entityPatterns = entities[entity.type].patterns
    }
    // Затем проверяем пользовательские сущности из контекста
    else if (contextEntities && contextEntities[entity.type]?.patterns) {
      entityPatterns = contextEntities[entity.type].patterns
    }
    // Если шаблон не найден, используем простой запасной вариант
    else {
      entityPatterns = [["*", "/|\\", "/ \\"]]
    }

    // Skip if entity position is completely outside grid
    const entityX = Math.floor(entity.position.x)
    const entityY = Math.floor(entity.position.y)

    if (entityX >= gridWidth || entityY >= gridHeight || entityX < 0 || entityY < 0) {
      return
    }

    // Ensure pattern index is valid
    const patternIndex = Math.abs(entity.frame % entityPatterns.length)
    const pattern = entityPatterns[patternIndex]

    if (!pattern) return

    const patternHeight = pattern.length
    for (let y = 0; y < patternHeight; y++) {
      const gridY = entityY + y

      // Skip if row is outside grid
      if (gridY < 0 || gridY >= gridHeight) continue

      const patternRow = pattern[y]
      if (!patternRow) continue

      const patternWidth = patternRow.length

      for (let x = 0; x < patternWidth; x++) {
        const gridX = entityX + x

        // Skip if column is outside grid
        if (gridX < 0 || gridX >= gridWidth) continue

        // Only add entity character if it's not a space
        const char = patternRow[x]
        if (char && char !== " " && grid[gridY]?.[gridX] !== undefined) {
          grid[gridY][gridX] = char
        }
      }
    }
  })
}

