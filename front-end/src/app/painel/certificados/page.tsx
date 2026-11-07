"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Award, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import { horasEmTexto, horasNasDatas } from "@/lib/certificados"
import { listarItensView, type ItemView } from "@/lib/itens"
import { listarRegistros } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS } from "@/lib/services/presencas"

type Linha = { item: ItemView; encontros: number; horas: number }

function Lista() {
  const { user } = useAuth()
  const [linhas, setLinhas] = useState<Linha[] | null>(null)

  useEffect(() => {
    if (!user) return
    Promise.all([listarItensView(), listarRegistros()]).then(([itens, regs]) => {
      setLinhas(itens.filter((i) => i.responsavel_id === user.id && i.tem_certificado).map((item) => {
        const datas = [...new Set(regs.filter((r) => r.item_id === item.id).map((r) => r.data))]
        return { item, encontros: datas.length, horas: horasNasDatas(item, datas) }
      }))
    })
  }, [user])

  if (linhas === null) return null
  if (!linhas.length) return <EstadoVazio icon={Award} titulo="Nenhum certificado por aqui" texto="Seus compromissos que emitem certificado aparecem nesta página." />
  return (
    <ul className="space-y-3">
      {linhas.map(({ item, encontros, horas }) => (
        <li key={`${item.tipo}-${item.id}`}>
          <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-lg font-semibold">{item.nome} <Badge variant="outline">{ITEM_TIPO_LABELS[item.tipo]}</Badge></p>
              <p className="text-muted-foreground">{encontros} {encontros === 1 ? "encontro conduzido" : "encontros conduzidos"}{horas > 0 ? ` · ${horasEmTexto(horas)}` : ""}</p>
              {item.certificado_liberado
                ? <p className="mt-1 flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4" aria-hidden /> Certificados liberados</p>
                : <p className="mt-1 flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" aria-hidden /> Ainda não liberados</p>}
            </div>
            {item.certificado_liberado && encontros > 0 ? (
              <Button asChild><Link href={`/painel/certificado/voluntario/${item.tipo}/${item.id}`}><Award className="h-4 w-4" aria-hidden /> Baixar meu certificado</Link></Button>
            ) : (
              <Button asChild variant="outline"><Link href={`/painel/presenca/${item.tipo}/${item.id}`}>Abrir chamada para liberar</Link></Button>
            )}
          </Card>
        </li>
      ))}
    </ul>
  )
}

export default function CertificadosPage() {
  return (
    <div className="space-y-6">
      <PageHeader titulo="Certificados" descricao="Libere os certificados dos inscritos quando terminar e baixe o seu pelo trabalho que você conduziu." />
      <SoDemo><Lista /></SoDemo>
    </div>
  )
}
