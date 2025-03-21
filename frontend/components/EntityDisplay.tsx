"use client"

import { Entity } from '@/types';

interface EntityDisplayProps {
  entity: Entity;
}

export function EntityDisplay({ entity }: EntityDisplayProps) {
  return (
    <div className="bg-[#0e2b36] border border-[#3a7c8c] rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-2 text-[#7fdbff]">{entity.name}</h3>
      <p className="text-sm text-[#c4f5ff] mb-2">{entity.type}</p>
      <p className="text-sm text-[#c4f5ff]">{entity.description}</p>
    </div>
  );
} 