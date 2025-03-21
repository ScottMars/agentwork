"use client"

import { User, Beaker } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: {
    role: "user" | "assistant"
    content: string
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  // Пропускаем системные сообщения и запросы к экосистеме
  if (message.role === "assistant" && message.content.includes("Ecosystem Query:")) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2 p-4 rounded-lg",
        message.role === "user"
          ? "bg-[#164e63] text-[#c4f5ff]"
          : "bg-[#0f3a47] text-[#7fdbff]"
      )}
    >
      <div className="flex-shrink-0">
        {message.role === "user" ? (
          <User className="h-5 w-5" />
        ) : (
          <Beaker className="h-5 w-5" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
} 