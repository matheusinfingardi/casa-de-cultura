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
import { carregarItem } from "@/lib/itens"
import { registrosDaPessoa } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, listarMinhasPresencas, type MinhaPresenca } from "@/lib/services/presencas"

type Resumo = { encontros: number; horas: number; de: string; ate: string }

export default function CertificadoPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [dados, setDados] = useState<{ p: MinhaPresenca; resumo: Resumo } | null | undefined>(undefined)
  const nome = (user?.user_metadata?.nome as string | undefined) ?? user?.email ?? ""

  // Só existe certificado se a atividade emite, foi liberada e há presença registrada.
  useEffect(() => {
    if (!user) return
    ;(async () => {
      const p = (await listarMinhasPresencas()).find((x) => x.id === id)
      const item = p ? await carregarItem(p.item_tipo, p.item_id) : null
      if (!p || !item?.tem_certificado || !item.certificado_liberado) return setDados(null)
      const presentes = (await registrosDaPessoa(user.id)).filter((r) => r.item_id === p.item_id && r.status === "presente").map((r) => r.data).sort()
      if (!presentes.length) return setDados(null)
      setDados({ p, resumo: { encontros: presentes.length, horas: horasNasDatas(item, presentes), de: presentes[0], ate: presentes[presentes.length - 1] } })
    })()
  }, [id, user])

  if (dados === undefined) return <Skeleton className="h-96 rounded-2xl" />
  if (!dados) return <EstadoVazio icon={SearchX} titulo="Certificado indisponível" texto="O certificado aparece depois que o responsável libera e sua presença está registrada." />

  const { p, resumo } = dados
  return (
    <ModeloCertificado titulo="Certificado de Participação" nome={nome} area={ITEM_TIPO_LABELS[p.item_tipo]} codigo={id}>
      participou {p.item_tipo === "evento" ? "do evento" : p.item_tipo === "oficina" ? "da oficina" : p.item_tipo === "atividade" ? "da atividade" : "de"} <strong>{p.item_nome}</strong>, comparecendo a <strong>{resumo.encontros} {resumo.encontros === 1 ? "encontro" : "encontros"}</strong>
      {resumo.horas > 0 && <>, totalizando <strong>{horasEmTexto(resumo.horas)}</strong></>}, entre {dataBR(resumo.de)} e {dataBR(resumo.ate)}, uma iniciativa da Casa de Cultura Evailton Vilela.
    </ModeloCertificado>
  )
}
