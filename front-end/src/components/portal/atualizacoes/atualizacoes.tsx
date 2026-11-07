"use client"

import { CheckCircle2, ListChecks } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CHANGELOG, INTEGRACOES, STATUS_INFO } from "./dados"

function formatarData(iso: string) {
  const [a, m, d] = iso.split("-").map(Number)
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export default function Atualizacoes() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Atualizações</h1>
        <p className="text-muted-foreground text-sm">
          O que mudou no sistema e o que ainda precisa ser feito para tudo funcionar.
        </p>
      </div>

      <Tabs defaultValue="changelog">
        <TabsList className="h-auto">
          <TabsTrigger value="changelog" className="px-4 py-2">Changelog</TabsTrigger>
          <TabsTrigger value="integracoes" className="px-4 py-2">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="changelog" className="space-y-4 pt-2">
          {CHANGELOG.map((n, idx) => (
            <Card key={n.data + n.titulo} className="p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{n.titulo}</h2>
                {idx === 0 && <Badge>Mais recente</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{formatarData(n.data)}</p>
              <ul className="space-y-2">
                {n.itens.map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="integracoes" className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Integrações são as ligações do sistema com outros serviços. Abaixo, o que já existe e
            o que falta para cada uma.
          </p>
          {INTEGRACOES.map((i) => {
            const st = STATUS_INFO[i.status]
            return (
              <Card key={i.nome} className="p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{i.nome}</h2>
                    <p className="text-sm text-muted-foreground">{i.para}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${st.classe}`}>
                    {st.label}
                  </span>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium mb-2">
                    <ListChecks className="h-4 w-4" aria-hidden />
                    O que precisa ser feito
                    <Badge variant="outline">{i.responsavel}</Badge>
                  </p>
                  <ul className="list-disc pl-6 space-y-1.5 text-sm">
                    {i.precisa.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
