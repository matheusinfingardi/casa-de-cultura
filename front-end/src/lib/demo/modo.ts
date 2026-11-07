// Modo demonstração: o app roda 100% no navegador, com dados fictícios, sem tocar no banco real.
const CHAVE = "cc-demo"
const EVENTO = "cc-demo-mudou"

export function ehDemo(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(CHAVE) === "1"
  } catch {
    return false
  }
}

export function definirDemo(ativo: boolean) {
  try {
    if (ativo) window.localStorage.setItem(CHAVE, "1")
    else window.localStorage.removeItem(CHAVE)
    window.dispatchEvent(new Event(EVENTO))
  } catch {
    /* navegador sem armazenamento: demonstração indisponível */
  }
}

export function assinarDemo(cb: () => void) {
  window.addEventListener(EVENTO, cb)
  window.addEventListener("storage", cb)
  return () => {
    window.removeEventListener(EVENTO, cb)
    window.removeEventListener("storage", cb)
  }
}
