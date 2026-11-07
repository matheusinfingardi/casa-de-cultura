import { useSyncExternalStore } from "react"
import { assinarDemo, ehDemo } from "@/lib/demo/modo"

/** true quando o app está no modo demonstração (reativo). */
export function useDemo() {
  return useSyncExternalStore(assinarDemo, ehDemo, () => false)
}
