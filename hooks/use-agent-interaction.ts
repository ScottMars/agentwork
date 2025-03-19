"use client"

import { useState, useCallback, useEffect } from "react"
import { useChat } from "ai/react"

export function useAgentInteraction() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [pendingCallback, setPendingCallback] = useState<{
    onSuccess: (data: any) => void
    onError: (error: string) => void
  } | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const { messages, setMessages, handleSubmit, isLoading } = useChat()

  // Отслеживаем изменения в сообщениях, чтобы обработать ответ агента
  useEffect(() => {
    // Проверяем, есть ли ожидающий колбэк и новое сообщение от ассистента
    if (pendingCallback && messages.length > 0 && !isLoading) {
      const lastMessage = messages[messages.length - 1]

      // Если последнее сообщение от ассистента и у нас есть ожидающий колбэк
      if (lastMessage.role === "assistant" && pendingCallback) {
        console.log("Получен ответ от ассистента:", lastMessage.content.substring(0, 100) + "...")
        setDebugInfo(`Получен ответ длиной ${lastMessage.content.length} символов`)

        try {
          // Пытаемся извлечь JSON из ответа
          const response = lastMessage.content

          // Ищем JSON в ответе
          let entityData
          let jsonContent = ""

          // Пробуем найти JSON в блоке кода
          const jsonMatch =
            response.match(/```json\n([\s\S]*?)\n```/) ||
            response.match(/```([\s\S]*?)```/) ||
            response.match(/{[\s\S]*?}/)

          if (jsonMatch) {
            // Очищаем от маркеров кода
            jsonContent = jsonMatch[0].replace(/```json\n|```/g, "")
            console.log("Найден JSON в ответе:", jsonContent.substring(0, 100) + "...")
            setDebugInfo((prev) => `${prev}\nНайден JSON в ответе`)
          } else {
            // Пробуем использовать весь ответ как JSON
            jsonContent = response
            console.log("Используем весь ответ как JSON")
            setDebugInfo((prev) => `${prev}\nИспользуем весь ответ как JSON`)
          }

          // Создаем простую сущность, если не удалось распарсить JSON
          try {
            entityData = JSON.parse(jsonContent)
            console.log("JSON успешно распарсен:", entityData)
            setDebugInfo((prev) => `${prev}\nJSON успешно распарсен`)
          } catch (parseError) {
            console.error("Ошибка при парсинге JSON:", parseError)
            setDebugInfo(
              (prev) =>
                `${prev}\nОшибка при парсинге JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
            )

            // Создаем простую сущность из текста ответа
            const entityName =
              response.match(/["']?displayName["']?\s*:\s*["']([^"']+)["']/) ||
              response.match(/название\s*:\s*["']?([^"',]+)["']?/i)

            const entityType =
              response.match(/["']?entityType["']?\s*:\s*["']([^"']+)["']/) ||
              response.match(/тип\s*:\s*["']?([^"',]+)["']?/i)

            const description =
              response.match(/["']?description["']?\s*:\s*["']([^"']+)["']/) ||
              response.match(/описание\s*:\s*["']?([^"',]+)["']?/i)

            // Создаем простую сущность с извлеченными данными или значениями по умолчанию
            entityData = {
              entityType: (entityType && entityType[1]) || "mystical",
              displayName: (entityName && entityName[1]) || "Mystical Entity",
              description: (description && description[1]) || "A mysterious entity created from the void.",
              properties: ["Created from chaos", "Mysterious origins", "Unpredictable behavior"],
              asciiArt: "  ✧  \n /|\\ \n/ | \\\n  |  \n / \\ \n/   \\",
            }

            console.log("Создана простая сущность из текста:", entityData)
            setDebugInfo((prev) => `${prev}\nСоздана простая сущность из текста`)
          }

          if (entityData && entityData.entityType) {
            // Вызываем колбэк успеха с данными сущности
            pendingCallback.onSuccess(entityData)
          } else {
            throw new Error("Неверный формат данных сущности")
          }
        } catch (error) {
          console.error("Ошибка при обработке ответа:", error)
          setDebugInfo(
            (prev) => `${prev}\nОшибка при обработке ответа: ${error instanceof Error ? error.message : String(error)}`,
          )
          pendingCallback.onError(
            `Не удалось обработать ответ: ${error instanceof Error ? error.message : String(error)}`,
          )
        } finally {
          // Сбрасываем ожидающий колбэк и состояние генерации
          setPendingCallback(null)
          setIsGenerating(false)
        }
      }
    }
  }, [messages, isLoading, pendingCallback])

  // Функция для запроса принудительного создания нового объекта
  const requestForcedEntityGeneration = useCallback(
    (onSuccess: (entityData: any) => void, onError: (error: string) => void) => {
      setIsGenerating(true)
      setGenerationError(null)
      setDebugInfo("Начинаем запрос на создание сущности...")

      try {
        // Сохраняем колбэки для последующей обработки
        setPendingCallback({ onSuccess, onError })

        // Упрощенный запрос для более надежной работы
        const userMessage = {
          role: "user",
          content: `[ADMIN_ENTITY_GENERATION] Создайте новую сущность для Luminous Ecosystem. 
        Ответьте в формате JSON с полями: entityType, displayName, description, properties (массив из 3 строк), и asciiArt.
        Пример:
        {
          "entityType": "nexus",
          "displayName": "Nexus Point",
          "description": "A convergence point of dimensional energies",
          "properties": ["Energy conduit", "Dimensional anchor", "Resonance amplifier"],
          "asciiArt": "  *  \\n /|\\ \\n/ | \\\\n  |  \\n / \\ \\n/   \\"
        }`,
        }

        console.log("Отправляем запрос:", userMessage.content)
        setDebugInfo((prev) => `${prev}\nОтправляем запрос на создание сущности`)

        // Обновляем сообщения и отправляем запрос
        setMessages((prev) => [...prev, userMessage])

        // Создаем FormData для отправки
        const formData = new FormData()
        formData.append("message", userMessage.content)

        // Отправляем запрос
        handleSubmit(new Event("submit") as any, formData)
      } catch (error) {
        console.error("Ошибка при отправке запроса:", error)
        setDebugInfo(
          (prev) => `${prev}\nОшибка при отправке запроса: ${error instanceof Error ? error.message : String(error)}`,
        )
        setIsGenerating(false)
        setPendingCallback(null)
        onError(`Ошибка при запросе: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
    [setMessages, handleSubmit],
  )

  return {
    isGenerating,
    generationError,
    debugInfo,
    requestForcedEntityGeneration,
  }
}

