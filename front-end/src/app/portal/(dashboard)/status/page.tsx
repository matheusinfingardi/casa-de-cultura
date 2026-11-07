"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, CircleAlert, CircleX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import PageHeader from "@/components/comum/page-header"
import { useDemo } from "@/hooks/use-demo"
import { APP_VERSAO, SUPORTE_CONFIGURADO } from "@/lib/config"
import { lerErros, limparErros, type ErroTela } from "@/lib/monitoramento"
import { eventosApi } from "@/lib/services/entidades"

type Linha = { nome: string; estado: "ok" | "aviso" | "erro"; texto: string }
const ICONE = { ok: CheckCircle2, aviso: CircleAlert, erro: CircleX }
const COR = { ok: "text-emerald-700 dark:text-emerald-300", aviso: "text-amber-700 dark:text-amber-300", erro: "text-red-700 dark:text-red-300" }
const NOME = { ok: "Funcionando", aviso: "Atenção", erro: "Com problema" }

export default function StatusPage() {
  const demo = useDemo()
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [erros, setErros] = useState<ErroTela[]>([])

  useEffect(() => {
    let ativo = true
    ;(async () => {
      const ini = performance.now()
      let banco: Linha
      try {
        await eventosApi.listar()
        banco = { nome: "Banco de dados", estado: "ok", texto: demo ? "Demonstração: dados guardados neste navegador" : `Respondeu em ${Math.round(performance.now() - ini)} ms` }
      } catch {
        banco = { nome: "Banco de dados", estado: "erro", texto: "Sem resposta" }
      }
      const sw = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined
      if (!ativo) return
      setLinhas([
        banco,
        { nome: "Internet", estado: navigator.onLine ? "ok" : "aviso", texto: navigator.onLine ? "Conectado" : "Sem conexão neste aparelho" },
        { nome: "Aplicativo instalável", estado: sw ? "ok" : "aviso", texto: sw ? "Ativo neste navegador" : "Ativo apenas no site publicado" },
        { nome: "E-mail do suporte", estado: SUPORTE_CONFIGURADO ? "ok" : "aviso", texto: SUPORTE_CONFIGURADO ? "Configurado" : "Falta informar o e-mail oficial do T.I." },
      ])
      setErros(lerErros())
    })()
    return () => { ativo = false }
  }, [demo])

  return (
    <div className="space-y-6">
      <PageHeader titulo="Status do sistema" descricao={`Versão ${APP_VERSAO}. Confira aqui antes de abrir um chamado.`} />
      <Card className="gap-0 divide-y p-0">
        {linhas.map((l) => {
          const I = ICONE[l.estado]
          return (
            <div key={l.nome} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
              <I className={`h-5 w-5 ${COR[l.estado]}`} aria-hidden />
              <p className="font-medium">{l.nome}</p>
              <p className="text-muted-foreground">{l.texto}</p>
              <p className={`ml-auto text-sm font-medium ${COR[l.estado]}`}>{NOME[l.estado]}</p>
            </div>
          )
        })}
      </Card>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Erros recentes neste aparelho</h2>
          {erros.length > 0 && <Button size="sm" variant="outline" onClick={() => { limparErros(); setErros([]) }}>Limpar</Button>}
        </div>
        {erros.length === 0 ? <p className="text-muted-foreground">Nenhum erro registrado.</p> : (
          <ul className="space-y-2">{erros.map((e, i) => <li key={i} className="rounded-xl border bg-card p-3"><p className="font-medium">{e.mensagem}</p><p className="text-sm text-muted-foreground">{e.pagina} · {new Date(e.quando).toLocaleString("pt-BR")}</p></li>)}</ul>
        )}
      </section>
    </div>
  )
}
