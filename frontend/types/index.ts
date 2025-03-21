export interface Entity {
  id: string;
  name: string;
  type: string;
  description: string;
  className?: string;
}

export interface Environment {
  id: string;
  name: string;
  description: string;
  pattern: string;
}

export interface GuardianTrait {
  id: string;
  name: string;
  description: string;
  effect: string;
}

export type GuardianMood = "analytical" | "catalytic" | "protective" | "contemplative" | "nurturing"; 