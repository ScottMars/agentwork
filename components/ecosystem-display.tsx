"use client"

import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { createEmptyGrid, gridToString } from "@/utils/ecosystem-utils"
import { addEnvironmentToGrid, addEntitiesToGrid } from "@/utils/ecosystem-operations"
import type { EcosystemState } from "@/types/ecosystem"
import type { EntityType } from "@/constants/ecosystem"
import { useChat } from "ai/react"
import { useEcosystemParameters } from "@/hooks/use-ecosystem-parameters"
import { useEntityManagement } from "@/hooks/use-entity-management"
import { useMessageProcessor } from "@/hooks/use-message-processor"
import { useEcosystemEvolution } from "@/hooks/use-ecosystem-evolution"
import { useCodex } from "@/hooks/use-codex"
import { useEcosystem } from "@/context/ecosystem-context"
import { formatDistanceToNow } from "date-fns"

// Constants
const ENTITY_EVOLUTION_INTERVAL = 60 * 60 * 1000 // 1 hour
const CODEX_GENERATION_INTERVAL_MS = 12000 // 12 seconds
const GRID_WIDTH = 80
const GRID_HEIGHT = 25

// Array of possible ecosystem queries to send to the agent
const ECOSYSTEM_QUERIES = [
  "Detect any harmonic shifts in the current ecosystem pattern.",
  "Analyze entity distribution and suggest optimal adjustments.",
  "Evaluate current resonance levels and recommend stabilization measures.",
  "Identify potential emergence points for new entity types.",
  "Calculate entropy fluctuations and predict system evolution.",
  "Assess dimensional boundary stability in the current configuration.",
  "Measure interaction frequency between entity types and suggest catalysts.",
  "Scan for unusual pattern formations or anomalies in the etheric field.",
  "Determine optimal environmental state for current entity composition.",
  "Evaluate energy flow pathways and identify potential blockages.",
]

interface EcosystemDisplayProps {
  state: EcosystemState
}

