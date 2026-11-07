"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import CertificadosGestao from "@/components/comum/certificados-gestao"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import { horasEmTexto } from "@/lib/certificados"
import { dataBR } from "@/lib/formatar"
import { listarItensView, type ItemView } from "@/lib/itens"
import { certificadosDaPessoa, type CertificadoEmitido } from "@/lib/services/certificados"

function Meus({ vazio }: { vazio: string }) {
  const { user } = useAuth()
  const [lista, setLista] = useState<CertificadoEmitido[] | null>(null)
  useEffect(() => { if (user) certificadosDaPessoa(user.id).then(setLista) }, [user])
  if (lista === null) return null
  if (!lista.length) return <EstadoVazio icon={Award} titulo="Nenhum certificado ainda" texto={vazio} />
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
      <table className="w-full">
        <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">Certificado</th>
            <th scope="col" className="px-3 py-3 font-semibold">Para</th>
            <th scope="col" className="px-3 py-3 font-semibold">Cobre</th>
            <th scope="col" className="px-5 py-3"><span className="sr-only">Baixar</span></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {lista.map((c) => {
            const ds = [...c.datas].sort()
            return (
              <tr key={c.id}>
                <td className="px-5 py-3"><span className="font-semibold">{c.titulo}</span>{c.itens.length > 1 && <span className="block text-sm text-muted-foreground">{c.itens.map((i) => i.nome).join(", ")}</span>}</td>
                <td className="px-3 py-3">{c.pessoa_nome}{c.papel === "voluntario" && <span className="block text-sm text-muted-foreground">Como voluntário</span>}</td>
                <td className="whitespace-nowrap px-3 py-3 text-sm">{ds.length} {ds.length === 1 ? "encontro" : "encontros"}{c.horas ? ` · ${horasEmTexto(c.horas)}` : ""}<span className="block text-muted-foreground">{ds.length === 1 ? dataBR(ds[0]) : `${dataBR(ds[0])} a ${dataBR(ds[ds.length - 1])}`}</span></td>
                <td className="px-5 py-2 text-right"><Button asChild size="sm"><Link href={`/painel/certificado/${c.id}`} aria-label={`Baixar certificado: ${c.titulo}, ${c.pessoa_nome}`}><Award className="h-4 w-4" aria-hidden /> Baixar</Link></Button></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Voluntario() {
  const { user } = useAuth()
  const [itens, setItens] = useState<ItemView[]>([])
  const [aba, setAba] = useState<"meus" | "gerar">("meus")
  useEffect(() => { if (user) listarItensView().then((l) => setItens(l.filter((i) => i.responsavel_id === user.id))) }, [user])
  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto border-b" role="tablist" aria-label="Certificados">
        {([["meus", "Meus certificados"], ["gerar", "Das minhas atividades"]] as const).map(([v, r]) => (
          <button key={v} type="button" role="tab" aria-selected={aba === v} onClick={() => setAba(v)} className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 font-medium ${aba === v ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{r}</button>
        ))}
      </div>
      {aba === "meus" ? <Meus vazio="Quando os certificados das suas atividades forem gerados, o seu aparece aqui." /> : (
        <CertificadosGestao itens={itens} autor={(user?.user_metadata?.nome as string) ?? "Voluntário"} hrefVer={(id) => `/painel/certificado/${id}`} />
      )}
    </div>
  )
}

export default function CertificadosPage() {
  const { role } = useAuth()
  const vol = role === "responsavel"
  return (
    <div className="space-y-6">
      <PageHeader titulo="Certificados" descricao={vol ? "Baixe os seus e gere os das pessoas que participam das suas atividades." : "Baixe os seus certificados e os dos seus dependentes."} />
      <SoDemo>{vol ? <Voluntario /> : <Meus vazio="Quando o responsável gerar um certificado para você, ele aparece aqui." />}</SoDemo>
    </div>
  )
}
