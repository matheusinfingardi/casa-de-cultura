"use client"

import { useCallback, useEffect, useState } from "react"
import { notify } from "@/lib/notify"
import type { Erros } from "@/lib/validacao"

/**
 * Estado de formulário com validação no envio (e revalidação enquanto corrige),
 * foco no primeiro erro e aviso ao sair com alterações não salvas.
 */
/** Remove as chaves sem mensagem: validadores devolvem `campo: undefined` quando está tudo certo. */
function limpar<T>(e: Erros<T>): Erros<T> {
  return Object.fromEntries(Object.entries(e).filter(([, v]) => !!v)) as Erros<T>
}

export function useFormulario<T extends object>(inicial: T, validarBruto: (v: T) => Erros<T>) {
  const validar = useCallback((v: T) => limpar(validarBruto(v)), [validarBruto])
  const [base] = useState(() => JSON.stringify(inicial))
  const [valores, setValores] = useState<T>(inicial)
  const [erros, setErros] = useState<Erros<T>>({})
  const [tentou, setTentou] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const sujo = !salvo && JSON.stringify(valores) !== base

  useEffect(() => {
    if (!sujo) return
    const aviso = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener("beforeunload", aviso)
    return () => window.removeEventListener("beforeunload", aviso)
  }, [sujo])

  const definir = useCallback(<K extends keyof T>(campo: K, valor: T[K]) => {
    setValores((prev) => {
      const prox = { ...prev, [campo]: valor }
      if (tentou) setErros(validar(prox))
      return prox
    })
  }, [tentou, validar])

  async function enviar(e: React.FormEvent, salvar: (v: T) => Promise<void>) {
    e.preventDefault()
    setTentou(true)
    const er = validar(valores)
    setErros(er)
    if (Object.keys(er).length) {
      notify.error("Revise os campos destacados em vermelho")
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>('[aria-invalid="true"]')
        el?.scrollIntoView({ block: "center", behavior: "smooth" })
        el?.focus()
      })
      return
    }
    setSalvando(true)
    try {
      await salvar(valores)
      setSalvo(true)
    } catch {
      // erro já exibido por toast no serviço
    } finally {
      setSalvando(false)
    }
  }

  return { valores, definir, erros, salvando, sujo, enviar }
}
