import type { EcosystemState } from "@/types/ecosystem"
import { capitalize } from "@/utils/ecosystem-utils"

interface GuardianStatusProps {
  state: EcosystemState
}

export function GuardianStatus({ state }: GuardianStatusProps) {
  return (
    <div className="border border-[#3a7c8c] p-2.5 mb-5 rounded bg-[#0e2b36] w-full">
      <h3 className="text-lg font-bold">Etheric Guardian</h3>
      <div id="guardian-status">Status: Observing</div>
      <div id="guardian-mood">Disposition: {capitalize(state.guardian.mood)}</div>
      <div id="guardian-focus">Focus: {capitalize(state.guardian.focus)}</div>
    </div>
  )
}

