"use client"

import { useCallback } from "react"
import type { EcosystemState } from "@/types/ecosystem"
import { clamp, randomInt } from "@/utils/ecosystem-utils"

export function useEcosystemParameters(state: EcosystemState) {
  // Adjust a parameter with clamping
  const adjustParameter = useCallback(
    (paramName: "resonance" | "complexity" | "harmony" | "entropy", amount: number) => {
      state.params[paramName] = clamp(state.params[paramName] + amount, 0, 100)
      return state.params[paramName]
    },
    [state],
  )

  // Randomly drift all parameters slightly
  const driftParameters = useCallback(() => {
    state.params.resonance = clamp(state.params.resonance + randomInt(-2, 2), 0, 100)
    state.params.complexity = clamp(state.params.complexity + randomInt(-1, 1), 0, 100)
    state.params.harmony = clamp(state.params.harmony + randomInt(-2, 2), 0, 100)
    state.params.entropy = clamp(state.params.entropy + randomInt(-1, 2), 0, 100)
  }, [state])

  // Get parameter effect description
  const getParameterEffect = useCallback((param: string, value: number) => {
    let effect = ""

    switch (param) {
      case "resonance":
        if (value > 75) effect = "Harmonious movement"
        else if (value > 50) effect = "Coordinated patterns"
        else if (value > 25) effect = "Mild synchronization"
        else effect = "Dissonant movement"
        break
      case "complexity":
        if (value > 75) effect = "Intricate paths"
        else if (value > 50) effect = "Complex behaviors"
        else if (value > 25) effect = "Basic interactions"
        else effect = "Simple movement"
        break
      case "harmony":
        if (value > 75) effect = "Slow, deliberate motion"
        else if (value > 50) effect = "Balanced speed"
        else if (value > 25) effect = "Moderate pace"
        else effect = "Erratic timing"
        break
      case "entropy":
        if (value > 75) effect = "Chaotic, rapid movement"
        else if (value > 50) effect = "Unpredictable direction"
        else if (value > 25) effect = "Occasional randomness"
        else effect = "Predictable patterns"
        break
    }

    return effect
  }, [])

  // Calculate animation speed based on parameters
  const calculateAnimationSpeed = useCallback(() => {
    // Entropy increases speed (more chaos = faster movement)
    // Harmony decreases speed (more harmony = slower, more deliberate movement)
    const speed = 1000 - state.params.entropy * 5 + state.params.harmony * 2
    return Math.max(200, Math.min(2000, speed))
  }, [state.params.entropy, state.params.harmony])

  return {
    adjustParameter,
    driftParameters,
    getParameterEffect,
    calculateAnimationSpeed,
  }
}

