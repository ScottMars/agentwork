import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Beaker, User } from "lucide-react"

type ChatMessageProps = {
  message: {
    role: "user" | "assistant"
    content: string
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  // Hide ecosystem queries from the user interface
  if (isUser && message.content.startsWith("[ECOSYSTEM QUERY]")) {
    return null
  }

  // Hide system messages
  if (message.role === "system") {
    return null
  }

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex gap-3 max-w-[80%]", isUser ? "flex-row-reverse" : "flex-row")}>
        <Avatar className={cn("h-8 w-8 flex items-center justify-center", isUser ? "bg-primary" : "bg-yellow-600")}>
          {isUser ? <User className="h-4 w-4" /> : <Beaker className="h-4 w-4" />}
        </Avatar>
        <Card
          className={cn(
            "p-3",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-yellow-50 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100 font-mono",
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </Card>
      </div>
    </div>
  )
}

