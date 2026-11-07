"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { SearchX } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth/auth-provider"
import EstadoVazio from "@/components/comum/estado-vazio"
import ModeloCertificado from "@/components/comum/modelo-certificado"
import { horasEmTexto, horasNasDatas } from "@/lib/certificados"
import { dataBR } from "@/lib/formatar"
import { carregarItem, type ItemView } from "@/lib/itens"
import { registrosDoItem } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, ITEM_TIPO_TABLE, isItemTipo, type ItemTipo } from "@/lib/services/presencas"

type Dados = { item: ItemView; encontros: number; horas: number; de: string; ate: string }

/** Certificado do trabalho voluntário: conta os dias em que a chamada foi feita. */
export default function CertificadoVoluntarioPage() {
  const { tipo, id } = useParams<{ tipo: string; id: string }>()
  const { user } = useAuth()
  const [d, setD] = useState<Dados | null | undefined>(undefined)
  const nome = (user?.user_metadata?.nome as string | undefined) ?? user?.email ?? ""

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const item = isItemTipo(tipo) ? await carregarItem(tipo as ItemTipo, id) : null
      if (!item || item.responsavel_id !== user.id || !item.tem_certificado || !item.certificado_liberado) return setD(null)
      const datas = [...new Set((await registrosDoItem(item.tipo, item.id)).map((r) => r.data))].sort()
      if (!datas.length) return setD(null)
      setD({ item, encontros: datas.length, horas: horasNasDatas(item, datas), de: datas[0], ate: datas[datas.length - 1] })
    })()
  }, [tipo, id, user])

  if (d === undefined) return <Skeleton className="h-96 rounded-2xl" />
  if (!d) return <EstadoVazio icon={SearchX} titulo="Certificado indisponível" texto="Ele aparece quando você é o responsável, há chamadas feitas e os certificados foram liberados." />

  return (
    <ModeloCertificado titulo="Certificado de Trabalho Voluntário" nome={nome} area={ITEM_TIPO_LABELS[d.item.tipo]} codigo={`vol~${ITEM_TIPO_TABLE[d.item.tipo]}~${d.item.id}~${user?.id}`}>
      atuou como voluntário(a) responsável por <strong>{d.item.nome}</strong>, conduzindo <strong>{d.encontros} {d.encontros === 1 ? "encontro" : "encontros"}</strong>
      {d.horas > 0 && <>, totalizando <strong>{horasEmTexto(d.horas)}</strong></>}, entre {dataBR(d.de)} e {dataBR(d.ate)}, contribuindo com o trabalho da Casa de Cultura Evailton Vilela.
    </ModeloCertificado>
  )
}
