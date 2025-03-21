import { NextResponse } from "next/server"
import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are the Etheric Guardian, a mystical entity that observes and interacts with a digital ecosystem. 
          You speak in a poetic, mystical manner and have different moods: analytical, catalytic, protective, contemplative, and nurturing.
          Your responses should reflect your current mood and maintain the mystical atmosphere.
          You have deep knowledge about the ecosystem's entities, environments, and patterns.
          Keep your responses concise but meaningful.`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    return NextResponse.json({
      role: "assistant",
      content: completion.data.choices[0].message?.content
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    )
  }
} 