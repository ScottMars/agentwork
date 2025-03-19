// Этот Web Worker обеспечивает автономную работу экосистемы даже когда вкладка неактивна

// Типы для воркера
type EntityType = "resonant" | "prismatic" | "weaver" | "dancer" | "collective" | "guardian" | string
type EnvironmentType = "tranquil" | "harmonic" | "prismatic" | "quantum"

interface Entity {
  type: EntityType
  position: { x: number; y: number }
  pattern: string[]
  frame: number
  age: number
  direction: { x: number; y: number }
  speed: number
}

interface CodexEntry {
  cycle: number
  text: string
}

interface EcosystemState {
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
  counts: Record<EntityType, number>
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

// Интервал обновления экосистемы (в миллисекундах)
const UPDATE_INTERVAL = 1000
const SAVE_INTERVAL = 10000 // Сохранение каждые 10 секунд
const ENTITY_EVOLUTION_INTERVAL = 60000 // Эволюция сущностей каждую минуту
const CODEX_GENERATION_INTERVAL = 30000 // Генерация записей в кодекс каждые 30 секунд

// Состояние экосистемы в воркере
let state: EcosystemState | null = null
let lastSaveTime = 0
let lastEntityEvolutionTime = 0
let lastCodexGenerationTime = 0
let isRunning = false

// Обработчик сообщений от основного потока
self.onmessage = (event) => {
  const { type, data } = event.data

  switch (type) {
    case "init":
      // Инициализация воркера с начальным состоянием
      state = data.state
      isRunning = true
      startAutonomousLoop()
      break

    case "update":
      // Обновление состояния из основного потока
      state = data.state
      break

    case "stop":
      // Остановка автономного режима
      isRunning = false
      break

    case "resume":
      // Возобновление автономного режима
      if (!isRunning) {
        isRunning = true
        startAutonomousLoop()
      }
      break
  }
}

// Основной цикл автономной работы
function startAutonomousLoop() {
  if (!state) return

  const loop = () => {
    if (!isRunning) return

    const currentTime = Date.now()

    // Обновление экосистемы
    updateEcosystem()

    // Сохранение состояния
    if (currentTime - lastSaveTime > SAVE_INTERVAL) {
      saveState()
      lastSaveTime = currentTime
    }

    // Эволюция сущностей
    if (currentTime - lastEntityEvolutionTime > ENTITY_EVOLUTION_INTERVAL) {
      evolveEntities()
      lastEntityEvolutionTime = currentTime
    }

    // Генерация записей в кодекс
    if (currentTime - lastCodexGenerationTime > CODEX_GENERATION_INTERVAL) {
      generateCodexEntry()
      lastCodexGenerationTime = currentTime
    }

    // Отправка обновленного состояния в основной поток
    self.postMessage({ type: "state", data: { state } })

    // Планирование следующего обновления
    setTimeout(loop, UPDATE_INTERVAL)
  }

  // Запуск цикла
  loop()
}

// Обновление экосистемы
function updateEcosystem() {
  if (!state) return

  // Увеличение цикла
  state.cycle += 1

  // Обновление параметров
  driftParameters()

  // Обновление окружения
  updateEnvironment()

  // Обновление сущностей
  updateEntities()

  // Обработка случайных событий
  processRandomEvents()

  // Обработка жизненного цикла сущностей
  processEntityLifecycle()
}

// Случайное изменение параметров
function driftParameters() {
  if (!state) return

  state.params.resonance = clamp(state.params.resonance + randomInt(-2, 2), 0, 100)
  state.params.complexity = clamp(state.params.complexity + randomInt(-1, 1), 0, 100)
  state.params.harmony = clamp(state.params.harmony + randomInt(-2, 2), 0, 100)
  state.params.entropy = clamp(state.params.entropy + randomInt(-1, 2), 0, 100)
}

// Обновление окружения
function updateEnvironment() {
  if (!state) return

  state.environmentFrame++

  // Каждые 50 циклов рассматриваем возможность изменения окружения
  if (state.cycle % 50 === 0 && !state.guardian.active) {
    const roll = Math.random() * 100
    let newEnvironment: EnvironmentType

    if (roll < 15) {
      newEnvironment = "quantum"
    } else if (roll < 30) {
      newEnvironment = "prismatic"
    } else if (roll < 60) {
      newEnvironment = "harmonic"
    } else {
      newEnvironment = "tranquil"
    }

    if (newEnvironment !== state.environment) {
      state.environment = newEnvironment
      addCodexEntry(`Etheric Sea shifted to ${newEnvironment} state.`)
    }
  }
}

// Обновление сущностей
function updateEntities() {
  if (!state) return

  state.entities.forEach((entity) => {
    // Увеличение возраста сущности
    entity.age++

    // Анимация сущности (переключение кадров)
    if (state.cycle % 3 === 0) {
      // Обновление кадра анимации
      entity.frame = (entity.frame + 1) % 2 // Упрощенно, предполагаем максимум 2 кадра
    }

    // Перемещение сущности (кроме хранителя)
    if (state.cycle % (5 - (entity.speed || 1)) === 0 && entity.type !== "guardian") {
      // Шанс изменить направление
      if (Math.random() < 0.1) {
        entity.direction.x = Math.random() > 0.5 ? 1 : -1
        entity.direction.y = Math.random() > 0.5 ? 1 : -1
      }

      // Перемещение в текущем направлении
      entity.position.x += entity.direction.x
      entity.position.y += entity.direction.y

      // Проверка границ
      if (entity.position.x < 0) {
        entity.position.x = 0
        entity.direction.x *= -1
      }
      if (entity.position.x > 70) {
        entity.position.x = 70
        entity.direction.x *= -1
      }
      if (entity.position.y < 0) {
        entity.position.y = 0
        entity.direction.y *= -1
      }
      if (entity.position.y > 15) {
        entity.position.y = 15
        entity.direction.y *= -1
      }
    }
  })
}

// Обработка случайных событий
function processRandomEvents() {
  if (!state) return

  // Редкий шанс для особых событий
  if (Math.random() < 0.05) {
    // Взаимодействие сущностей
    checkEntityInteractions()

    // Гармоническая конвергенция
    if (state.params.resonance > 70 && state.params.harmony > 75) {
      addCodexEntry("Harmonic convergence detected in the Etheric Sea.")
      state.params.resonance += 5
    }

    // Энергетический поток
    if (state.params.entropy > 60) {
      addCodexEntry("Energy flux destabilizing the ecosystem.")
      state.params.harmony -= 5
    }
  }
}

// Проверка взаимодействий между сущностями
function checkEntityInteractions() {
  if (!state) return

  // Простая версия: проверка сущностей, находящихся рядом друг с другом
  for (let i = 0; i < state.entities.length; i++) {
    for (let j = i + 1; j < state.entities.length; j++) {
      const ent1 = state.entities[i]
      const ent2 = state.entities[j]

      // Пропускаем, если одна из сущностей - хранитель
      if (ent1.type === "guardian" || ent2.type === "guardian") continue

      const dx = Math.abs(ent1.position.x - ent2.position.x)
      const dy = Math.abs(ent1.position.y - ent2.position.y)

      // Если сущности находятся рядом
      if (dx < 10 && dy < 5) {
        // Resonant + Resonant рядом с Prismatic могут образовать Thought Weaver
        if (
          ent1.type === "resonant" &&
          ent2.type === "resonant" &&
          state.entities.some(
            (e) =>
              e.type === "prismatic" &&
              Math.abs(e.position.x - ent1.position.x) < 15 &&
              Math.abs(e.position.y - ent1.position.y) < 8,
          )
        ) {
          if (Math.random() < 0.3 && state.params.complexity > 40) {
            // Создаем нового weaver в средней точке между двумя resonants
            const newPosition = {
              x: Math.floor((ent1.position.x + ent2.position.x) / 2),
              y: Math.floor((ent1.position.y + ent2.position.y) / 2),
            }

            addEntity("weaver", newPosition)
            addCodexEntry("Two Resonants harmonized near a Prismatic Drifter to form a Thought Weaver.")

            // Удаляем исходные resonants
            removeEntity(i)
            removeEntity(j - 1) // j-1, потому что i был удален
            return // Выходим, так как индексы теперь недействительны
          }
        }

        // Prismatic + Weaver могут образовать Void Dancer
        if (
          (ent1.type === "prismatic" && ent2.type === "weaver") ||
          (ent1.type === "weaver" && ent2.type === "prismatic")
        ) {
          if (Math.random() < 0.2 && state.params.resonance > 60) {
            // Создаем нового dancer в средней точке
            const newPosition = {
              x: Math.floor((ent1.position.x + ent2.position.x) / 2),
              y: Math.floor((ent1.position.y + ent2.position.y) / 2),
            }

            addEntity("dancer", newPosition)
            addCodexEntry("A Prismatic Drifter and Thought Weaver merged into a Void Dancer.")
            // Не удаляем родительские сущности для этого преобразования
            return
          }
        }
      }
    }
  }
}

// Обработка жизненного цикла сущностей (появление/исчезновение)
function processEntityLifecycle() {
  if (!state) return

  // Периодическое появление новых сущностей
  if (Math.random() < 0.1) {
    const spawnRoll = Math.random() * 100

    if (spawnRoll < state.params.resonance / 2) {
      addEntity("resonant", { x: randomInt(5, 70), y: randomInt(2, 15) })
    } else if (spawnRoll < state.params.resonance / 2 + state.params.complexity / 3) {
      addEntity("prismatic", { x: randomInt(5, 65), y: randomInt(2, 12) })
    }

    // Особое условие для Crystalline Collective
    if (
      state.params.harmony > 80 &&
      state.params.complexity > 70 &&
      state.counts.weaver >= 2 &&
      state.counts.dancer >= 1 &&
      Math.random() < 0.1
    ) {
      addEntity("collective", { x: randomInt(10, 60), y: randomInt(5, 12) })
      addCodexEntry("High harmony and complexity allowed a Crystalline Collective to form!")
    }
  }

  // Исчезновение старых сущностей
  for (let i = state.entities.length - 1; i >= 0; i--) {
    const entity = state.entities[i]

    // Пропускаем хранителя
    if (entity.type === "guardian") continue

    // У каждого типа сущностей разная продолжительность жизни
    let lifespan = 100 // По умолчанию

    switch (entity.type) {
      case "resonant":
        lifespan = 150 + randomInt(0, 50)
        break
      case "prismatic":
        lifespan = 200 + randomInt(0, 100)
        break
      case "weaver":
        lifespan = 120 + randomInt(0, 80)
        break
      case "dancer":
        lifespan = 100 + randomInt(0, 50)
        break
      case "collective":
        lifespan = 250 + randomInt(0, 150)
        break
      default:
        // Для пользовательских типов используем стандартный срок жизни
        lifespan = 150 + randomInt(0, 100)
    }

    // Энтропия сокращает продолжительность жизни
    lifespan -= Math.floor(state.params.entropy / 10)

    // Удаляем, если слишком старая
    if (entity.age > lifespan || Math.random() < 0.001) {
      removeEntity(i)
    }
  }
}

// Эволюция сущностей
function evolveEntities() {
  if (!state || !state.guardian.active) return

  // Хранитель решает: добавить или удалить (25% шанс удалить, если у нас есть сущности, иначе всегда добавлять)
  const shouldRemove = state.entities.length > 5 && Math.random() < 0.25

  if (shouldRemove) {
    // Находим самую старую сущность, не являющуюся хранителем
    const oldestEntityIndex = findOldestEntity()

    if (oldestEntityIndex !== -1) {
      const entityToRemove = state.entities[oldestEntityIndex]
      const entityType = entityToRemove.type

      // Удаляем сущность
      if (removeEntity(oldestEntityIndex)) {
        // Добавляем запись в кодекс
        addCodexEntry(`Guardian autonomously dissolved a ${entityType} entity that had completed its cycle.`)
      }
    }
  } else {
    // Создаем новую сущность
    const entityTypes: EntityType[] = ["resonant", "prismatic", "weaver", "dancer", "collective"]
    const randomType = entityTypes[Math.floor(Math.random() * entityTypes.length)]

    // Создаем сущность
    addEntity(randomType, getSafePosition())

    // Добавляем запись в кодекс
    addCodexEntry(`Guardian autonomously manifested a new ${randomType} entity in response to ecosystem needs.`)
  }
}

// Генерация записи в кодекс
function generateCodexEntry() {
  if (!state) return

  const entries = [
    "Dimensional fluctuations creating ripple patterns in the etheric field.",
    "Resonance harmonics stabilizing across multiple entity types.",
    "Energy pathways forming between distant entities.",
    "Quantum probability fields shifting toward higher complexity.",
    "Crystalline structures forming in the void between dimensions.",
    "Thought patterns evolving toward collective consciousness.",
    "Temporal anomalies detected in entity movement patterns.",
    "Harmonic convergence points multiplying throughout the ecosystem.",
    "Prismatic refraction increasing information density.",
    "Void currents shifting toward new equilibrium states.",
    "Etheric density increasing in regions of high entity concentration.",
    "Dimensional boundaries thinning near Prismatic Drifter pathways.",
    "Resonant field strength fluctuating with harmonic cycles.",
    "Thought Weaver patterns showing signs of emergent intelligence.",
    "Crystalline Collective consciousness expanding into new dimensions.",
  ]

  const randomEntry = entries[Math.floor(Math.random() * entries.length)]
  addCodexEntry(randomEntry)
}

// Сохранение состояния
function saveState() {
  if (!state) return

  self.postMessage({ type: "save", data: { state } })
}

// Вспомогательные функции

// Добавление сущности в экосистему
function addEntity(type: EntityType, position: { x: number; y: number }) {
  if (!state) return

  // Создаем сущность с безопасной позицией
  const newEntity = createEntity(type, position)
  state.entities.push(newEntity)

  // Инициализируем счетчик для нового типа, если его еще нет
  if (!(type in state.counts)) {
    state.counts[type] = 0
  }

  // Обновляем счетчики
  state.counts[type]++

  // Добавляем в кодекс, если это новое открытие
  if (state.counts[type] === 1 && type !== "guardian") {
    addCodexEntry(`Discovered first ${type.charAt(0).toUpperCase() + type.slice(1)} entity at cycle ${state.cycle}.`)
  }
}

// Создание новой сущности
function createEntity(type: EntityType, position: { x: number; y: number }): Entity {
  return {
    type,
    position,
    pattern: [], // Паттерн будет установлен в основном потоке
    frame: 0,
    age: 0,
    direction: { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 },
    speed: type === "prismatic" ? 2 : 1,
  }
}

// Удаление сущности из экосистемы
function removeEntity(index: number): boolean {
  if (!state) return false

  if (index < 0 || index >= state.entities.length) return false

  const entity = state.entities[index]

  // Не удаляем хранителя
  if (entity.type === "guardian") return false

  // Удаляем сущность
  state.entities.splice(index, 1)

  // Обновляем счетчики
  state.counts[entity.type]--

  return true
}

// Поиск самой старой сущности определенного типа
function findOldestEntity(type?: EntityType): number {
  if (!state) return -1

  let oldestEntityIndex = -1
  let maxAge = -1

  state.entities.forEach((entity, index) => {
    if (entity.type !== "guardian" && (type === undefined || entity.type === type) && entity.age > maxAge) {
      maxAge = entity.age
      oldestEntityIndex = index
    }
  })

  return oldestEntityIndex
}

// Получение безопасной позиции для новой сущности
function getSafePosition() {
  return {
    x: randomInt(10, 70),
    y: randomInt(5, 15),
  }
}

// Добавление записи в кодекс
function addCodexEntry(text: string) {
  if (!state) return

  const entry: CodexEntry = {
    cycle: state.cycle,
    text,
  }

  state.codexEntries.push(entry)

  // Ограничиваем размер кодекса
  if (state.codexEntries.length > 100) {
    state.codexEntries.shift()
  }
}

// Вспомогательные функции
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

