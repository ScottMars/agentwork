import type { EcosystemState } from "@/types/ecosystem"
import { supabase } from "@/lib/supabase"

// Таблицы Supabase для хранения данных экосистемы
const ECOSYSTEM_STATE_TABLE = "ecosystem_state"
const LAST_UPDATE_TABLE = "ecosystem_update"

// Ключ для идентификации состояния в Supabase
const STATE_KEY = "main_state"

// Интервал автоматического сохранения (в миллисекундах)
const AUTO_SAVE_INTERVAL = 30000 // 30 секунд

class AutonomousEcosystemService {
  private worker: Worker | null = null
  private isInitialized = false
  private subscribers: ((state: EcosystemState) => void)[] = []
  private lastSaveTime = 0
  private autoSaveInterval: NodeJS.Timeout | null = null

  // Инициализация сервиса
  public async initialize(initialState: EcosystemState): Promise<void> {
    if (this.isInitialized) return

    try {
      // Создаем Web Worker с использованием Blob URL вместо импорта модуля
      // Это решает проблему с 'export' в воркере
      if (typeof window !== "undefined") {
        // Проверяем, поддерживаются ли воркеры в браузере
        if (window.Worker) {
          // Создаем воркер напрямую, без использования import.meta.url
          this.worker = new Worker(new URL("../workers/ecosystem-worker.ts", import.meta.url), { type: "module" })

          // Настраиваем обработчик сообщений от воркера
          this.worker.onmessage = this.handleWorkerMessage.bind(this)

          // Загружаем сохраненное состояние из Supabase или используем начальное
          const savedState = await this.loadState()
          const state = savedState || initialState

          // Инициализируем воркер
          this.worker.postMessage({
            type: "init",
            data: { state },
          })

          // Настраиваем автоматическое сохранение
          this.setupAutoSave()

          this.isInitialized = true
          console.log("Autonomous ecosystem service initialized")
        } else {
          // Если воркеры не поддерживаются, используем fallback режим
          console.warn("Web Workers are not supported in this browser. Using fallback mode.")
          this.setupFallbackMode(initialState)
        }
      }
    } catch (error) {
      console.error("Failed to initialize autonomous ecosystem service:", error)
      // В случае ошибки также используем fallback режим
      this.setupFallbackMode(initialState)
    }
  }

  // Fallback режим без использования воркера
  private setupFallbackMode(initialState: EcosystemState): void {
    // Сохраняем начальное состояние
    this.saveState(initialState)
    this.isInitialized = true

    // Устанавливаем интервал для периодического обновления
    this.autoSaveInterval = setInterval(() => {
      // Уведомляем подписчиков о "фиктивном" обновлении
      this.notifySubscribers(initialState)
    }, 10000)

    console.log("Autonomous ecosystem service initialized in fallback mode")
  }

  // Остановка автономной работы
  public stop(): void {
    if (!this.isInitialized) return

    if (this.worker) {
      this.worker.postMessage({ type: "stop" })
    }

    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }

