"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { entities as initialEntities } from "@/constants/ecosystem"
// Добавьте импорт сервиса автономной экосистемы в начало файла
import autonomousEcosystemService from "@/services/autonomous-ecosystem-service"
import type { EnvironmentType } from "@/types"

// Объявляем глобальный тип для window
declare global {
  interface Window {
    __ECOSYSTEM_CONTEXT__?: {
      entities: any
    }
  }
}

// Entity descriptions for initial data
const initialEntityDescriptions = {
  resonant:
    "Simple entities that respond to resonance fields in the ecosystem. They move in patterns that reflect the overall harmony of the system. Resonants are the most common entity type and often serve as building blocks for more complex entities.",
  prismatic:
    "Fast-moving entities that drift through dimensional boundaries. Prismatic Drifters can traverse multiple planes of existence simultaneously, leaving trails of energy that influence nearby entities. They're known for their unpredictable movement patterns.",
  weaver:
    "Entities that weave thought patterns into the fabric of the ecosystem. Thought Weavers emerge when Resonants harmonize near Prismatic Drifters, creating complex structures that process and transform information flows.",
  dancer:
    "Entities that dance through the void between dimensions. Void Dancers move with grace and purpose, creating ripples in the etheric field that can influence the behavior of other entities. They form from the interaction of Prismatic Drifters and Thought Weavers.",
  collective:
    "Highly evolved entities that represent collective consciousness. Crystalline Collectives form under conditions of high harmony and complexity, creating a networked intelligence that can process multiple information streams simultaneously.",
  guardian:
    "The Etheric Guardian oversees the ecosystem, maintaining balance and facilitating evolution. It exists across all dimensional planes simultaneously and can influence parameters directly. The Guardian's mood and focus shift over time, affecting its interactions with the ecosystem.",
}

// Entity properties for initial data
const initialEntityProperties = {
  resonant: [
    "Responds to resonance fields",
    "Forms simple movement patterns",
    "Can combine to form more complex entities",
  ],
  prismatic: [
    "Moves quickly through dimensional boundaries",
    "Creates energy trails that influence other entities",
    "Unpredictable movement patterns",
  ],
  weaver: [
    "Processes information flows",
    "Creates thought structures",
    "Forms from Resonant and Prismatic interaction",
  ],
  dancer: [
    "Creates ripples in the etheric field",
    "Influences behavior of nearby entities",
    "Forms from Prismatic and Weaver interaction",
  ],
  collective: [
    "Represents networked intelligence",
    "Processes multiple information streams",
    "Forms under high harmony and complexity",
  ],
  guardian: [
    "Exists across all dimensional planes",
    "Can influence ecosystem parameters",
    "Mood and focus shift over time",
  ],
}

// Entity display names
const initialEntityDisplayNames = {
  resonant: "Resonant Entities",
  prismatic: "Prismatic Drifters",
  weaver: "Thought Weavers",
  dancer: "Void Dancers",
  collective: "Crystalline Collectives",
  guardian: "Etheric Guardian",
}

// Entity color classes
const initialEntityColorClasses = {
  resonant: "entity-resonant",
  prismatic: "entity-prismatic",
  weaver: "entity-weaver",
  dancer: "entity-dancer",
  collective: "entity-collective",
  guardian: "entity-guardian",
}

// Добавьте в тип EcosystemContextType новые методы для управления автономной работой
type EcosystemContextType = {
  entities: typeof initialEntities
  entityDescriptions: typeof initialEntityDescriptions
  entityProperties: typeof initialEntityProperties
  entityDisplayNames: typeof initialEntityDisplayNames
  entityColorClasses: typeof initialEntityColorClasses
  updateEntity: (
    entityType: string,
    data: {
      patterns?: string[][]
      className?: string
      displayName?: string
      description?: string
      properties?: string[]
    },
  ) => void
  addEntity: (
    entityType: string,
    data: {
      patterns: string[][]
      className: string
      displayName: string
      description: string
      properties: string[]
    },
  ) => void
  onEntityAdded: (callback: (entityType: string) => void) => () => void
  getCustomEntityTypes: () => string[]
  // Новые методы для автономной работы
  startAutonomousMode: () => void
  stopAutonomousMode: () => void
  isAutonomousModeActive: boolean
  lastAutonomousUpdate: number
}

// Local storage key for ecosystem data
const STORAGE_KEY = "ecosystem-entities"

// Create the context
const EcosystemContext = createContext<EcosystemContextType | undefined>(undefined)

