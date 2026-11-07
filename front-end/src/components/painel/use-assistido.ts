"use client"

import { useCallback, useEffect, useState } from "react"
import {
  listarMinhasPresencas,
  listarTodosItens,
  inscreverMe,
  removerPresenca,
  type MinhaPresenca,
  type ItemResponsavel,
} from "@/lib/services/presencas"
import { notify } from "@/lib/notify"

// Dados e ações do painel do assistido, compartilhados entre Início,
// Minhas inscrições e Explorar.
export function useAssistido() {
  const [minhas, setMinhas] = useState<MinhaPresenca[]>([])
  const [itens, setItens] = useState<ItemResponsavel[]>([])
  const [loading, setLoading] = useState(true)
  const [acao, setAcao] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    const [m, i] = await Promise.all([listarMinhasPresencas(), listarTodosItens()])
    setMinhas(m)
    setItens(i)
    setLoading(false)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const inscritos = new Set(minhas.map((p) => `${p.item_tipo}-${p.item_id}`))
  const disponiveis = itens.filter((i) => !inscritos.has(`${i.tipo}-${i.id}`))

  async function inscrever(i: ItemResponsavel) {
    setAcao(`${i.tipo}-${i.id}`)
    try {
      await inscreverMe(i.tipo, i.id, i.nome)
      await carregar()
      notify.success("Inscrição realizada!")
    } catch {
      // erro exibido via toast pelo service
    } finally {
      setAcao(null)
    }
  }

  async function cancelar(p: MinhaPresenca) {
    setAcao(p.id)
    try {
      await removerPresenca(p.id)
      setMinhas((prev) => prev.filter((x) => x.id !== p.id))
      notify.success("Inscrição cancelada.")
    } catch {
      // erro exibido via toast pelo service
    } finally {
      setAcao(null)
    }
  }

  return { minhas, disponiveis, loading, acao, inscrever, cancelar }
}