    console.log("Autonomous ecosystem service stopped")
  }

  // Возобновление автономной работы
  public resume(): void {
    if (!this.isInitialized) return

    if (this.worker) {
      this.worker.postMessage({ type: "resume" })
    }

    this.setupAutoSave()

    console.log("Autonomous ecosystem service resumed")
  }

  // Обновление состояния экосистемы
  public updateState(state: EcosystemState): void {
    if (!this.isInitialized) return

    if (this.worker) {
      this.worker.postMessage({
        type: "update",
        data: { state },
      })
    } else {
      // В fallback режиме просто сохраняем состояние
      this.saveState(state)
    }
  }

  // Подписка на обновления состояния
  public subscribe(callback: (state: EcosystemState) => void): () => void {
    this.subscribers.push(callback)

    // Возвращаем функцию отписки
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback)
    }
  }

  // Сохранение состояния в Supabase
  public async saveState(state: EcosystemState): Promise<void> {
    try {
      // Сохраняем состояние в Supabase
      const { error: stateError } = await supabase
        .from(ECOSYSTEM_STATE_TABLE)
        .upsert(
          {
            id: STATE_KEY,
            state: state,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )

      if (stateError) throw stateError

      // Обновляем время последнего обновления
      const { error: updateError } = await supabase
        .from(LAST_UPDATE_TABLE)
        .upsert(
          {
            id: STATE_KEY,
            last_update: Date.now(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )

      if (updateError) throw updateError

      this.lastSaveTime = Date.now()
      console.log("Ecosystem state saved to Supabase")
    } catch (error) {
      console.error("Failed to save ecosystem state to Supabase:", error)
      
      // Fallback to localStorage if Supabase fails
      try {
        localStorage.setItem("luminous-ecosystem-state", JSON.stringify(state))
        localStorage.setItem("luminous-ecosystem-last-update", Date.now().toString())
        console.log("Ecosystem state saved to localStorage (fallback)")
      } catch (localError) {
        console.error("Failed to save ecosystem state to localStorage (fallback):", localError)
      }
    }
  }

  // Загрузка состояния из Supabase
  public async loadState(): Promise<EcosystemState | null> {
    try {
      // Загружаем состояние из Supabase
      const { data, error } = await supabase
        .from(ECOSYSTEM_STATE_TABLE)
        .select('state')
        .eq('id', STATE_KEY)
        .single()

      if (error) throw error

      if (data && data.state) {
        console.log("Ecosystem state loaded from Supabase")
        return data.state as EcosystemState
      }
      
      return null
    } catch (error) {
      console.error("Failed to load ecosystem state from Supabase:", error)
      
      // Fallback to localStorage if Supabase fails
      try {
        const stateJson = localStorage.getItem("luminous-ecosystem-state")
        if (!stateJson) return null

        const state = JSON.parse(stateJson) as EcosystemState
        console.log("Ecosystem state loaded from localStorage (fallback)")
        return state
      } catch (localError) {
        console.error("Failed to load ecosystem state from localStorage (fallback):", localError)
        return null
      }
    }
  }

  // Получение времени последнего обновления из Supabase
  public async getLastUpdateTime(): Promise<number> {
    try {
      // Загружаем время последнего обновления из Supabase
      const { data, error } = await supabase
        .from(LAST_UPDATE_TABLE)
        .select('last_update')
        .eq('id', STATE_KEY)
        .single()

      if (error) throw error

      if (data && data.last_update) {
        return data.last_update
      }
      
      return 0
    } catch (error) {
      console.error("Failed to get last update time from Supabase:", error)
      
      // Fallback to localStorage if Supabase fails
      try {
        const lastUpdate = localStorage.getItem("luminous-ecosystem-last-update")
        return lastUpdate ? Number.parseInt(lastUpdate, 10) : 0
      } catch {
        return 0
      }
    }
  }

  // Очистка сохраненного состояния в Supabase
  public async clearSavedState(): Promise<void> {
    try {
      // Удаляем состояние из Supabase
      const { error: stateError } = await supabase
        .from(ECOSYSTEM_STATE_TABLE)
        .delete()
        .eq('id', STATE_KEY)

      if (stateError) throw stateError

      // Удаляем время последнего обновления
      const { error: updateError } = await supabase
        .from(LAST_UPDATE_TABLE)
        .delete()
        .eq('id', STATE_KEY)

      if (updateError) throw updateError

      console.log("Saved ecosystem state cleared from Supabase")
    } catch (error) {
      console.error("Failed to clear saved ecosystem state from Supabase:", error)
      
      // Fallback to localStorage if Supabase fails
      try {
        localStorage.removeItem("luminous-ecosystem-state")
        localStorage.removeItem("luminous-ecosystem-last-update")
        console.log("Saved ecosystem state cleared from localStorage (fallback)")
      } catch (localError) {
        console.error("Failed to clear saved ecosystem state from localStorage (fallback):", localError)
      }
    }
  }

  // Обработчик сообщений от воркера
  private handleWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data

    switch (type) {
      case "state":
        // Уведомляем подписчиков о новом состоянии
        this.notifySubscribers(data.state)
        break

      case "save":
        // Сохраняем состояние
        this.saveState(data.state)
        break
    }
  }

  // Уведомление подписчиков о новом состоянии
  private notifySubscribers(state: EcosystemState): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(state)
      } catch (error) {
        console.error("Error in ecosystem state subscriber:", error)
      }
    })
  }

  // Настройка автоматического сохранения
  private setupAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }

    this.autoSaveInterval = setInterval(() => {
      // Запрашиваем у воркера сохранение текущего состояния
      if (this.worker) {
        this.worker.postMessage({ type: "save" })
      }
    }, AUTO_SAVE_INTERVAL)
  }
}

// Создаем синглтон сервиса
const autonomousEcosystemService = new AutonomousEcosystemService()

export default autonomousEcosystemService