// Create a provider component
// В функции EcosystemProvider добавьте новое состояние для отслеживания автономного режима
export function EcosystemProvider({ children }: { children: ReactNode }) {
  // State for all entity-related data
  const [entities, setEntities] = useState(initialEntities)
  const [entityDescriptions, setEntityDescriptions] = useState(initialEntityDescriptions)
  const [entityProperties, setEntityProperties] = useState(initialEntityProperties)
  const [entityDisplayNames, setEntityDisplayNames] = useState(initialEntityDisplayNames)
  const [entityColorClasses, setEntityColorClasses] = useState(initialEntityColorClasses)

  // Массив колбэков для уведомления о новых сущностях
  const [entityAddedCallbacks, setEntityAddedCallbacks] = useState<((entityType: string) => void)[]>([])

  // Массив для хранения пользовательских типов сущностей (не из начальных данных)
  const [customEntityTypes, setCustomEntityTypes] = useState<string[]>([])

  // Новое состояние для автономного режима
  const [isAutonomousModeActive, setIsAutonomousMode] = useState(false)
  const [lastAutonomousUpdate, setLastAutonomousUpdate] = useState(0)

  // Загрузка данных из localStorage при начальном рендеринге
  // Проверяем, есть ли сохраненное состояние экосистемы и автоматически запускаем автономный режим
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setEntities(parsedData.entities || initialEntities)
        setEntityDescriptions(parsedData.entityDescriptions || initialEntityDescriptions)
        setEntityProperties(parsedData.entityProperties || initialEntityProperties)
        setEntityDisplayNames(parsedData.entityDisplayNames || initialEntityDisplayNames)
        setEntityColorClasses(parsedData.entityColorClasses || initialEntityColorClasses)

        // Определяем пользовательские типы сущностей
        const initialTypes = Object.keys(initialEntities)
        const savedTypes = Object.keys(parsedData.entities || {})
        const customTypes = savedTypes.filter((type) => !initialTypes.includes(type))
        setCustomEntityTypes(customTypes)
      }

      // Проверяем, есть ли сохраненное состояние экосистемы
      const lastUpdateTime = autonomousEcosystemService.getLastUpdateTime()

      // Всегда запускаем автономный режим, независимо от наличия сохраненного состояния
      setIsAutonomousMode(true)

      // Если есть сохраненное состояние, используем его время последнего обновления
      if (lastUpdateTime > 0) {
        setLastAutonomousUpdate(lastUpdateTime)
      } else {
        // Инициализируем автономный режим с текущим временем
        startAutonomousMode()
      }
    } catch (error) {
      console.error("Error loading ecosystem data from localStorage:", error)
      // Даже при ошибке запускаем автономный режим
      startAutonomousMode()
    }
  }, [])

  // Инициализация автономного режима
  useEffect(() => {
    // Подписываемся на обновления состояния от автономного сервиса
    const unsubscribe = autonomousEcosystemService.subscribe((newState) => {
      // Обновляем пользовательские типы сущностей из нового состояния
      const customTypes = Object.keys(newState.counts).filter((type) => !Object.keys(initialEntities).includes(type))
      setCustomEntityTypes(customTypes)
      setLastAutonomousUpdate(Date.now())
    })

    return () => {
      unsubscribe()
      // Останавливаем автономный режим при размонтировании
      autonomousEcosystemService.stop()
    }
  }, [])

  // Функция для запуска автономного режима
  const startAutonomousMode = useCallback(() => {
    // Получаем текущее состояние экосистемы из хуков
    const currentState = {
      // Базовое состояние экосистемы
      cycle: 1,
      environment: "tranquil" as EnvironmentType,
      environmentFrame: 0,
      entities: [],
      params: {
        resonance: 50,
        complexity: 30,
        harmony: 65,
        entropy: 25,
      },
      counts: {},
      codexEntries: [],
      guardian: {
        active: true,
        mood: "analytical",
        focus: "general harmony",
        position: { x: 30, y: 5 },
        lastAction: 0,
        actionCooldown: 20,
        suggestionHistory: [],
      },
    }

    // Инициализируем автономный сервис
    autonomousEcosystemService.initialize(currentState)
    setIsAutonomousMode(true)
    console.log("Autonomous mode started")
  }, [])

  // Функция для остановки автономного режима
  const stopAutonomousMode = useCallback(() => {
    autonomousEcosystemService.stop()
    setIsAutonomousMode(false)
    console.log("Autonomous mode stopped")
  }, [])

  // Сохраняем контекст в глобальной переменной для доступа из утилит
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__ECOSYSTEM_CONTEXT__ = { entities }
    }
  }, [entities])

  // Save data to localStorage whenever it changes
  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          entities,
          entityDescriptions,
          entityProperties,
          entityDisplayNames,
          entityColorClasses,
        }),
      )
    } catch (error) {
      console.error("Error saving ecosystem data to localStorage:", error)
    }
  }, [entities, entityDescriptions, entityProperties, entityDisplayNames, entityColorClasses])

  // Функция для регистрации колбэка при добавлении новой сущности
  const onEntityAdded = useCallback((callback: (entityType: string) => void) => {
    setEntityAddedCallbacks((prev) => [...prev, callback])

    // Возвращаем функцию для отписки
    return () => {
      setEntityAddedCallbacks((prev) => prev.filter((cb) => cb !== callback))
    }
  }, [])

  // Функция для получения списка пользовательских типов сущностей
  const getCustomEntityTypes = useCallback(() => {
    return customEntityTypes
  }, [customEntityTypes])

  // Function to update an existing entity
  const updateEntity = useCallback(
    (
      entityType: string,
      data: {
        patterns?: string[][]
        className?: string
        displayName?: string
        description?: string
        properties?: string[]
      },
    ) => {
      // Update entities
      if (data.patterns) {
        setEntities((prev) => ({
          ...prev,
          [entityType]: {
            ...prev[entityType as keyof typeof prev],
            patterns: data.patterns,
          },
        }))
      }

      // Update className
      if (data.className) {
        setEntities((prev) => ({
          ...prev,
          [entityType]: {
            ...prev[entityType as keyof typeof prev],
            className: data.className,
          },
        }))

        setEntityColorClasses((prev) => ({
          ...prev,
          [entityType]: data.className,
        }))
      }

      // Update display name
      if (data.displayName) {
        setEntityDisplayNames((prev) => ({
          ...prev,
          [entityType]: data.displayName,
        }))
      }

      // Update description
      if (data.description) {
        setEntityDescriptions((prev) => ({
          ...prev,
          [entityType]: data.description,
        }))
      }

      // Update properties
      if (data.properties) {
        setEntityProperties((prev) => ({
          ...prev,
          [entityType]: data.properties,
        }))
      }

      // In a real app, you would save to a database here
      console.log(`Entity ${entityType} updated with:`, data)
    },
    [],
  )

  // Function to add a new entity
  const addEntity = useCallback(
    (
      entityType: string,
      data: {
        patterns: string[][]
        className: string
        displayName: string
        description: string
        properties: string[]
      },
    ) => {
      // Add to entities
      setEntities((prev) => ({
        ...prev,
        [entityType]: {
          patterns: data.patterns,
          className: data.className,
        },
      }))

      // Add display name
      setEntityDisplayNames((prev) => ({
        ...prev,
        [entityType]: data.displayName,
      }))

      // Add description
      setEntityDescriptions((prev) => ({
        ...prev,
        [entityType]: data.description,
      }))

      // Add properties
      setEntityProperties((prev) => ({
        ...prev,
        [entityType]: data.properties,
      }))

      // Add color class
      setEntityColorClasses((prev) => ({
        ...prev,
        [entityType]: data.className,
      }))

      // Проверяем, является ли это новым пользовательским типом
      if (!Object.keys(initialEntities).includes(entityType) && !customEntityTypes.includes(entityType)) {
        setCustomEntityTypes((prev) => [...prev, entityType])

        // Уведомляем всех подписчиков о новой сущности
        entityAddedCallbacks.forEach((callback) => {
          try {
            callback(entityType)
          } catch (error) {
            console.error("Error in entity added callback:", error)
          }
        })
      }

      // In a real app, you would save to a database here
      console.log(`New entity ${entityType} added:`, data)
    },
    [entityAddedCallbacks, customEntityTypes],
  )

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToLocalStorage()
  }, [entities, entityDescriptions, entityProperties, entityDisplayNames, entityColorClasses, saveToLocalStorage])

  // Memoize the context value to avoid unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      entities,
      entityDescriptions,
      entityProperties,
      entityDisplayNames,
      entityColorClasses,
      updateEntity,
      addEntity,
      onEntityAdded,
      getCustomEntityTypes,
      // Добавляем новые методы для автономного режима
      startAutonomousMode,
      stopAutonomousMode,
      isAutonomousModeActive,
      lastAutonomousUpdate,
    }),
    [
      entities,
      entityDescriptions,
      entityProperties,
      entityDisplayNames,
      entityColorClasses,
      updateEntity,
      addEntity,
      onEntityAdded,
      getCustomEntityTypes,
      startAutonomousMode,
      stopAutonomousMode,
      isAutonomousModeActive,
      lastAutonomousUpdate,
    ],
  )

  return <EcosystemContext.Provider value={contextValue}>{children}</EcosystemContext.Provider>
}

// Custom hook to use the ecosystem context
export function useEcosystem() {
  const context = useContext(EcosystemContext)
  if (context === undefined) {
    throw new Error("useEcosystem must be used within an EcosystemProvider")
  }
  return context
}

