"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEcosystem } from "@/context/ecosystem-context"
import { useAgentInteraction } from "@/hooks/use-agent-interaction"
import entityService from "@/services/entity-service"

export default function AdminPage() {
  const router = useRouter()
  const {
    entities,
    entityDescriptions,
    entityProperties,
    entityDisplayNames,
    entityColorClasses,
    updateEntity,
    addEntity,
    reloadData
  } = useEcosystem()

  const { isGenerating, generationError, debugInfo, requestForcedEntityGeneration } = useAgentInteraction()

  const [mode, setMode] = useState<"add" | "edit">("add")
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    entityName: "",
    entityType: "",
    description: "",
    asciiArt: "",
    properties: ["", "", ""],
    colorClass: "text-[#7fdbff]", // Default color
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [generationError2, setGenerationError2] = useState<string | null>(null)
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  // Available color classes for entities
  const colorOptions = [
    { name: "Cyan (Resonant)", value: "text-[#7fdbff]" },
    { name: "Magenta (Prismatic)", value: "text-[#ff7fdb]" },
    { name: "Yellow-Green (Weaver)", value: "text-[#dbff7f]" },
    { name: "Purple (Dancer)", value: "text-[#db7fff]" },
    { name: "White (Collective)", value: "text-[#ffffff]" },
    { name: "Gold (Guardian)", value: "text-[#ffcc00]" },
    { name: "Orange (Custom)", value: "text-[#ffa500]" },
    { name: "Green (Custom)", value: "text-[#00ff7f]" },
  ]

  // Load entity data when selected entity changes
  useEffect(() => {
    if (selectedEntity && mode === "edit") {
      // Convert ASCII art pattern to string
      const asciiArtString = entities[selectedEntity]?.patterns[0]?.join("\n") || ""

      setFormData({
        entityName: entityDisplayNames[selectedEntity] || "",
        entityType: selectedEntity,
        description: entityDescriptions[selectedEntity] || "",
        asciiArt: asciiArtString,
        properties: entityProperties[selectedEntity] || ["", "", ""],
        colorClass: entityColorClasses[selectedEntity] || "text-[#7fdbff]",
      })
    }
  }, [selectedEntity, mode, entities, entityDescriptions, entityProperties, entityDisplayNames, entityColorClasses])

  // Reset form when switching modes
  useEffect(() => {
    if (mode === "add") {
      setFormData({
        entityName: "",
        entityType: "",
        description: "",
        asciiArt: "",
        properties: ["", "", ""],
        colorClass: "text-[#7fdbff]",
      })
      setSelectedEntity(null)
    }
  }, [mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePropertyChange = (index: number, value: string) => {
    const updatedProperties = [...formData.properties]
    updatedProperties[index] = value
    setFormData((prev) => ({
      ...prev,
      properties: updatedProperties,
    }))
  }

  const handleEntitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEntity(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")

    try {
      // Parse ASCII art into pattern array
      const patternArray = formData.asciiArt.split("\n").map((line) => line || " ")

      if (mode === "add") {
        // Add new entity
        addEntity(formData.entityType, {
          patterns: [patternArray],
          className: formData.colorClass,
          displayName: formData.entityName,
          description: formData.description,
          properties: formData.properties,
        })

        // Save directly to Supabase
        try {
          // Get current data
          const updatedEntities = {
            ...entities,
            [formData.entityType]: {
              patterns: [patternArray],
              className: formData.colorClass,
            },
          }
          
          const updatedDisplayNames = {
            ...entityDisplayNames,
            [formData.entityType]: formData.entityName,
          }
          
          const updatedDescriptions = {
            ...entityDescriptions,
            [formData.entityType]: formData.description,
          }
          
          const updatedProperties = {
            ...entityProperties,
            [formData.entityType]: formData.properties,
          }
          
          const updatedColorClasses = {
            ...entityColorClasses,
            [formData.entityType]: formData.colorClass,
          }
          
          // Save all data to Supabase
          await entityService.saveAllEntityData(
            updatedEntities,
            updatedDescriptions,
            updatedProperties,
            updatedDisplayNames,
            updatedColorClasses
          )
          
          console.log("Entity data saved to Supabase")
        } catch (error) {
          console.error("Error saving entity to Supabase:", error)
        }

        setMessage("Entity successfully added to the Wiki!")
      } else if (mode === "edit" && selectedEntity) {
        // Update existing entity
        updateEntity(selectedEntity, {
          patterns: [patternArray],
          className: formData.colorClass,
          displayName: formData.entityName,
          description: formData.description,
          properties: formData.properties,
        })

        // Save directly to Supabase
        try {
          // Get current data
          const updatedEntities = {
            ...entities,
            [selectedEntity]: {
              ...entities[selectedEntity],
              patterns: [patternArray],
              className: formData.colorClass,
            },
          }
          
          const updatedDisplayNames = {
            ...entityDisplayNames,
            [selectedEntity]: formData.entityName,
          }
          
          const updatedDescriptions = {
            ...entityDescriptions,
            [selectedEntity]: formData.description,
          }
          
          const updatedProperties = {
            ...entityProperties,
            [selectedEntity]: formData.properties,
          }
          
          const updatedColorClasses = {
            ...entityColorClasses,
            [selectedEntity]: formData.colorClass,
          }
          
          // Save all data to Supabase
          await entityService.saveAllEntityData(
            updatedEntities,
            updatedDescriptions,
            updatedProperties,
            updatedDisplayNames,
            updatedColorClasses
          )
          
          console.log("Updated entity data saved to Supabase")
        } catch (error) {
          console.error("Error saving updated entity to Supabase:", error)
        }

        setMessage("Entity successfully updated!")
      }

      // Show success message
      setShowSuccessMessage(true)

      // Reset form after successful submission
      if (mode === "add") {
        setFormData({
          entityName: "",
          entityType: "",
          description: "",
          asciiArt: "",
          properties: ["", "", ""],
          colorClass: "text-[#7fdbff]",
        })
      }

      // Reload data from Supabase
      await reloadData()

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    } catch (error) {
      setMessage(`Error ${mode === "add" ? "adding" : "updating"} entity. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler for force creating a new entity
  const handleForceCreateEntity = () => {
    setGenerationStatus("loading")
    setGenerationError2(null)
    setShowDebugInfo(true)

    requestForcedEntityGeneration(
      // Success handler
      async (entityData) => {
        try {
          // Convert ASCII art to array of strings
          const pattern = entityData.asciiArt.split("\n").map((line: string) => line || " ")

          // Generate random color if not specified
          const colorClasses = [
            "text-[#7fdbff]",
            "text-[#ff7fdb]",
            "text-[#dbff7f]",
            "text-[#db7fff]",
            "text-[#ffffff]",
          ]
          const colorClass = entityData.colorClass || colorClasses[Math.floor(Math.random() * colorClasses.length)]
          
          const entityType = entityData.entityType.toLowerCase()
          const properties = entityData.properties || [
            "Generated entity",
            "Unique properties",
            "Special attributes",
          ]

          // Add entity to context
          addEntity(entityType, {
            patterns: [pattern],
            className: colorClass,
            displayName: entityData.displayName,
            description: entityData.description,
            properties: properties,
          })
          
          // Save directly to Supabase
          try {
            // Get current data
            const updatedEntities = {
              ...entities,
              [entityType]: {
                patterns: [pattern],
                className: colorClass,
              },
            }
            
            const updatedDisplayNames = {
              ...entityDisplayNames,
              [entityType]: entityData.displayName,
            }
            
            const updatedDescriptions = {
              ...entityDescriptions,
              [entityType]: entityData.description,
            }
            
            const updatedProperties = {
              ...entityProperties,
              [entityType]: properties,
            }
            
            const updatedColorClasses = {
              ...entityColorClasses,
              [entityType]: colorClass,
            }
            
            // Save all data to Supabase
            await entityService.saveAllEntityData(
              updatedEntities,
              updatedDescriptions,
              updatedProperties,
              updatedDisplayNames,
              updatedColorClasses
            )
            
            console.log("Generated entity data saved to Supabase")

            // Reload data from Supabase
            await reloadData()
          } catch (error) {
            console.error("Error saving generated entity to Supabase:", error)
          }

          // Update status and show success message
          setGenerationStatus("success")
          setMessage(`New entity "${entityData.displayName}" successfully created!`)
          setShowSuccessMessage(true)

          // Hide success message after 3 seconds
          setTimeout(() => {
            setShowSuccessMessage(false)
            setGenerationStatus("idle")
          }, 3000)
        } catch (error) {
          setGenerationStatus("error")
          setGenerationError2(
            `Error processing entity data: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      },
      // Error handler
      (error) => {
        setGenerationStatus("error")
        setGenerationError2(error)
      },
    )
  }

  // Handler for creating a simple entity
  const handleCreateSimpleEntity = async () => {
    try {
      // Create simple entity with predefined data
      const entityType = "nexus"
      const displayName = "Nexus Point"
      const description =
        "A convergence point of dimensional energies that serves as a bridge between different planes of existence."
      const properties = ["Energy conduit", "Dimensional anchor", "Resonance amplifier"]
      const asciiArt = "  *  \n /|\\ \n/ | \\\n  |  \n / \\ \n/   \\"

      // Convert ASCII art to array of strings
      const pattern = asciiArt.split("\n").map((line) => line || " ")

      // Add entity to context
      addEntity(entityType, {
        patterns: [pattern],
        className: "text-[#ffa500]", // Orange color
        displayName,
        description,
        properties,
      })
      
      // Save directly to Supabase
      try {
        // Get current data
        const updatedEntities = {
          ...entities,
          [entityType]: {
            patterns: [pattern],
            className: "text-[#ffa500]",
          },
        }
        
        const updatedDisplayNames = {
          ...entityDisplayNames,
          [entityType]: displayName,
        }
        
        const updatedDescriptions = {
          ...entityDescriptions,
          [entityType]: description,
        }
        
        const updatedProperties = {
          ...entityProperties,
          [entityType]: properties,
        }
        
        const updatedColorClasses = {
          ...entityColorClasses,
          [entityType]: "text-[#ffa500]",
        }
        
        // Save all data to Supabase
        await entityService.saveAllEntityData(
          updatedEntities,
          updatedDescriptions,
          updatedProperties,
          updatedDisplayNames,
          updatedColorClasses
        )
        
        console.log("Simple entity data saved to Supabase")

        // Reload data from Supabase
        await reloadData()
      } catch (error) {
        console.error("Error saving simple entity to Supabase:", error)
      }

      // Show success message
      setMessage(`Simple entity "${displayName}" successfully created!`)
      setShowSuccessMessage(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    } catch (error) {
      setMessage(`Error creating simple entity: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="bg-[#111] text-[#c4f5ff] font-mono min-h-screen p-5">
      <div className="max-w-[800px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#7fdbff]">Admin Control Panel</h1>
          <div className="flex gap-2">
            <Link
              href="/wiki"
              className="bg-[#1a4e64] text-[#7fdbff] px-3 py-1 rounded border border-[#3a7c8c] hover:bg-[#2a6e84] hover:shadow-[0_0_10px_rgba(127,219,255,0.3)] transition-all"
            >
              View Wiki
            </Link>
            <Link
              href="/"
              className="bg-[#1a4e64] text-[#7fdbff] px-3 py-1 rounded border border-[#3a7c8c] hover:bg-[#2a6e84] hover:shadow-[0_0_10px_rgba(127,219,255,0.3)] transition-all"
            >
              View Ecosystem
            </Link>
          </div>
        </div>

        {/* Success notification */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 bg-[#1c3a1c] text-[#7fff7f] p-4 rounded shadow-lg z-50 animate-fadeIn">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>{message}</span>
            </div>
            <p className="text-xs mt-1">Changes are now live across the ecosystem.</p>
          </div>
        )}

        {/* Create entity buttons */}
        <div className="mb-6 bg-[#0e2b36] border border-[#3a7c8c] p-4 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.3)]">
          <h2 className="text-xl font-bold mb-4">Administrative Actions</h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#7fdbff]">Create New Entity</h3>
              <p className="text-sm opacity-80 mb-2">
                Create a new entity type for the ecosystem.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleForceCreateEntity}
                disabled={generationStatus === "loading" || isGenerating}
                className="bg-[#2a1a4e] text-[#db7fff] px-4 py-2 rounded border border-[#7c3a8c] hover:bg-[#3a2a5e] hover:shadow-[0_0_10px_rgba(219,127,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generationStatus === "loading" ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#db7fff]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Generate New Entity"
                )}
              </button>

              <button
                onClick={handleCreateSimpleEntity}
                className="bg-[#1a4e64] text-[#7fdbff] px-4 py-2 rounded border border-[#3a7c8c] hover:bg-[#2a6e84] hover:shadow-[0_0_10px_rgba(127,219,255,0.3)] transition-all"
              >
                Create Simple Entity
              </button>
            </div>
          </div>

          {/* Generation error message */}
          {generationStatus === "error" && generationError2 && (
            <div className="mt-2 p-2 bg-[#3a1c1c] text-[#ff7f7f] rounded text-sm">Error: {generationError2}</div>
          )}

          {/* Debug info */}
          {showDebugInfo && debugInfo && (
            <div className="mt-2 p-2 bg-[#0a1a1f] text-[#7fdbff] rounded text-xs font-mono whitespace-pre-wrap">
              <div className="flex justify-between items-center mb-1">
                <strong>Debug Info:</strong>
                <button onClick={() => setShowDebugInfo(false)} className="text-[#ff7f7f] hover:text-[#ff9f9f] text-xs">
                  [Hide]
                </button>
              </div>
              {debugInfo}
              <div className="mt-2">
                <strong>Generation Status:</strong> {generationStatus}
                <br />
                <strong>Is Generating:</strong> {isGenerating ? "Yes" : "No"}
              </div>
            </div>
          )}
        </div>

        {/* Mode selection tabs */}
        <div className="flex mb-6 border-b border-[#3a7c8c]">
          <button
            className={`px-4 py-2 ${mode === "add" ? "bg-[#1a4e64] text-[#7fdbff] border-t border-l border-r border-[#3a7c8c]" : "text-[#7fdbff]/70 hover:bg-[#1a4e64]/30"}`}
            onClick={() => setMode("add")}
          >
            Add New Entity
          </button>
          <button
            className={`px-4 py-2 ${mode === "edit" ? "bg-[#1a4e64] text-[#7fdbff] border-t border-l border-r border-[#3a7c8c]" : "text-[#7fdbff]/70 hover:bg-[#1a4e64]/30"}`}
            onClick={() => setMode("edit")}
          >
            Edit Existing Entity
          </button>
        </div>

        <div className="bg-[#0e2b36] border border-[#3a7c8c] p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.3)]">
          <h2 className="text-xl font-bold mb-4">
            {mode === "add" ? "Add New Entity to Wiki" : "Edit Existing Entity"}
          </h2>

          {message && !showSuccessMessage && (
            <div
              className={`p-3 mb-4 rounded ${message.includes("Error") ? "bg-[#3a1c1c] text-[#ff7f7f]" : "bg-[#1c3a1c] text-[#7fff7f]"}`}
            >
              {message}
            </div>
          )}

          {/* Entity selection dropdown (only in edit mode) */}
          {mode === "edit" && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Select Entity to Edit</label>
              <select
                value={selectedEntity || ""}
                onChange={handleEntitySelect}
                className="w-full bg-[#0a1a1f] border border-[#3a7c8c] rounded p-2 text-[#c4f5ff]"
              >
                <option value="">-- Select an entity --</option>
                {Object.keys(entities).map((entityKey) => (
                  <option key={entityKey} value={entityKey}>
                    {entityDisplayNames[entityKey] || entityKey}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Entity form */}
          {(mode === "add" || (mode === "edit" && selectedEntity)) && (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Entity Name</label>
                  <input
                    type="text"
                    name="entityName"
                    value={formData.entityName}
                    onChange={handleInputChange}
                    className="w-full bg-[#0a1a1f] border border-[#3a7c8c] rounded p-2 text-[#c4f5ff]"
                    placeholder="e.g. Quantum Oscillator"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Entity Type</label>
                  <input
                    type="text"
                    name="entityType"
                    value={formData.entityType}
                    onChange={handleInputChange}
                    className="w-full bg-[#0a1a1f] border border-[#3a7c8c] rounded p-2 text-[#c4f5ff]"
                    placeholder="e.g. oscillator"
                    required
                    disabled={mode === "edit"} // Can't change entity type in edit mode
                  />
                  {mode === "edit" && (
                    <p className="text-xs mt-1 text-[#7fdbff]/70">Entity type cannot be changed in edit mode</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Entity Color</label>
                <select
                  name="colorClass"
                  value={formData.colorClass}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a1a1f] border border-[#3a7c8c] rounded p-2 text-[#c4f5ff]"
                >
                  {colorOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a1a1f] border border-[#3a7c8c] rounded p-2 text-[#c4f5ff] min-h-[100px]"
                  placeholder="Describe the entity's role in the ecosystem..."
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">ASCII Art Pattern</label>
                <textarea
                  name="asciiArt"
                  value={formData.asciiArt}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a1a1f] border border-[#3a7c8c] rounded p-2 text-[#c4f5ff] font-mono min-h-[150px]"
                  placeholder="Enter ASCII art pattern here..."
                  required
                />
                <p className="text-xs mt-1 text-[#7fdbff]">
                  Use spaces, slashes, dots, and other ASCII characters to create your entity pattern.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Properties (3)</label>
                {formData.properties.map((property, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      value={property}
                      onChange={(e) => handlePropertyChange(index, e.target.value)}
                      className="w-full bg-[#0a1a1f] border border-[#3a7c8c] rounded p-2 text-[#c4f5ff]"
                      placeholder={`Property ${index + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1a4e64] text-[#7fdbff] px-4 py-2 rounded border border-[#3a7c8c] hover:bg-[#2a6e84] hover:shadow-[0_0_10px_rgba(127,219,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : mode === "add" ? "Add Entity to Wiki" : "Update Entity"}
                </button>

                <button
                  type="button"
                  onClick={() => (mode === "add" ? router.push("/wiki") : setMode("add"))}
                  className="bg-[#3a1c1c] text-[#ff7f7f] px-4 py-2 rounded border border-[#7c3a3a] hover:bg-[#4a2c2c] transition-all"
                >
                  {mode === "add" ? "Cancel" : "Discard Changes"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Preview section */}
        {(mode === "add" || (mode === "edit" && selectedEntity)) && (
          <div className="mt-6 p-4 bg-[#0a1a1f] border border-[#3a7c8c] rounded">
            <h3 className="text-lg font-bold mb-2">ASCII Art Preview</h3>
            <div className="bg-[#061215] p-3 rounded whitespace-pre font-mono">
              <div className={formData.colorClass}>{formData.asciiArt || "Your ASCII art will appear here..."}</div>
            </div>
            <p className="text-xs mt-2 italic">This is how your entity will appear in the Wiki.</p>
          </div>
        )}
      </div>
    </div>
  )
}