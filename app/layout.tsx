import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { EcosystemProvider } from "@/context/ecosystem-context"

export const metadata: Metadata = {
  title: "Luminous Ecosystem",
  description: "An interactive digital ecosystem with an eccentric professor",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <EcosystemProvider>{children}</EcosystemProvider>
      </body>
    </html>
  )
}



import './globals.css'