// В функции EcosystemDisplay добавьте новые состояния и логику для автономного режима
export function EcosystemDisplay({ state }: EcosystemDisplayProps) {
  const ecosystemRef = useRef<HTMLPreElement>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())
  const [lastCodexTime, setLastCodexTime] = useState(Date.now())
  const [lastEntityEvolution, setLastEntityEvolution] = useState(Date.now())
  const [animationSpeed, setAnimationSpeed] = useState(1000) // Base animation speed in ms
  const { messages, setMessages, handleSubmit, isLoading } = useChat()
  const [guardianMessage, setGuardianMessage] = useState<string | null>(null)

  // Получаем доступ к контексту и автономному режиму
  const {
    addEntity: addEntityToContext,
    onEntityAdded,
    getCustomEntityTypes,
    isAutonomousModeActive,
    lastAutonomousUpdate,
    startAutonomousMode,
    stopAutonomousMode,
  } = useEcosystem()

  // Добавляем состояние для отображения информации об автономном режиме
  const [autonomousInfo, setAutonomousInfo] = useState<string | null>(null)

  // Use our custom hooks
  const { calculateAnimationSpeed } = useEcosystemParameters(state)
  const { processUserMessage } = useMessageProcessor(state)
  const { evolveEcosystemEntities, updateEnvironment, processRandomEvents, processEntityLifecycle } =
    useEcosystemEvolution(state)
  const { addCodexEntry } = useCodex(state)
  const { addEntity, removeEntity } = useEntityManagement(state)

  // Memoize the grid creation to avoid unnecessary recreations
  const emptyGrid = useMemo(() => createEmptyGrid(GRID_WIDTH, GRID_HEIGHT), [])

  // Optimized render function - displays the current state
  const render = useCallback(() => {
    try {
      // Create a copy of the empty grid to avoid modifying the original
      const grid = emptyGrid.map((row) => [...row])

      // Add environment background
      addEnvironmentToGrid(grid, state)

      // Add entities to grid
      addEntitiesToGrid(grid, state)

      // Render grid to screen
      if (ecosystemRef.current) {
        ecosystemRef.current.textContent = gridToString(grid)
      }
    } catch (error) {
      console.error("Rendering error:", error)
      // Fallback rendering if there's an error
      if (ecosystemRef.current) {
        ecosystemRef.current.textContent = "Dimensional stabilization in progress..."
      }
    }
  }, [state, emptyGrid])

  // Обновляем информацию об автономном режиме
  useEffect(() => {
    if (isAutonomousModeActive && lastAutonomousUpdate > 0) {
      const timeAgo = formatDistanceToNow(lastAutonomousUpdate, { addSuffix: true })
      setAutonomousInfo(`Ecosystem running autonomously. Last update: ${timeAgo}`)
    } else {
      setAutonomousInfo(null)
    }
  }, [isAutonomousModeActive, lastAutonomousUpdate])

  // Добавляем обработчики для управления автономным режимом
  const handleStartAutonomous = useCallback(() => {
    startAutonomousMode()
  }, [startAutonomousMode])

  const handleStopAutonomous = useCallback(() => {
    stopAutonomousMode()
  }, [stopAutonomousMode])

  // Update animation speed based on parameters
  useEffect(() => {
    setAnimationSpeed(calculateAnimationSpeed())
  }, [state.params.entropy, state.params.harmony, calculateAnimationSpeed])

  // Handle entity removal notification
  const handleEntityRemoved = useCallback(
    (entityType: EntityType) => {
      // Send a system message
      const systemMessage = {
        role: "system",
        content: `The Etheric Guardian has removed an aging ${entityType} entity from the ecosystem.`,
      }

      setGuardianMessage(systemMessage.content)
      setMessages((prev) => [...prev, systemMessage])
    },
    [setMessages],
  )

  // Request a new entity from the AI
  const requestNewEntityGeneration = useCallback(() => {
    // Create a summary of the current ecosystem state
    const ecosystemSummary = {
      cycle: state.cycle,
      environment: state.environment,
      entityCounts: state.counts,
      params: state.params,
    }

    // Add a system message for entity generation request
    const systemMessage = {
      role: "system",
      content:
        "The Etheric Guardian is generating a new type of entity for the ecosystem. Please suggest a new entity type with a name, description, and ASCII art pattern. Make it coherent with the current ecosystem. Users will not see this exchange.",
    }

    // Add the query as a user message
    const userMessage = {
      role: "user",
      content: `[ENTITY GENERATION]: The Etheric Guardian is autonomously generating a new entity type. Current ecosystem state: ${JSON.stringify(ecosystemSummary)}. Please respond with a JSON object containing: entityType (a single word), displayName, description, properties (array of 3 strings), and asciiArt (a multi-line string that works as ASCII art).`,
    }

    // Update messages and trigger form submission
    setMessages((prev) => [...prev, systemMessage, userMessage])

    // Simulate form submission
    const formData = new FormData()
    formData.append("message", userMessage.content)
    handleSubmit(new Event("submit") as any, formData)
  }, [state, setMessages, handleSubmit])

  // Process the entity generation response
  const processEntityGenerationResponse = useCallback(
    (response: string) => {
      try {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/{[\s\S]*}/)

        let entityData
        if (jsonMatch) {
          entityData = JSON.parse(jsonMatch[0].replace(/```json\n|```/g, ""))
        } else {
          // Fallback to parsing the entire response as JSON
          entityData = JSON.parse(response)
        }

        if (!entityData || !entityData.entityType || !entityData.asciiArt) {
          throw new Error("Invalid entity data format")
        }

        // Convert ASCII art string to pattern array
        const pattern = entityData.asciiArt.split("\n").map((line: string) => line || " ")

        // Generate a random color class if not provided
        const colorClasses = ["text-[#7fdbff]", "text-[#ff7fdb]", "text-[#dbff7f]", "text-[#db7fff]", "text-[#ffffff]"]
        const colorClass = entityData.colorClass || colorClasses[Math.floor(Math.random() * colorClasses.length)]

        // Add the new entity type to the ecosystem context
        addEntityToContext(entityData.entityType.toLowerCase(), {
          patterns: [pattern],
          className: colorClass,
          displayName: entityData.displayName,
          description: entityData.description,
          properties: entityData.properties || ["Autonomous generation", "Guardian-created", "Emergent behavior"],
        })

        // Create the entity instance in the ecosystem
        addEntity(entityData.entityType.toLowerCase() as EntityType)

        // Add codex entry
        addCodexEntry(`Guardian manifested a previously unknown entity type: ${entityData.displayName}!`)

        // Send a system message
        const systemMessage = {
          role: "system",
          content: `The Etheric Guardian has created a new entity type: ${entityData.displayName}.`,
        }

        setGuardianMessage(systemMessage.content)
        setMessages((prev) => [...prev, systemMessage])

        // Re-render
        render()
      } catch (error) {
        console.error("Error processing entity generation:", error)

        // Fall back to creating a standard entity
        const randomType = Math.floor(Math.random() * 5)
        const entityType = ["resonant", "prismatic", "weaver", "dancer", "collective"][randomType] as EntityType

        // Create the entity
        addEntity(entityType)

        // Add codex entry
        addCodexEntry(`Guardian attempted to manifest a new entity type, but settled on creating a ${entityType}.`)
      }
    },
    [state, addEntityToContext, addCodexEntry, setMessages, addEntity, render],
  )

  // Process the guardian's response to an entity request
  const processEntityResponse = useCallback(
    (response: string, request: string) => {
      // Check if the request was approved
      const approved = response.includes("APPROVED")

      if (!approved) {
        // Request was denied, just add a codex entry about it
        addCodexEntry("Guardian denied entity manipulation request")
        return
      }

      // Extract the entity type and action from the request
      const entityMatch = request.match(/\[(ENTITY REQUEST)\]: Should I (manifest|remove) a (\w+) entity/)

      if (!entityMatch) return

      const action = entityMatch[2] === "manifest" ? "add" : "remove"
      const entityType = entityMatch[3] as EntityType

      // Use the entity management hook to add an entity

      if (action === "add") {
        addEntity(entityType)

        // Add codex entry
        addCodexEntry(`Guardian approved manifestation of ${entityType} entity`)
      } else if (action === "remove") {
        // Find an entity of the specified type to remove
        const entityIndex = state.entities.findIndex((e) => e.type === entityType)

        if (entityIndex !== -1) {
          removeEntity(entityIndex)

          // Add codex entry
          addCodexEntry(`Guardian approved removal of ${entityType} entity`)
        }
      }

      // Re-render
      render()
    },
    [state, addCodexEntry, addEntity, removeEntity, render],
  )

  // Request a codex entry from the agent
  const requestCodexEntry = useCallback(() => {
    // Create a summary of the current ecosystem state
    const ecosystemSummary = {
      cycle: state.cycle,
      environment: state.environment,
      entityCounts: state.counts,
      params: state.params,
    }

    // Add a system message that this is a codex request (invisible to user)
    const systemMessage = {
      role: "system",
      content:
        "This is an automated codex entry request. Your response will be added to the Ethereal Codex. Users will not see this exchange. Respond with a brief description (10 words or less) of the current cycle.",
    }

    // Add the query as a user message
    const userMessage = {
      role: "user",
      content: `[CODEX REQUEST]: Cycle ${state.cycle}: Please describe the current ecosystem state in 10 words or less. Current state: ${JSON.stringify(ecosystemSummary)}`,
    }

    // Update messages and trigger the form submission
    setMessages((prev) => [...prev, systemMessage, userMessage])

    // Simulate form submission with the new message
    const formData = new FormData()
    formData.append("message", userMessage.content)
    handleSubmit(new Event("submit") as any, formData)
  }, [state, setMessages, handleSubmit])

  // Process the codex entry response
  const processCodexResponse = useCallback(
    (response: string) => {
      // Extract just the description part (remove any extra text)
      let description = response

      // Remove any markdown formatting
      description = description.replace(/\*\*/g, "").replace(/\*/g, "")

      // If the response is too long, truncate it
      if (description.split(" ").length > 10) {
        const words = description.split(" ").slice(0, 10)
        description = words.join(" ")
      }

      // Add the entry to the codex
      addCodexEntry(description)
    },
    [addCodexEntry],
  )

  // Ask the guardian to evaluate an entity request
  const requestEntityAction = useCallback(
    (action: string, entityType: EntityType) => {
      // Form appropriate question based on action type
      let question = ""

      if (action === "add") {
        question = `Should I manifest a new ${entityType} entity in the ecosystem?`
      } else if (action === "remove") {
        // Only ask if entities of this type exist
        if (state.counts[entityType] === 0) {
          return // No point asking if none exist
        }
        question = `Should I remove a ${entityType} entity from the ecosystem?`
      }

      // Add a system message for this request
      const systemMessage = {
        role: "system",
        content: `This is an entity action request. The user is requesting to ${action} a ${entityType} entity. 
                As the Etheric Guardian, decide if this should be allowed based on the current ecosystem state. 
                Reply with "APPROVED" if you agree or "DENIED" if you disagree, followed by a short explanation. 
                Users will not see this exchange.`,
      }

      // Add the request as a user message
      const userMessage = {
        role: "user",
        content: `[ENTITY REQUEST]: ${question} Current state: ${JSON.stringify({
          environment: state.environment,
          entityCounts: state.counts,
          params: state.params,
        })}`,
      }

      // Update messages and trigger form submission
      setMessages((prev) => [...prev, systemMessage, userMessage])

      // Simulate form submission
      const formData = new FormData()
      formData.append("message", userMessage.content)
      handleSubmit(new Event("submit") as any, formData)
    },
    [state, setMessages, handleSubmit],
  )

  // Send a random query to the agent
  const sendRandomQueryToAgent = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * ECOSYSTEM_QUERIES.length)
    const randomQuery = ECOSYSTEM_QUERIES[randomIndex]

    // Add a system message that this is an ecosystem query (invisible to user)
    const systemMessage = {
      role: "system",
      content:
        "This is an automated ecosystem query. Your response will affect the ecosystem visualization. Users will not see this exchange.",
    }

    // Add the query as a user message
    const userMessage = {
      role: "user",
      content: `[ECOSYSTEM QUERY]: ${randomQuery}`,
    }

    // Update messages and trigger the form submission
    setMessages((prev) => [...prev, systemMessage, userMessage])

    // Simulate form submission with the new message
    const formData = new FormData()
    formData.append("message", userMessage.content)
    handleSubmit(new Event("submit") as any, formData)
  }, [setMessages, handleSubmit])

  // Process agent responses
  const processAgentResponse = useCallback(
    (response: string) => {
      // Extract commands or suggestions from the response
      // const ecosystemParameters = useEcosystemParameters(state); // ecosystemParam -> This hook is being called from a nested function, but all hooks must be called unconditionally from the top-level component.
      const { adjustParameter } = useEcosystemParameters(state)

      if (response.includes("increase resonance")) {
        // Example: Increase resonance parameter
        adjustParameter("resonance", 10)
      } else if (response.includes("decrease entropy")) {
        // Example: Decrease entropy parameter
        adjustParameter("entropy", -10)
      } else if (response.includes("shift to quantum")) {
        // Example: Change environment
        state.environment = "quantum"
      } else if (response.includes("create new entity")) {
        // Example: Create a new entity
        const entityTypes: EntityType[] = ["resonant", "prismatic", "weaver", "dancer", "collective"]
        const randomType = entityTypes[Math.floor(Math.random() * entityTypes.length)]

        // Create the entity

        // Add to codex if this is a new discovery
        if (state.counts[randomType] === 0) {
          addCodexEntry(`Guardian initiated manifestation of first ${randomType} entity.`)
        }

        addEntity(randomType)
      }

      // Re-render the ecosystem with the changes
      render()
    },
    [state, addCodexEntry, addEntity, render, useEcosystemParameters],
  )

  // Подписываемся на добавление новых сущностей в контексте
  useEffect(() => {
    // Функция для создания экземпляра новой сущности в экосистеме
    const handleNewEntityType = (entityType: string) => {
      console.log(`New entity type detected in context: ${entityType}`)

      // Создаем экземпляр новой сущности в экосистеме
      const newEntity = addEntity(entityType as EntityType)

      // Добавляем запись в кодекс
      addCodexEntry(`A new entity type "${entityType}" has manifested in the ecosystem from the Etheric Codex.`)

      // Принудительно перерисовываем экосистему
      render()
    }

    // Регистрируем колбэк
    const unsubscribe = onEntityAdded(handleNewEntityType)

    // Проверяем, есть ли уже пользовательские типы сущностей, которые нужно добавить
    const customTypes = getCustomEntityTypes()
    if (customTypes.length > 0) {
      // Проверяем, какие типы еще не представлены в экосистеме
      customTypes.forEach((type) => {
        // Если этого типа нет в counts или его количество равно 0
        if (!(type in state.counts) || state.counts[type as EntityType] === 0) {
          console.log(`Adding missing entity type from context: ${type}`)
          addEntity(type as EntityType)
          addCodexEntry(`A dormant entity type "${type}" has awakened in the ecosystem.`)
        }
      })

      // Перерисовываем экосистему
      render()
    }

    // Отписываемся при размонтировании
    return unsubscribe
  }, [onEntityAdded, addEntity, addCodexEntry, getCustomEntityTypes, state.counts, render])

  // Check if it's time to generate a new codex entry
  useEffect(() => {
    const codexInterval = setInterval(() => {
      const currentTime = Date.now()
      if (currentTime - lastCodexTime >= CODEX_GENERATION_INTERVAL_MS && !isLoading) {
        requestCodexEntry()
        setLastCodexTime(currentTime)
      }
    }, 2000) // Check every 2 seconds

    return () => clearInterval(codexInterval)
  }, [lastCodexTime, isLoading, requestCodexEntry])

  // Effect for periodic autonomous entity evolution
  useEffect(() => {
    const evolutionInterval = setInterval(() => {
      const currentTime = Date.now()
      if (currentTime - lastEntityEvolution >= ENTITY_EVOLUTION_INTERVAL) {
        evolveEcosystemEntities(requestNewEntityGeneration, handleEntityRemoved)
        setLastEntityEvolution(currentTime)
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(evolutionInterval)
  }, [lastEntityEvolution, evolveEcosystemEntities, requestNewEntityGeneration, handleEntityRemoved])

  // For testing purposes, add a shortened interval option:
  useEffect(() => {
    // For development/testing - press Alt+E to trigger immediate evolution
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "e") {
        evolveEcosystemEntities(requestNewEntityGeneration, handleEntityRemoved)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [evolveEcosystemEntities, requestNewEntityGeneration, handleEntityRemoved])

  // Render when state changes
  useEffect(() => {
    render()
  }, [state, render])

  // Set up animation loop based on parameters
  useEffect(() => {
    const animationInterval = setInterval(() => {
      // Update entity positions
      state.entities.forEach((entity) => {
        // Age the entity
        entity.age++
      })

      // Update environment
      updateEnvironment()

      // Process random events
      processRandomEvents()

      // Process entity lifecycle
      processEntityLifecycle()

      // Render the updated state
      render()
    }, animationSpeed)

    return () => clearInterval(animationInterval)
  }, [animationSpeed, state, updateEnvironment, processRandomEvents, processEntityLifecycle, render])

  // Effect for periodic agent communication
  useEffect(() => {
    const communicationInterval = setInterval(() => {
      // Only send a new query if not currently loading and enough time has passed
      if (!isLoading && Date.now() - lastUpdateTime > 30000) {
        // 30 seconds between queries
        sendRandomQueryToAgent()
        setLastUpdateTime(Date.now())
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(communicationInterval)
  }, [isLoading, lastUpdateTime, sendRandomQueryToAgent])

  // Effect to process agent responses
  useEffect(() => {
    // Only process if we have messages
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]

      // Process assistant responses
      if (lastMessage.role === "assistant") {
        // Check message type based on the previous user message
        if (messages.length > 1) {
          const prevMessage = messages[messages.length - 2]

          if (prevMessage.content.includes("[CODEX REQUEST]")) {
            processCodexResponse(lastMessage.content)
          } else if (prevMessage.content.includes("[ENTITY REQUEST]")) {
            processEntityResponse(lastMessage.content, prevMessage.content)
          } else if (prevMessage.content.includes("[ENTITY GENERATION]")) {
            processEntityGenerationResponse(lastMessage.content)
          } else {
            const { adjustParameter } = useEcosystemParameters(state)

            if (lastMessage.content.includes("increase resonance")) {
              // Example: Increase resonance parameter
              adjustParameter("resonance", 10)
            } else if (lastMessage.content.includes("decrease entropy")) {
              // Example: Decrease entropy parameter
              adjustParameter("entropy", -10)
            } else if (lastMessage.content.includes("shift to quantum")) {
              // Example: Change environment
              state.environment = "quantum"
            } else if (lastMessage.content.includes("create new entity")) {
              // Example: Create a new entity
              const entityTypes: EntityType[] = ["resonant", "prismatic", "weaver", "dancer", "collective"]
              const randomType = entityTypes[Math.floor(Math.random() * entityTypes.length)]

              // Create the entity

              // Add to codex if this is a new discovery
              if (state.counts[randomType] === 0) {
                addCodexEntry(`Guardian initiated manifestation of first ${randomType} entity.`)
              }

              addEntity(randomType)
            }

            // Re-render the ecosystem with the changes
            render()
          }
        } else {
          const { adjustParameter } = useEcosystemParameters(state)

          if (lastMessage.content.includes("increase resonance")) {
            // Example: Increase resonance parameter
            adjustParameter("resonance", 10)
          } else if (lastMessage.content.includes("decrease entropy")) {
            // Example: Decrease entropy parameter
            adjustParameter("entropy", -10)
          } else if (lastMessage.content.includes("shift to quantum")) {
            // Example: Change environment
            state.environment = "quantum"
          } else if (lastMessage.content.includes("create new entity")) {
            // Example: Create a new entity
            const entityTypes: EntityType[] = ["resonant", "prismatic", "weaver", "dancer", "collective"]
            const randomType = entityTypes[Math.floor(Math.random() * entityTypes.length)]

            // Create the entity

            // Add to codex if this is a new discovery
            if (state.counts[randomType] === 0) {
              addCodexEntry(`Guardian initiated manifestation of first ${randomType} entity.`)
            }

            addEntity(randomType)
          }

          // Re-render the ecosystem with the changes
          render()
        }
      }

      // Process user messages (that aren't special requests)
      if (
        lastMessage.role === "user" &&
        !lastMessage.content.startsWith("[ECOSYSTEM QUERY]") &&
        !lastMessage.content.startsWith("[CODEX REQUEST]") &&
        !lastMessage.content.startsWith("[ENTITY REQUEST]")
      ) {
        processUserMessage(lastMessage.content, requestEntityAction)
      }
    }
  }, [
    messages,
    processUserMessage,
    requestEntityAction,
    processCodexResponse,
    processEntityResponse,
    processEntityGenerationResponse,
  ])

  // Автоматически запускаем автономный режим при монтировании компонента
  useEffect(() => {
    if (!isAutonomousModeActive) {
      startAutonomousMode()
    }
  }, [isAutonomousModeActive, startAutonomousMode])

  // В конце функции render добавьте кнопки управления автономным режимом
  return (
    <div className="border border-[#3a7c8c] p-2.5 rounded bg-[#0a1a1f] mb-5 shadow-[0_0_20px_rgba(100,200,255,0.2)]">
      <h3 className="text-lg font-bold mb-2 text-center text-[#7fdbff]">Ecosystem Visualization</h3>
      <pre
        id="ecosystem"
        ref={ecosystemRef}
        className="whitespace-pre font-mono text-sm leading-tight text-[#7fdbff] min-h-[400px] min-w-[600px]"
        style={{ textShadow: "0 0 5px rgba(127, 219, 255, 0.7)" }}
      ></pre>
      {guardianMessage && <div className="text-xs text-center opacity-70 mt-1 italic">{guardianMessage}</div>}

      {/* Информация об автономном режиме */}
      {autonomousInfo && (
        <div className="text-xs text-center text-[#7fdbff] mt-1 bg-[#0e2b36] p-1 rounded">{autonomousInfo}</div>
      )}

      {/* Удаляем кнопки управления автономным режимом и заменяем на информационное сообщение */}
      <div className="text-xs text-center text-[#7fdbff] mt-1">
        Ecosystem operates autonomously, evolving even when you're not viewing it
      </div>

      <div className="text-xs text-center opacity-70 mt-1 italic">
        You may request the Guardian to add or remove entities, but it maintains dimensional sovereignty.
      </div>
    </div>
  )
}

