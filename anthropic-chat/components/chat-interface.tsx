"use client"

import { useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { GuardianMood } from "@/constants/ecosystem"

interface ChatInterfaceProps {
  guardianMood: GuardianMood
}

export function ChatInterface({ guardianMood }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="w-full mt-5">
      <div className="bg-[#0e2b36] border border-[#3a7c8c] rounded flex flex-col">
        <div ref={chatMessagesRef} className="p-2.5 overflow-y-auto h-[350px] flex flex-col">
          <div className="text-[#7fdbff] italic text-center p-1.5 mb-2.5">
            The Etheric Guardian has entered the simulation. You may communicate with it through this interface.
          </div>

          <div className="bg-[#0f3a47] p-2 rounded mb-2.5 self-start mr-5">
            <p>
              I am the Etheric Guardian of this luminous realm. I observe the patterns and flows of consciousness here.
              How do you wish to interact with this ecosystem, traveler?
            </p>
          </div>

          {messages.slice(1).map((message, index) => (
            <div
              key={index}
              className={`mb-2.5 p-2 rounded ${
                message.role === "user" ? "bg-[#164e63] self-end ml-5" : "bg-[#0f3a47] self-start mr-5"
              }`}
            >
              {message.content}
            </div>
          ))}

          <div className="bg-muted/30 p-2 rounded mb-2.5 text-center text-sm italic">
            {guardianMood === "analytical" && "The Guardian is analyzing patterns..."}
            {guardianMood === "catalytic" && "The Guardian is facilitating change..."}
            {guardianMood === "protective" && "The Guardian is maintaining balance..."}
            {guardianMood === "contemplative" && "The Guardian is in deep reflection..."}
            {guardianMood === "nurturing" && "The Guardian is fostering growth..."}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(e)
          }}
          className="flex p-2.5 border-t border-[#3a7c8c]"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Enter your message to the Guardian..."
            className="flex-grow bg-[#0a1a1f] text-[#c4f5ff] border-[#3a7c8c] font-mono"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="ml-2.5 bg-[#0e2b36] text-[#7fdbff] border border-[#3a7c8c] hover:bg-[#1a4e64] hover:shadow-[0_0_10px_rgba(127,219,255,0.5)]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

