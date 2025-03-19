"use client"

import { useEcosystem } from "@/context/ecosystem-context"
import Link from "next/link"

export default function WikiPage() {
  // Get entity data from context
  const { entities, entityDescriptions, entityProperties, entityDisplayNames } = useEcosystem()

  return (
    <div className="bg-[#111] text-[#c4f5ff] font-mono min-h-screen p-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#7fdbff]">Luminous Ecosystem Wiki</h1>
          <Link
            href="/"
            className="bg-[#1a4e64] text-[#7fdbff] px-3 py-1 rounded border border-[#3a7c8c] hover:bg-[#2a6e84] hover:shadow-[0_0_10px_rgba(127,219,255,0.3)] transition-all"
          >
            Return to Ecosystem
          </Link>
        </div>

        <p className="mb-8 text-[#a0e0ff] italic">
          This codex contains information about the various entities that inhabit the Luminous Ecosystem. Each entity
          has unique properties and behaviors that emerge from the ecosystem parameters.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(entities).map(([entityType, entityData]) => (
            <div
              key={entityType}
              className={`bg-[#0e2b36] border border-[#3a7c8c] p-4 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(127,219,255,0.2)] transition-all`}
            >
              <h2 className={`text-xl font-bold mb-3 ${entityData.className}`}>
                {entityDisplayNames[entityType] || entityType.charAt(0).toUpperCase() + entityType.slice(1)}
              </h2>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="ascii-art font-mono whitespace-pre bg-[#0a1a1f] p-3 rounded text-center min-w-[180px]">
                  {entityData.patterns[0].map((line, i) => (
                    <div key={i} className={entityData.className}>
                      {line}
                    </div>
                  ))}
                </div>

                <div className="flex-1">
                  <p className="text-sm mb-3">{entityDescriptions[entityType] || "No description available."}</p>

                  <div className="text-xs text-[#7fdbff] mt-4">
                    <div>
                      <strong>Properties:</strong>
                    </div>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {entityProperties[entityType]?.map((property, index) => <li key={index}>{property}</li>) || (
                        <li>No properties defined.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

