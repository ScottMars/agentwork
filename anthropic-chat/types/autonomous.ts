import type { EcosystemState } from "./ecosystem"

// Типы сообщений для Web Worker
export type WorkerMessageType =
  | "init" // Инициализация воркера
  | "update" // Обновление состояния
  | "state" // Новое состояние от воркера
  | "save" // Сохранение состояния
  | "stop" // Остановка автономного режима
  | "resume" // Возобновление автономного режима

// Интерфейс сообщения для Web Worker
export interface WorkerMessage {
  type: WorkerMessageType
  data?: {
    state?: EcosystemState
    [key: string]: any
  }
}

// Интерфейс для сервиса автономной экосистемы
export interface AutonomousEcosystemServiceInterface {
  initialize(initialState: EcosystemState): void
  stop(): void
  resume(): void
  updateState(state: EcosystemState): void
  subscribe(callback: (state: EcosystemState) => void): () => void
  saveState(state: EcosystemState): void
  loadState(): EcosystemState | null
  getLastUpdateTime(): number
  clearSavedState(): void
}

// Статус автономного режима
export enum AutonomousStatus {
  INACTIVE = "inactive",
  ACTIVE = "active",
  LOADING = "loading",
  ERROR = "error",
}

