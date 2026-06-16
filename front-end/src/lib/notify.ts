// Sistema de notificação (toast) leve, sem dependências.
// Pub/sub a nível de módulo — pode ser chamado de qualquer lugar, inclusive
// dos services (que não são componentes React).

export type ToastTipo = "error" | "success"

export type Toast = {
  id: number
  tipo: ToastTipo
  mensagem: string
}

type Listener = (toast: Toast) => void

let seq = 0
const listeners = new Set<Listener>()

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function emit(tipo: ToastTipo, mensagem: string) {
  const toast: Toast = { id: ++seq, tipo, mensagem }
  listeners.forEach((fn) => fn(toast))
}

export const notify = {
  error: (mensagem: string) => emit("error", mensagem),
  success: (mensagem: string) => emit("success", mensagem),
}
