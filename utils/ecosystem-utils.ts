// Helper functions for the ecosystem
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Create an empty grid of specified dimensions
export const createEmptyGrid = (width: number, height: number): string[][] => {
  const grid: string[][] = []
  for (let y = 0; y < height; y++) {
    grid.push(new Array(width).fill(" "))
  }
  return grid
}

// Convert grid to string for display
export const gridToString = (grid: string[][]): string => {
  return grid.map((row) => row.join("")).join("\n")
}

