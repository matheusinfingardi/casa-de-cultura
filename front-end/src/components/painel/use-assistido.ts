"use client"

import { useCallback, useEffect, useState } from "react"
import { useDemo } from "@/hooks/use-demo"
import { listarItensView, type ItemView } from "@/lib/itens"
import { notify } from "@/lib/notify"
import { entrarNaEspera, minhaEspera, notificar, promoverDaEspera, sairDaEspera, type Espera } from "@/lib/services/extras"
import { contarInscritos, inscreverMe, listarMinhasPresencas, removerPresenca, type ContagemItem, type MinhaPresenca } from "@/lib/services/presencas"
import { supabase } from "@/lib/supabase"

/** Dados e ações do assistido, compartilhados entre as telas do painel. */
export function useAssistido() {
  const demo = useDemo()
  const [minhas, setMinhas] = useState<MinhaPresenca[]>([])
  const [itens, setItens] = useState<ItemView[]>([])
  const [espera, setEspera] = useState<Espera[]>([])
  const [contagens, setContagens] = useState<Record<string, ContagemItem>>({})
  const [loading, setLoading] = useState(true)
  const [acao, setAcao] = useState<string | null>(null)

  const buscar = useCallback(
    () => Promise.all([listarMinhasPresencas(), listarItensView(), demo ? minhaEspera() : Promise.resolve([]), demo ? contarInscritos() : Promise.resolve({})]),
    [demo]
  )
  const aplicar = useCallback(([m, i, e, c]: Awaited<ReturnType<typeof buscar>>) => {
    setMinhas(m); setItens(i); setEspera(e); setContagens(c); setLoading(false)
  }, [])
  const carregar = useCallback(async () => aplicar(await buscar()), [aplicar, buscar])

  useEffect(() => {
    let ativo = true
    buscar().then((r) => ativo && aplicar(r))
    return () => { ativo = false }
  }, [buscar, aplicar])

  const chave = (tipo: string, id: string) => `${tipo}-${id}`
  const inscrito = (i: ItemView) => minhas.find((p) => p.item_tipo === i.tipo && p.item_id === i.id)
  const naEspera = (i: ItemView) => espera.find((e) => e.item_tipo === i.tipo && e.item_id === i.id)
  /** Só sabemos se está lotado na demonstração: no banco real, o assistido não enxerga os outros inscritos. */
  const lotado = (i: ItemView) => demo && i.vagas !== null && i.vagas > 0 && (contagens[chave(i.tipo, i.id)]?.total ?? 0) >= i.vagas
  const vagasLivres = (i: ItemView) => (demo && i.vagas !== null ? Math.max(0, i.vagas - (contagens[chave(i.tipo, i.id)]?.total ?? 0)) : null)

  async function inscrever(i: ItemView) {
    setAcao(chave(i.tipo, i.id))
    try {
      await inscreverMe(i.tipo, i.id, i.nome)
      if (demo) {
        const { data } = await supabase.auth.getUser()
        if (data.user) await notificar(data.user.id, "Inscrição confirmada", `Você está inscrito em ${i.nome}.`, "/painel/inscricoes")
      }
      await carregar()
      notify.success("Inscrição feita!")
    } catch { /* erro mostrado pelo serviço */ } finally { setAcao(null) }
  }

  async function cancelar(p: MinhaPresenca) {
    setAcao(p.id)
    try {
      await removerPresenca(p.id)
      if (demo && p.item_tipo === "oficina") await promoverDaEspera(p.item_tipo, p.item_id)
      await carregar()
      notify.success("Inscrição cancelada")
    } catch { /* erro mostrado pelo serviço */ } finally { setAcao(null) }
  }

  async function entrarFila(i: ItemView) {
    setAcao(chave(i.tipo, i.id))
    await entrarNaEspera(i.tipo, i.id, i.nome)
    await carregar()
    setAcao(null)
    notify.success("Você entrou na lista de espera. Avisaremos quando abrir vaga.")
  }

  async function sairFila(e: Espera) {
    await sairDaEspera(e.id)
    await carregar()
    notify.success("Você saiu da lista de espera")
  }

  return { minhas, itens, espera, loading, acao, inscrever, cancelar, entrarFila, sairFila, inscrito, naEspera, lotado, vagasLivres, carregar }
}
