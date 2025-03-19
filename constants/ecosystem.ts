// Entity definitions
export const entities = {
  resonant: {
    patterns: [
      [" · ", " / \\ ", " / \\ ", " · · "],
      [" * ", " / \\ ", " / \\ ", " · · "],
    ],
    className: "entity-resonant",
  },
  prismatic: {
    patterns: [
      [" ✧ ", " /|\\ ", " / | \\ ", " / | \\ ", " · | · ", " / | \\ ", " · | · "],
      [" * ", " /|\\ ", " / | \\ ", " / | \\ ", " · | · ", " / | \\ ", " · | · "],
    ],
    className: "entity-prismatic",
  },
  weaver: {
    patterns: [
      [
        " .·····. ",
        " / \\ ",
        " / · · \\ ",
        " | \\ / | ",
        " | \\ / | ",
        " | · | ",
        " \\ ··· / ",
        " \\ · · / ",
        " `·····´ ",
      ],
    ],
    className: "entity-weaver",
  },
  dancer: {
    patterns: [
      [" ✧ · ✧ ", " \\|/ ", " --*-- ", " /|\\ ", " ✧ · ✧ "],
      [" ", " · ", " ", " · ", " "],
      [" · ✧ · ", " /|\\ ", " --*-- ", " \\|/ ", " · ✧ · "],
    ],
    className: "entity-dancer",
  },
  collective: {
    patterns: [[" .·'·. ", " .' '. ", " / ✧ \\ ", " | ✧ ✧ | ", " | | ", " | ✧ ✧ | ", " \\ ✧ / ", " '. .' ", " `·.·´ "]],
    className: "entity-collective",
  },
  guardian: {
    patterns: [
      [
        " ✷✷✷ ",
        " ✷ ✷ ",
        " ✷ ✷ ",
        " ✷ ✷ ",
        " ✷ ✶ ✷ ",
        " ✷ ✶ ✶ ✷ ",
        " ✷ ✶ ✶ ✷ ",
        "✷✷✷✷✷✷✷✷✷✷✷✷✷✷✷✷✷",
        " \\ | / ",
        " \\ | / ",
        " \\ | / ",
        " \\ | / ",
        " \\ | / ",
        " \\ | / ",
        " \\|/ ",
        " ✶ ",
      ],
      [
        " ✷✷✷ ",
        " ✷ ✷ ",
        " ✷ ✷ ",
        " ✷ ✷ ",
        " ✷ ✶ ✷ ",
        " ✷ ✶ ✶ ✷ ",
        " ✷ ✶ ✶ ✷ ",
        "✷✷✷✷✷✷✷✷✷✷✷✷✷✷✷✷✷",
        " / | \\ ",
        "/ | \\",
        "\\ | /",
        " \\ | / ",
        " \\ | / ",
        " \\ | / ",
        " \\ | / ",
        " ✶ ",
      ],
    ],
    className: "entity-guardian",
  },
}

// Environment patterns
export const environments = {
  tranquil: [
    "~~~~~~~~~~~~~~~~~~~~~~~",
    "~ ~ ~ ~ ~ ~",
    " ~ ~ ~ ~ ~",
    "~ ~ ~ ~ ~ ",
    " ~ ~ ~ ~ ~ ",
    "~ ~ ~ ~ ~",
    "~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  harmonic: [
    "≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈",
    "≈ ≈ ≈ ~ ~ ~ ≈ ≈ ≈ ≈ ≈ ≈",
    "≈ ≈ ~ ~ ~ ~ ~ ≈ ≈ ≈ ≈ ≈",
    "≈ ~ ~ ~ ~ ~ ~ ~ ≈ ≈ ≈ ≈",
    "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ≈ ≈",
    "≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈",
  ],
  prismatic: [
    "*//*//*//*//*//*//*//*//",
    "//*//*//*//*//*//*//*//*/",
    "*//*//*//*//*//*//*//*//",
    "//*//*//*//*//*//*//*//*/",
    "*//*//*//*//*//*//*//*//",
    "//*//*//*//*//*//*//*//*/",
  ],
  quantum: [
    "◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊",
    "◊ ◊ ◊ ◊ ◊ ◊ ◊ ◊ ◊ ◊ ◊ ◊",
    "◊ ◊ ◊ ◊ ◊ ◊ ◊ ◊ ",
    " ◊ ◊ ◊ ◊ ◊ ◊ ◊ ◊ ",
    " ◊ ◊ ◊ ◊ ◊ ◊ ◊ ◊",
    "◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊◊",
  ],
}

// Guardian personality traits
export const guardianTraits = {
  moods: ["analytical", "catalytic", "protective", "contemplative", "nurturing"],
  focuses: [
    "entity harmony",
    "dimensional stability",
    "energy patterns",
    "emergent consciousness",
    "resonance flows",
    "evolutionary pathways",
  ],
}

export type EntityType = "resonant" | "prismatic" | "weaver" | "dancer" | "collective" | "guardian"
export type EnvironmentType = "tranquil" | "harmonic" | "prismatic" | "quantum"
export type GuardianMood = "analytical" | "catalytic" | "protective" | "contemplative" | "nurturing"

