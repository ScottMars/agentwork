"use client"

import { useCallback } from "react"
import type { EcosystemState, CodexEntry } from "@/types/ecosystem"

export function useCodex(state: EcosystemState) {
  // Add entry to codex
  const addCodexEntry = useCallback(
    (text: string) => {
      state.codexEntries.push({
        cycle: state.cycle,
        text,
      })
    },
    [state],
  )

  // Check if two entries are similar
  const areEntriesSimilar = useCallback((entry1: CodexEntry, entry2: CodexEntry): boolean => {
    // If the text is identical, it's a duplicate
    if (entry1.text === entry2.text) return true

    // If more than 70% of words match, consider it too similar
    const words1 = new Set(entry1.text.toLowerCase().split(" "))
    const words2 = new Set(entry2.text.toLowerCase().split(" "))

    // Count matching words
    let matchCount = 0
    words1.forEach((word) => {
      if (words2.has(word)) matchCount++
    })

    const similarity = matchCount / Math.max(words1.size, words2.size)
    return similarity > 0.7
  }, [])

  // Filter out similar entries
  const getFilteredEntries = useCallback(
    (maxEntries = 20) => {
      if (!state.codexEntries.length) return []

      // Start with the most recent entry
      const filtered: CodexEntry[] = [state.codexEntries[state.codexEntries.length - 1]]

      // Go through entries from newest to oldest
      for (let i = state.codexEntries.length - 2; i >= 0 && filtered.length < maxEntries; i--) {
        const currentEntry = state.codexEntries[i]

        // Check if this entry is too similar to any of the last 3 filtered entries
        const isDuplicate = filtered.slice(0, 3).some((entry) => areEntriesSimilar(entry, currentEntry))

        // Only add if not a duplicate
        if (!isDuplicate) {
          filtered.push(currentEntry)
        }
      }

      return filtered
    },
    [state.codexEntries, areEntriesSimilar],
  )

  return {
    addCodexEntry,
    areEntriesSimilar,
    getFilteredEntries,
  }
}

