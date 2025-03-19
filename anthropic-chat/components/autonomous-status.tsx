"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { useEcosystem } from "@/context/ecosystem-context"

export function AutonomousStatus() {
  const { isAutonomousModeActive, lastAutonomousUpdate, startAutonomousMode, stopAutonomousMode } = useEcosystem()

  const [timeAgo, setTimeAgo] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Обновляем время с момента последнего обновления
  useEffect(() => {
    if (lastAutonomousUpdate > 0) {
      const updateTimeAgo = () => {
        setTimeAgo(formatDistanceToNow(lastAutonomousUpdate, { addSuffix: true }))
      }

      updateTimeAgo()

      // Обновляем каждую минуту
      const interval = setInterval(updateTimeAgo, 60000)

      return () => clearInterval(interval)
    }
  }, [lastAutonomousUpdate])

  // Автоматически запускаем автономный режим при монтировании компонента
  useEffect(() => {
    // Автоматически запускаем автономный режим при монтировании компонента
    if (!isAutonomousModeActive) {
      startAutonomousMode()
    }
  }, [isAutonomousModeActive, startAutonomousMode])

  return (
    <div className="border border-[#3a7c8c] p-2.5 mb-5 rounded bg-[#0e2b36] w-full">
      <h3 className="text-lg font-bold mb-2">Autonomous Operation</h3>

      <div className="flex items-center">
        <div
          className={`w-2 h-2 rounded-full mr-2 ${isAutonomousModeActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
        ></div>
        <span>Status: {isAutonomousModeActive ? "Active" : "Initializing..."}</span>
      </div>

      {lastAutonomousUpdate > 0 && <div className="text-sm text-[#7fdbff] mt-1">Last update: {timeAgo}</div>}

      <div className="text-xs italic mt-2">The ecosystem continues to evolve even when you're not viewing it</div>
    </div>
  )
}

