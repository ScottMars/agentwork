"use client"

import { GuardianTrait } from '@/types';

interface GuardianTraitDisplayProps {
  trait: GuardianTrait;
}

export function GuardianTraitDisplay({ trait }: GuardianTraitDisplayProps) {
  return (
    <div className="bg-[#0e2b36] border border-[#3a7c8c] rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-2 text-[#7fdbff]">{trait.name}</h3>
      <p className="text-sm text-[#c4f5ff] mb-2">{trait.description}</p>
      <p className="text-sm text-[#c4f5ff]">{trait.effect}</p>
    </div>
  );
} 