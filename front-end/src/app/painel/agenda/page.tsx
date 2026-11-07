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
      titulo="Agenda"
      descricao="Veja só os seus compromissos ou tudo o que acontece na Casa de Cultura."
      transformar={(o) => ({ ...o, href: `/painel/item/${o.tipo}/${o.itemId}` })}
      carregar={async () => {
        const [eventos, atividades, oficinas, ids] = await Promise.all([
          eventosApi.listar(), atividadesApi.listar(), oficinasApi.listar(),
          voluntario ? listarItensDoResponsavel().then((l) => l.map((i) => i.id)) : listarMinhasPresencas().then((l) => l.map((p) => p.item_id)),
        ])
        return { eventos, atividades, oficinas, meusIds: ids }
      }}
    />
  )
}
