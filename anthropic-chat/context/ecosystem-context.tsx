"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { entities as initialEntities } from "@/constants/ecosystem"
import autonomousEcosystemService from "@/services/autonomous-ecosystem-service"
import type { EnvironmentType } from "@/types"
import entityService from "@/services/entity-service"

// Initial data only used if nothing exists in database
const initialEntityDescriptions = {
  resonant: "Simple entities that respond to resonance fields in the ecosystem. They move in patterns that reflect the overall harmony of the system. Resonants are the most common entity type and often serve as building blocks for more complex entities.",
  prismatic: "Fast-moving entities that drift through dimensional boundaries. Prismatic Drifters can traverse multiple planes of existence simultaneously, leaving trails of energy that influence nearby entities. They're known for their unpredictable movement patterns.",
  weaver: "Entities that weave thought patterns into the fabric of the ecosystem. Thought Weavers emerge when Resonants harmonize near Prismatic Drifters, creating complex structures that process and transform information flows.",
  dancer: "Entities that dance through the void between dimensions. Void Dancers move with grace and purpose, creating ripples in the etheric field that can influence the behavior of other entities. They form from the interaction of Prismatic Drifters and Thought Weavers.",
  collective: "Highly evolved entities that represent collective consciousness. Crystalline Collectives form under conditions of high harmony and complexity, creating a networked intelligence that can process multiple information streams simultaneously.",
  guardian: "The Etheric Guardian oversees the ecosystem, maintaining balance and facilitating evolution. It exists across all dimensional planes simultaneously and can influence parameters directly. The Guardian's mood and focus shift over time, affecting its interactions with the ecosystem.",
}

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

const initialEntityDisplayNames = {
  resonant: "Resonant Entities",
  prismatic: "Prismatic Drifters",
  weaver: "Thought Weavers",
  dancer: "Void Dancers",
  collective: "Crystalline Collectives",
  guardian: "Etheric Guardian",
}

const initialEntityColorClasses = {
  resonant: "entity-resonant",
  prismatic: "entity-prismatic",
  weaver: "entity-weaver",
  dancer: "entity-dancer",
  collective: "entity-collective",
  guardian: "entity-guardian",
}

// Context type definition
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
  startAutonomousMode: () => void
  stopAutonomousMode: () => void
  isAutonomousModeActive: boolean
  lastAutonomousUpdate: number
  reloadData: () => Promise<void>
}

// Create the context
const EcosystemContext = createContext<EcosystemContextType | undefined>(undefined)

