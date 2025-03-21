"use client"

import { useEffect, useState, useMemo } from "react"
import { useEcosystem } from "@/hooks/use-ecosystem"
import { EcosystemDisplay } from "@/components/ecosystem-display"
import { ControlPanel } from "@/components/control-panel"
import { ParametersDisplay } from "@/components/parameters-display"
import { GuardianStatus } from "@/components/guardian-status"
import { ChatInterface } from "@/components/chat-interface"
import type { GuardianMood } from "@/constants/ecosystem"
import { CodexDisplay } from "../frontend/components/CodexDisplay"
// Добавьте импорт компонента AutonomousStatus
import { AutonomousStatus } from "@/components/autonomous-status"

// В функции LuminousEcosystem добавьте компонент AutonomousStatus после GuardianStatus
export default function LuminousEcosystem() {
  const { state, observeNaturally, stabilizeResonance, amplifyShift, focusEntity } = useEcosystem()
  const [guardianMood, setGuardianMood] = useState<GuardianMood>("analytical")

  // Memoize the mood selection function to avoid recreating it on every render
  const selectRandomMood = useMemo(() => {
    return () => {
      const moods: GuardianMood[] = ["analytical", "catalytic", "protective", "contemplative", "nurturing"]
      return moods[Math.floor(Math.random() * moods.length)]
    }
  }, [])

  // Update guardian mood when cycle changes
  useEffect(() => {
    setGuardianMood(selectRandomMood())
  }, [state.cycle, selectRandomMood])

  // Memoize the control panel props to avoid recreating them on every render
  const controlPanelProps = useMemo(
    () => ({
      onObserveNaturally: observeNaturally,
      onStabilizeResonance: stabilizeResonance,
      onAmplifyShift: amplifyShift,
      onFocusEntity: focusEntity,
    }),
    [observeNaturally, stabilizeResonance, amplifyShift, focusEntity],
  )

  return (
    <div className="bg-[#111] text-[#c4f5ff] font-mono flex flex-col items-center p-5 max-w-[1200px] mx-auto min-h-screen">
      <h1 className="text-2xl font-bold">Luminous Ecosystem</h1>

      {/* Main content area */}
      <div className="flex w-full mt-5 gap-5 flex-col">
        <div className="flex flex-col w-full">
          <EcosystemDisplay state={state} />
          <GuardianStatus state={state} />
          {/* Добавляем компонент AutonomousStatus */}
          <AutonomousStatus />
          <ControlPanel {...controlPanelProps} />
          <ParametersDisplay state={state} />
          <CodexDisplay />
        </div>
      </div>

      {/* Chat area at the bottom */}
      <ChatInterface guardianMood={guardianMood} />
    </div>
  )
}

