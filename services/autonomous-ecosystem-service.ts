import type { EcosystemState } from "@/types/ecosystem"

// Ключ для хранения состояния в localStorage
const ECOSYSTEM_STATE_KEY = "luminous-ecosystem-state"
const LAST_UPDATE_KEY = "luminous-ecosystem-last-update"

// Интервал автоматического сохранения (в миллисекундах)
const AUTO_SAVE_INTERVAL = 30000 // 30 секунд

class AutonomousEcosystemService {
  private worker: Worker | null = null
  private isInitialized = false
  private subscribers: ((state: EcosystemState) => void)[] = []
  private lastSaveTime = 0
  private autoSaveInterval: NodeJS.Timeout | null = null

  // Инициализация сервиса
  public initialize(initialState: EcosystemState): void {
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

          // Загружаем сохраненное состояние или используем начальное
          const savedState = this.loadState()
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

  // Сохранение состояния в localStorage
  public saveState(state: EcosystemState): void {
    try {
      localStorage.setItem(ECOSYSTEM_STATE_KEY, JSON.stringify(state))
      localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString())
      this.lastSaveTime = Date.now()
      console.log("Ecosystem state saved")
    } catch (error) {
      console.error("Failed to save ecosystem state:", error)
    }
  }

  // Загрузка состояния из localStorage
  public loadState(): EcosystemState | null {
    try {
      const stateJson = localStorage.getItem(ECOSYSTEM_STATE_KEY)
      if (!stateJson) return null

      const state = JSON.parse(stateJson) as EcosystemState
      console.log("Ecosystem state loaded")
      return state
    } catch (error) {
      console.error("Failed to load ecosystem state:", error)
      return null
    }
  }

  // Получение времени последнего обновления
  public getLastUpdateTime(): number {
    try {
      const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY)
      return lastUpdate ? Number.parseInt(lastUpdate, 10) : 0
    } catch {
      return 0
    }
  }

  // Очистка сохраненного состояния
  public clearSavedState(): void {
    try {
      localStorage.removeItem(ECOSYSTEM_STATE_KEY)
      localStorage.removeItem(LAST_UPDATE_KEY)
      console.log("Saved ecosystem state cleared")
    } catch (error) {
      console.error("Failed to clear saved ecosystem state:", error)
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

