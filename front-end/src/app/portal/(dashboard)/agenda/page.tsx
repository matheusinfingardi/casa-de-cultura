"use client"

import AgendaCompleta from "@/components/portal/agenda/agenda-completa"
import { useUnidade } from "@/components/portal/unidade"
import { atividadesApi, eventosApi, oficinasApi } from "@/lib/services/entidades"

export default function AgendaPage() {
  const { filtrar, unidade } = useUnidade()
  return (
    <AgendaCompleta
      key={unidade}
      titulo="Agenda"
      descricao="Tudo o que acontece na Casa de Cultura: eventos, atividades e oficinas."
      carregar={async () => {
        const [eventos, atividades, oficinas] = await Promise.all([eventosApi.listar(), atividadesApi.listar(), oficinasApi.listar()])
        return { eventos: filtrar(eventos), atividades: filtrar(atividades), oficinas: filtrar(oficinas) }
      }}
    />
  )
}
