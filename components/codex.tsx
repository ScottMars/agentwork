"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import type { EcosystemState, CodexEntry } from "@/types/ecosystem"
import { useCodex } from "@/hooks/use-codex"
import { useEcosystem } from "@/context/ecosystem-context"

interface CodexProps {
  state: EcosystemState
}

export function Codex({ state }: CodexProps) {
  const [filteredEntries, setFilteredEntries] = useState<CodexEntry[]>([])
  const { getFilteredEntries, addCodexEntry } = useCodex(state)
  const { onEntityAdded } = useEcosystem()

  // Функция для обработки новых типов сущностей
  const handleNewEntityType = useCallback(
    (entityType: string) => {
      // Используем addCodexEntry из useCodex, а не из useEcosystem
      addCodexEntry(`New entity type "${entityType}" has been documented in the Wiki.`)
    },
    [addCodexEntry],
  )

  // Подписываемся на добавление новых сущностей
  useEffect(() => {
    const unsubscribe = onEntityAdded(handleNewEntityType)
    return () => unsubscribe()
  }, [onEntityAdded, handleNewEntityType])

  // Фильтруем записи чаще для более быстрого обновления
  useEffect(() => {
    const interval = setInterval(() => {
      setFilteredEntries(getFilteredEntries(20))
    }, 3000) // Обновляем каждые 3 секунды вместо ожидания изменений

    return () => clearInterval(interval)
  }, [getFilteredEntries])

  // Add a new useEffect hook after the existing useEffect hooks to generate messages every 30 seconds

  // Add this after the existing useEffect hooks and before the useMemo
  useEffect(() => {
    // Function to generate a message based on ecosystem parameters
    const generateParameterBasedMessage = () => {
      const { params, environment, counts } = state

      // Create different message types based on parameters
      const messages = [
        // Resonance messages
        params.resonance > 75 && `Harmonic resonance reaching peak levels at ${params.resonance}%`,
        params.resonance < 25 && `Resonance fields weakening, currently at ${params.resonance}%`,

        // Complexity messages
        params.complexity > 80 && `System complexity approaching critical threshold at ${params.complexity}%`,
        params.complexity < 20 && `Dimensional simplification occurring at ${params.complexity}% complexity`,

        // Harmony messages
        params.harmony > 85 && `Exceptional harmony detected across all entity types at ${params.harmony}%`,
        params.harmony < 30 && `Dissonance increasing as harmony falls to ${params.harmony}%`,

        // Entropy messages
        params.entropy > 70 && `Chaotic fluctuations intensifying with entropy at ${params.entropy}%`,
        params.entropy < 20 && `Unusual stability observed with low entropy of ${params.entropy}%`,

        // Environment-specific messages
        environment === "quantum" && "Quantum probability fields collapsing and reforming rapidly",
        environment === "prismatic" && "Prismatic refraction amplifying information transfer between entities",
        environment === "harmonic" && "Harmonic waves synchronizing entity movement patterns",
        environment === "tranquil" && "Tranquil state enabling deeper entity communication",

        // Entity population messages
        counts.resonant > 10 && `High resonant population (${counts.resonant}) creating amplification fields`,
        counts.prismatic > 8 && `Prismatic drifter concentration (${counts.prismatic}) thinning dimensional boundaries`,
        counts.weaver > 5 && `Thought weaver collective (${counts.weaver}) forming complex information networks`,
        counts.dancer > 3 && `Void dancer gathering (${counts.dancer}) generating unusual void currents`,
        counts.collective > 2 &&
          `Multiple crystalline collectives (${counts.collective}) establishing higher consciousness`,

        // Parameter relationship messages
        params.harmony > 60 && params.resonance > 60 && "Harmony-resonance synchronization creating stable patterns",
        params.entropy > 60 && params.complexity > 60 && "Entropy-complexity interaction generating novel structures",
        params.resonance > 70 && params.entropy < 30 && "Resonance dominating entropy, creating ordered patterns",
        params.harmony < 40 && params.entropy > 60 && "Disharmony and entropy causing unpredictable fluctuations",
      ]

      // Filter out null/undefined/false values and select a random message
      const validMessages = messages.filter(Boolean)

      if (validMessages.length > 0) {
        const randomMessage = validMessages[Math.floor(Math.random() * validMessages.length)]
        addCodexEntry(randomMessage)
      } else {
        // Fallback message if no conditions are met
        addCodexEntry("Subtle shifts detected in the etheric field")
      }
    }

    // Generate a message immediately
    generateParameterBasedMessage()

    // Set up interval to generate messages every 30 seconds
    const interval = setInterval(generateParameterBasedMessage, 30000)

    return () => clearInterval(interval)
  }, [state, addCodexEntry])

  // Memoize the rendered entries to avoid recreating them on every render
  const renderedEntries = useMemo(() => {
    return filteredEntries.map((entry, index) => (
      <div key={`${entry.cycle}-${index}`} className="border-b border-dotted border-[#3a7c8c] pb-2.5 mb-2.5">
        <strong>Cycle {entry.cycle}:</strong> {entry.text}
      </div>
    ))
  }, [filteredEntries])

  return (
    <div className="bg-[#0e2b36] border border-[#3a7c8c] p-2.5 mb-5 rounded w-full h-[250px] overflow-y-auto shadow-[0_0_10px_rgba(58,124,140,0.3)]">
      <h3 className="text-lg font-bold">Ethereal Codex</h3>
      <div className="space-y-1.5">{renderedEntries}</div>
      {filteredEntries.length === 0 && (
        <div className="text-center italic text-sm mt-4 text-[#7fdbff]/70">Awaiting dimensional fluctuations...</div>
      )}
    </div>
  )
}

