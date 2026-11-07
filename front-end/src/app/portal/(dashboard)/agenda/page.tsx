"use client"

import { useEffect, useState } from "react"
import AgendaCompleta from "@/components/portal/agenda/agenda-completa"
import { useUnidade } from "@/components/portal/unidade"
import { atividadesApi, eventosApi, oficinasApi } from "@/lib/services/entidades"
import { contarInscritos, type ContagemItem } from "@/lib/services/presencas"

export default function AgendaPage() {
  const { filtrar, unidade } = useUnidade()
  const [contagem, setContagem] = useState<Record<string, ContagemItem>>({})
  useEffect(() => { contarInscritos().then(setContagem) }, [])
  return (
    <AgendaCompleta
      key={unidade}
      titulo="Agenda"
      descricao="Tudo o que acontece na Casa de Cultura: quem conduz, quantos inscritos e a chamada de cada dia."
      gestao={{
        inscritos: (o) => contagem[`${o.tipo}-${o.itemId}`]?.total ?? 0,
        hrefChamada: (o) => `/portal/presenca/${o.tipo}/${o.itemId}?data=${o.data}`,
      }}
      carregar={async () => {
        const [eventos, atividades, oficinas] = await Promise.all([eventosApi.listar(), atividadesApi.listar(), oficinasApi.listar()])
        return { eventos: filtrar(eventos), atividades: filtrar(atividades), oficinas: filtrar(oficinas) }
      }}
    />
  )
}
