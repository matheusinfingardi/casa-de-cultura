"use client"

import { CheckCircle2, ListChecks } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PageHeader from "@/components/comum/page-header"
import { CHANGELOG, INTEGRACOES, STATUS_INFO } from "./dados"

function formatarData(iso: string) {
  const [a, m, d] = iso.split("-").map(Number)
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
}

export default function Atualizacoes() {
  return (
    <div className="space-y-6">
      <PageHeader titulo="Atualizações" descricao="O que mudou no sistema e o que ainda falta para tudo funcionar de verdade." />

      <Tabs defaultValue="changelog" className="gap-6">
        <TabsList className="h-auto p-1">
          <TabsTrigger value="changelog" className="px-5 py-2 text-base">O que mudou</TabsTrigger>
          <TabsTrigger value="integracoes" className="px-5 py-2 text-base">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="changelog">
          <ol className="space-y-6 border-l-2 border-border pl-6">
            {CHANGELOG.map((n, idx) => (
              <li key={n.versao} className="relative">
                <span className={`absolute -left-[1.95rem] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background ${idx === 0 ? "bg-primary" : "bg-muted-foreground/50"}`} aria-hidden />
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{n.titulo}</h2>
                    <Badge variant={idx === 0 ? "default" : "outline"}>v{n.versao}</Badge>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">{formatarData(n.data)}</p>
                  <ul className="grid gap-x-8 gap-y-2 md:grid-cols-2">
                    {n.itens.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="integracoes" className="space-y-4">
          <p className="text-muted-foreground">Integrações são as ligações do sistema com outros serviços. Veja o que já existe e o que falta em cada uma.</p>
          <ul className="grid items-start gap-4 lg:grid-cols-2">
            {INTEGRACOES.map((i) => {
              const st = STATUS_INFO[i.status]
              return (
                <li key={i.nome} className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold">{i.nome}</h2>
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${st.classe}`}>{st.label}</span>
                  </div>
                  <p className="text-muted-foreground">{i.para}</p>
                  <div>
                    <p className="mb-2 flex items-center gap-2 font-medium"><ListChecks className="h-4 w-4" aria-hidden /> O que falta <Badge variant="outline">{i.responsavel}</Badge></p>
                    <ul className="list-disc space-y-1.5 pl-5">{i.precisa.map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                </li>
              )
            })}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  )
}
