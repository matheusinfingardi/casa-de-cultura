import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 768
const consulta = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function assinar(cb: () => void) {
  const mql = window.matchMedia(consulta)
  mql.addEventListener("change", cb)
  return () => mql.removeEventListener("change", cb)
}

export function useIsMobile() {
  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(consulta).matches,
    () => false
  )
}