// Provider component
export function EcosystemProvider({ children }: { children: ReactNode }) {
  // State for all entity-related data
  const [entities, setEntities] = useState(initialEntities)
  const [entityDescriptions, setEntityDescriptions] = useState(initialEntityDescriptions)
  const [entityProperties, setEntityProperties] = useState(initialEntityProperties)
  const [entityDisplayNames, setEntityDisplayNames] = useState(initialEntityDisplayNames)
  const [entityColorClasses, setEntityColorClasses] = useState(initialEntityColorClasses)

  // State for entity callbacks and custom types
  const [entityAddedCallbacks, setEntityAddedCallbacks] = useState<((entityType: string) => void)[]>([])
  const [customEntityTypes, setCustomEntityTypes] = useState<string[]>([])

  // State for autonomous mode
  const [isAutonomousModeActive, setIsAutonomousMode] = useState(false)
  const [lastAutonomousUpdate, setLastAutonomousUpdate] = useState(0)
  
  // Data loading state
  const [isInitialized, setIsInitialized] = useState(false)

  // Function to load data from Supabase
  const loadDataFromSupabase = useCallback(async () => {
    try {
      console.log("Loading data from Supabase...")
      
      // Load all data from Supabase
      const entitiesData = await entityService.loadEntities()
      const descriptionsData = await entityService.loadEntityDescriptions()
      const propertiesData = await entityService.loadEntityProperties()
      const displayNamesData = await entityService.loadEntityDisplayNames()
      const colorClassesData = await entityService.loadEntityColorClasses()
      
      // Update state with loaded data, only if data exists
      if (entitiesData) {
        console.log("Setting entities from Supabase:", entitiesData)
        setEntities(entitiesData)
      }
      
      if (descriptionsData) setEntityDescriptions(descriptionsData)
      if (propertiesData) setEntityProperties(propertiesData)
      if (displayNamesData) setEntityDisplayNames(displayNamesData)
      if (colorClassesData) setEntityColorClasses(colorClassesData)
      
      // Calculate custom entity types
      if (entitiesData) {
        const initialTypes = Object.keys(initialEntities)
        const savedTypes = Object.keys(entitiesData)
        const customTypes = savedTypes.filter((type) => !initialTypes.includes(type))
        setCustomEntityTypes(customTypes)
      }
      
      console.log("Data loaded from Supabase")
    } catch (error) {
      console.error("Error loading data from Supabase:", error)
    }
  }, [])

  // Load data on initial render
  useEffect(() => {
    if (isInitialized) return
    
    const initializeData = async () => {
      // Load data from Supabase
      await loadDataFromSupabase()
      
      // Start autonomous mode
      setIsAutonomousMode(true)
      
      // Mark as initialized
      setIsInitialized(true)
      console.log("EcosystemContext initialized")
    }
    
    initializeData()
  }, [loadDataFromSupabase, isInitialized])

  // Subscribe to autonomous ecosystem updates
  useEffect(() => {
    const unsubscribe = autonomousEcosystemService.subscribe((newState) => {
      const customTypes = Object.keys(newState.counts).filter((type) => !Object.keys(initialEntities).includes(type))
      setCustomEntityTypes(customTypes)
      setLastAutonomousUpdate(Date.now())
    })

    return () => {
      unsubscribe()
      autonomousEcosystemService.stop()
    }
  }, [])

  // Public reload method
  const reloadData = useCallback(async () => {
    await loadDataFromSupabase()
  }, [loadDataFromSupabase])

  // Start autonomous mode
  const startAutonomousMode = useCallback(() => {
    // Initialize with basic state
    const currentState = {
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

    autonomousEcosystemService.initialize(currentState)
    setIsAutonomousMode(true)
    console.log("Autonomous mode started")
  }, [])

  // Stop autonomous mode
  const stopAutonomousMode = useCallback(() => {
    autonomousEcosystemService.stop()
    setIsAutonomousMode(false)
    console.log("Autonomous mode stopped")
  }, [])

  // Register callback for entity added event
  const onEntityAdded = useCallback((callback: (entityType: string) => void) => {
    setEntityAddedCallbacks((prev) => [...prev, callback])

    // Return unsubscribe function
    return () => {
      setEntityAddedCallbacks((prev) => prev.filter((cb) => cb !== callback))
    }
  }, [])

  // Get custom entity types
  const getCustomEntityTypes = useCallback(() => {
    return customEntityTypes
  }, [customEntityTypes])

  // Update an existing entity
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

      console.log(`Entity ${entityType} updated in state`)
    },
    [],
  )

  // Add a new entity
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

      // Check if this is a new custom entity type
      if (!Object.keys(initialEntities).includes(entityType) && !customEntityTypes.includes(entityType)) {
        setCustomEntityTypes((prev) => [...prev, entityType])

        // Notify subscribers
        entityAddedCallbacks.forEach((callback) => {
          try {
            callback(entityType)
          } catch (error) {
            console.error("Error in entity added callback:", error)
          }
        })
      }

      console.log(`Entity ${entityType} added to state`)
      
      // Save to database immediately
      saveEntityToSupabase(
        entityType, 
        data.patterns, 
        data.className, 
        data.displayName, 
        data.description, 
        data.properties
      )
    },
    [entityAddedCallbacks, customEntityTypes],
  )
  
  // Function to save entity directly to Supabase
  const saveEntityToSupabase = async (
    entityType: string,
    patterns: string[][],
    className: string,
    displayName: string,
    description: string, 
    properties: string[]
  ) => {
    try {
      console.log(`Saving entity ${entityType} to Supabase...`)
      
      // Get current data and update with new entity
      const updatedEntities = {
        ...entities,
        [entityType]: {
          patterns,
          className
        }
      }
      
      const updatedDisplayNames = {
        ...entityDisplayNames,
        [entityType]: displayName
      }
      
      const updatedDescriptions = {
        ...entityDescriptions,
        [entityType]: description
      }
      
      const updatedProperties = {
        ...entityProperties,
        [entityType]: properties
      }
      
      const updatedColorClasses = {
        ...entityColorClasses,
        [entityType]: className
      }
      
      // Save all data to Supabase
      await entityService.saveAllEntityData(
        updatedEntities,
        updatedDescriptions,
        updatedProperties,
        updatedDisplayNames,
        updatedColorClasses
      )
      
      console.log(`Entity ${entityType} saved to Supabase`)
    } catch (error) {
      console.error(`Error saving entity ${entityType} to Supabase:`, error)
    }
  }

  // Reload data when visiting wiki page
  useEffect(() => {
    if (!isInitialized) return
    
    const checkForWikiPage = async () => {
      if (typeof window !== 'undefined' && window.location.pathname.includes('/wiki')) {
        console.log('On wiki page, loading data from Supabase')
        await loadDataFromSupabase()
        console.log('Wiki page data load complete')
      }
    }
    
    checkForWikiPage()
  }, [isInitialized, loadDataFromSupabase])

  // Create context value
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
      startAutonomousMode,
      stopAutonomousMode,
      isAutonomousModeActive,
      lastAutonomousUpdate,
      reloadData
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
      reloadData
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