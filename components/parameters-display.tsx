"use client"

import { useRouter } from "next/navigation"
import { useMemo, useEffect, useState } from "react"
import type { EcosystemState } from "@/types/ecosystem"
import type { EntityType } from "@/constants/ecosystem"
import { useEcosystemParameters } from "@/hooks/use-ecosystem-parameters"
import { useEcosystem } from "@/context/ecosystem-context"

interface ParametersDisplayProps {
  state: EcosystemState
}

export function ParametersDisplay({ state }: ParametersDisplayProps) {
  const router = useRouter()
  const { getParameterEffect } = useEcosystemParameters(state)
  const { entityDisplayNames, entityColorClasses, getCustomEntityTypes } = useEcosystem()

  // Состояние для хранения пользовательских типов сущностей
  const [customTypes, setCustomTypes] = useState<string[]>([])

  // Загружаем пользовательские типы сущностей
  useEffect(() => {
    setCustomTypes(getCustomEntityTypes())
  }, [getCustomEntityTypes])

  // Memoize parameter effects to avoid recalculation on every render
  const parameterEffects = useMemo(() => {
    return {
      resonance: getParameterEffect("resonance", state.params.resonance),
      complexity: getParameterEffect("complexity", state.params.complexity),
      harmony: getParameterEffect("harmony", state.params.harmony),
      entropy: getParameterEffect("entropy", state.params.entropy),
    }
  }, [state.params.resonance, state.params.complexity, state.params.harmony, state.params.entropy, getParameterEffect])

  // Memoize entity status messages
  const entityStatusMessages = useMemo(() => {
    const messages: Record<string, string> = {
      resonant:
        state.params.resonance > 70
          ? "Moving in harmony"
          : state.params.entropy > 60
            ? "Chaotic movement"
            : "Stable patterns",
      prismatic:
        state.params.complexity > 60
          ? "Complex trajectories"
          : state.params.harmony > 70
            ? "Flowing gracefully"
            : "Standard drift patterns",
      weaver:
        state.counts.weaver === 0
          ? "None present"
          : state.params.resonance > 65
            ? "Weaving harmonious patterns"
            : "Creating thought structures",
      dancer:
        state.counts.dancer === 0
          ? "None present"
          : state.params.entropy > 50
            ? "Dancing chaotically"
            : "Graceful void movements",
      collective:
        state.counts.collective === 0
          ? "None present"
          : state.params.harmony > 75
            ? "Highly synchronized"
            : "Forming consciousness patterns",
    }

    // Добавляем сообщения для пользовательских типов
    customTypes.forEach((type) => {
      if (!(type in messages)) {
        messages[type] =
          state.counts[type as EntityType] === 0
            ? "None present"
            : state.params.harmony > 60
              ? "Harmonious movement"
              : "Standard patterns"
      }
    })

    return messages
  }, [
    state.params.resonance,
    state.params.complexity,
    state.params.harmony,
    state.params.entropy,
    state.counts,
    customTypes,
  ])

  return (
    <div className="bg-[#0e2b36] border border-[#3a7c8c] p-2.5 mb-5 rounded w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">Ecosystem Parameters</h3>
        <button
          className="bg-[#1a4e64] text-[#7fdbff] px-3 py-1 rounded border border-[#3a7c8c] hover:bg-[#2a6e84] hover:shadow-[0_0_10px_rgba(127,219,255,0.3)] transition-all"
          onClick={() => router.push("/wiki")}
        >
          Go to Wiki
        </button>
      </div>
      <div className="flex flex-wrap justify-between">
        <div className="flex-1 min-w-[40%] m-1">
          <div className="flex justify-between items-center">
            <span>
              Resonance: <span>{state.params.resonance}</span>%
            </span>
            <span className="text-xs italic text-[#7fdbff]">{parameterEffects.resonance}</span>
          </div>
          <div className="w-full bg-[#0a1a1f] rounded-full h-2.5 mb-2">
            <div className="bg-[#7fdbff] h-2.5 rounded-full" style={{ width: `${state.params.resonance}%` }}></div>
          </div>

          <div className="flex justify-between items-center">
            <span>
              Complexity: <span>{state.params.complexity}</span>%
            </span>
            <span className="text-xs italic text-[#ff7fdb]">{parameterEffects.complexity}</span>
          </div>
          <div className="w-full bg-[#0a1a1f] rounded-full h-2.5 mb-2">
            <div className="bg-[#ff7fdb] h-2.5 rounded-full" style={{ width: `${state.params.complexity}%` }}></div>
          </div>
        </div>
        <div className="flex-1 min-w-[40%] m-1">
          <div className="flex justify-between items-center">
            <span>
              Harmony: <span>{state.params.harmony}</span>%
            </span>
            <span className="text-xs italic text-[#dbff7f]">{parameterEffects.harmony}</span>
          </div>
          <div className="w-full bg-[#0a1a1f] rounded-full h-2.5 mb-2">
            <div className="bg-[#dbff7f] h-2.5 rounded-full" style={{ width: `${state.params.harmony}%` }}></div>
          </div>

          <div className="flex justify-between items-center">
            <span>
              Entropy: <span>{state.params.entropy}</span>%
            </span>
            <span className="text-xs italic text-[#db7fff]">{parameterEffects.entropy}</span>
          </div>
          <div className="w-full bg-[#0a1a1f] rounded-full h-2.5 mb-2">
            <div className="bg-[#db7fff] h-2.5 rounded-full" style={{ width: `${state.params.entropy}%` }}></div>
          </div>
        </div>
      </div>
      <h3 className="text-lg font-bold">Detected Entities</h3>
      <div className="grid grid-cols-1 gap-1">
        {state.counts.guardian > 0 && (
          <div className="flex items-center">
            •{" "}
            <span className="text-[#ffcc00] cursor-pointer hover:underline hover:brightness-125 transition-all">
              1 Etheric Guardian
            </span>
            <span className="text-xs ml-2 opacity-70">Oversees dimensional stability</span>
          </div>
        )}
        <div className="flex items-center">
          •{" "}
          <span
            className="text-[#7fdbff] cursor-pointer hover:underline hover:brightness-125 transition-all"
            title="Simple entities that respond to resonance"
          >
            {state.counts.resonant} Resonants
          </span>
          <span className="text-xs ml-2 opacity-70">{entityStatusMessages.resonant}</span>
        </div>
        <div className="flex items-center">
          •{" "}
          <span
            className="text-[#ff7fdb] cursor-pointer hover:underline hover:brightness-125 transition-all"
            title="Fast-moving entities that drift through dimensions"
          >
            {state.counts.prismatic} Prismatic Drifters
          </span>
          <span className="text-xs ml-2 opacity-70">{entityStatusMessages.prismatic}</span>
        </div>
        <div className="flex items-center">
          •{" "}
          <span
            className="text-[#dbff7f] cursor-pointer hover:underline hover:brightness-125 transition-all"
            title="Entities that weave thought patterns"
          >
            {state.counts.weaver} Thought Weavers
          </span>
          <span className="text-xs ml-2 opacity-70">{entityStatusMessages.weaver}</span>
        </div>
        <div className="flex items-center">
          •{" "}
          <span
            className="text-[#db7fff] cursor-pointer hover:underline hover:brightness-125 transition-all"
            title="Entities that dance through the void"
          >
            {state.counts.dancer} Void Dancers
          </span>
          <span className="text-xs ml-2 opacity-70">{entityStatusMessages.dancer}</span>
        </div>
        <div className="flex items-center">
          •{" "}
          <span
            className="text-[#ffffff] cursor-pointer hover:underline hover:brightness-125 transition-all"
            title="Collective consciousness entities"
          >
            {state.counts.collective} Crystalline Collectives
          </span>
          <span className="text-xs ml-2 opacity-70">{entityStatusMessages.collective}</span>
        </div>

        {/* Отображаем пользовательские типы сущностей */}
        {customTypes.map((type) => (
          <div key={type} className="flex items-center">
            •{" "}
            <span className={entityColorClasses[type] || "text-[#ffa500]"} title={`Custom entity type: ${type}`}>
              {state.counts[type as EntityType] || 0} {entityDisplayNames[type] || type}
            </span>
            <span className="text-xs ml-2 opacity-70">{entityStatusMessages[type] || "Custom entity"}</span>
          </div>
        ))}

        <div className="text-xs mt-2 text-center italic opacity-70">
          Entities respond to ecosystem parameters and interact with each other
        </div>
      </div>
    </div>
  )
}

