"use client"

import { useAuth } from "@/components/auth/auth-provider"
import AgendaCompleta from "@/components/portal/agenda/agenda-completa"
import { atividadesApi, eventosApi, oficinasApi } from "@/lib/services/entidades"
import { listarItensDoResponsavel, listarMinhasPresencas } from "@/lib/services/presencas"

export default function AgendaPainelPage() {
  const { role } = useAuth()
  const voluntario = role === "responsavel"
  return (
    <AgendaCompleta
      titulo="Minha agenda"
      descricao={voluntario ? "Seus compromissos como voluntário." : "As atividades em que você está inscrito."}
      transformar={(o) => ({ ...o, href: voluntario ? `/painel/presenca/${o.tipo}/${o.itemId}` : `/painel/item/${o.tipo}/${o.itemId}` })}
      carregar={async () => {
        const [eventos, atividades, oficinas, ids] = await Promise.all([
          eventosApi.listar(), atividadesApi.listar(), oficinasApi.listar(),
          voluntario ? listarItensDoResponsavel().then((l) => l.map((i) => i.id)) : listarMinhasPresencas().then((l) => l.map((p) => p.item_id)),
        ])
        const meu = <T extends { id: string }>(l: T[]) => l.filter((i) => ids.includes(i.id))
        return { eventos: meu(eventos), atividades: meu(atividades), oficinas: meu(oficinas) }
      }}
    />
  )
}
