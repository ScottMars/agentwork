import type { EntityType, EnvironmentType } from "@/constants/ecosystem"

export interface Entity {
  type: EntityType
  position: { x: number; y: number }
  pattern: string[]
  frame: number
  age: number
  direction: { x: number; y: number }
  speed: number
}

export interface CodexEntry {
  cycle: number
  text: string
}

export interface EcosystemState {
  cycle: number
  environment: EnvironmentType
  environmentFrame: number
  entities: Entity[]
  params: {
    resonance: number
    complexity: number
    harmony: number
    entropy: number
  }
  counts: {
    resonant: number
    prismatic: number
    weaver: number
    dancer: number
    collective: number
    guardian: number
  }
  codexEntries: CodexEntry[]
  guardian: {
    active: boolean
    mood: string
    focus: string
    position: { x: number; y: number }
    lastAction: number
    actionCooldown: number
    suggestionHistory: string[]
  }
}

