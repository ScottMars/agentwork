"use client"

import { Environment } from '@/types';

interface EnvironmentDisplayProps {
  environment: Environment;
}

export function EnvironmentDisplay({ environment }: EnvironmentDisplayProps) {
  return (
    <div className="bg-[#0e2b36] border border-[#3a7c8c] rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-2 text-[#7fdbff]">{environment.name}</h3>
      <p className="text-sm text-[#c4f5ff] mb-2">{environment.description}</p>
      <pre className="text-sm text-[#c4f5ff] font-mono whitespace-pre-wrap">{environment.pattern}</pre>
    </div>
  );
} 