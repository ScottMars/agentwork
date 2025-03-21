"use client"

import { useRef, useEffect, useState } from "react"
import { useChat } from "ai/react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GuardianMood } from "@/types"

interface ChatInterfaceProps {
  guardianMood: GuardianMood
  onMoodChange?: (mood: GuardianMood) => void
}

export function ChatInterface({ guardianMood, onMoodChange }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat()
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const [moodTransition, setMoodTransition] = useState(false)
  const [messageAnimations, setMessageAnimations] = useState<{ [key: number]: boolean }>({})
  const [buttonAnimation, setButtonAnimation] = useState(false)
  const [inputAnimation, setInputAnimation] = useState(false)
  const [errorAnimation, setErrorAnimation] = useState(false)
  const [loadingAnimation, setLoadingAnimation] = useState(false)
  const [typingAnimation, setTypingAnimation] = useState(false)

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages])

  // Animate new messages
  useEffect(() => {
    const newMessages = messages.slice(1)
    const newAnimations = { ...messageAnimations }
    let hasChanges = false

    newMessages.forEach((_, index) => {
      if (!(index in newAnimations)) {
        newAnimations[index] = false
        hasChanges = true
        setTimeout(() => {
          setMessageAnimations((prev) => ({ ...prev, [index]: true }))
        }, 100)
      }
    })

    if (hasChanges) {
      setMessageAnimations(newAnimations)
    }
  }, [messages])

  // Update guardian mood based on messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant") {
        const content = lastMessage.content.toLowerCase()
        let newMood: GuardianMood | undefined

        if (content.includes("analyzing") || content.includes("analyze")) {
          newMood = "analytical"
        } else if (content.includes("change") || content.includes("transform")) {
          newMood = "catalytic"
        } else if (content.includes("protect") || content.includes("guard")) {
          newMood = "protective"
        } else if (content.includes("reflect") || content.includes("contemplate")) {
          newMood = "contemplative"
        } else if (content.includes("nurture") || content.includes("grow")) {
          newMood = "nurturing"
        }

        if (newMood && newMood !== guardianMood) {
          setMoodTransition(true)
          setTimeout(() => {
            onMoodChange?.(newMood)
            setMoodTransition(false)
          }, 500)
        }
      }
    }
  }, [messages, guardianMood, onMoodChange])

  // Animate button when input changes
  useEffect(() => {
    if (input.trim()) {
      setButtonAnimation(true)
      setTimeout(() => setButtonAnimation(false), 200)
    }
  }, [input])

  // Animate input when focused
  const handleInputFocus = () => {
    setInputAnimation(true)
    setTimeout(() => setInputAnimation(false), 200)
  }

  // Animate error when it appears
  useEffect(() => {
    if (error) {
      setErrorAnimation(true)
      setTimeout(() => setErrorAnimation(false), 500)
    }
  }, [error])

  // Animate loading state
  useEffect(() => {
    if (isLoading) {
      setLoadingAnimation(true)
      setTypingAnimation(true)
    } else {
      setLoadingAnimation(false)
      setTypingAnimation(false)
    }
  }, [isLoading])

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
              className={`mb-2.5 p-2 rounded transition-all duration-500 transform ${
                message.role === "user" ? "bg-[#164e63] self-end ml-5" : "bg-[#0f3a47] self-start mr-5"
              } ${
                messageAnimations[index]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {message.content}
            </div>
          ))}

          {error && (
            <div
              className={`bg-red-500/20 text-red-500 p-2 rounded mb-2.5 text-center text-sm transition-all duration-500 transform ${
                errorAnimation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {error.message}
            </div>
          )}

          <div
            className={`bg-muted/30 p-2 rounded mb-2.5 text-center text-sm italic transition-opacity duration-500 ${
              moodTransition ? "opacity-0" : "opacity-100"
            }`}
          >
            {guardianMood === "analytical" && "The Guardian is analyzing patterns..."}
            {guardianMood === "catalytic" && "The Guardian is facilitating change..."}
            {guardianMood === "protective" && "The Guardian is maintaining balance..."}
            {guardianMood === "contemplative" && "The Guardian is in deep reflection..."}
            {guardianMood === "nurturing" && "The Guardian is fostering growth..."}
          </div>

          {typingAnimation && (
            <div className="bg-[#0f3a47] p-2 rounded mb-2.5 self-start mr-5 w-24">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#7fdbff] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-[#7fdbff] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-[#7fdbff] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
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
            onFocus={handleInputFocus}
            placeholder="Enter your message to the Guardian..."
            className={`flex-grow bg-[#0a1a1f] text-[#c4f5ff] border-[#3a7c8c] font-mono transition-all duration-200 ${
              inputAnimation ? "border-[#7fdbff] shadow-[0_0_10px_rgba(127,219,255,0.3)]" : ""
            }`}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`ml-2.5 bg-[#0e2b36] text-[#7fdbff] border border-[#3a7c8c] hover:bg-[#1a4e64] hover:shadow-[0_0_10px_rgba(127,219,255,0.5)] transition-transform duration-200 ${
              buttonAnimation ? "scale-110" : "scale-100"
            }`}
          >
            {loadingAnimation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
} 