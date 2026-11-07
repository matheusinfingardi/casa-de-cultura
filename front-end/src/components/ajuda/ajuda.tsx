"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Search, SearchX } from "lucide-react"

import { Input } from "@/components/ui/input"
import PageHeader from "@/components/comum/page-header"
import EstadoVazio from "@/components/comum/estado-vazio"
import { APP_VERSAO } from "@/lib/config"
import type { Perfil } from "@/lib/perfis"
import { PERGUNTAS, PRIMEIROS_PASSOS } from "./conteudo"
import Suporte from "./suporte"

export default function Ajuda({ perfil }: { perfil: Perfil }) {
  const [busca, setBusca] = useState("")
  const perguntas = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return PERGUNTAS[perfil].filter((q) => !t || `${q.p} ${q.r}`.toLowerCase().includes(t))
  }, [busca, perfil])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader titulo="Ajuda" descricao="Respostas rápidas para as dúvidas mais comuns. Se não resolver, fale com o Suporte Técnico." />

      <section aria-labelledby="passos">
        <h2 id="passos" className="mb-3 text-lg font-semibold">Primeiros passos</h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {PRIMEIROS_PASSOS[perfil].map((p, i) => (
            <li key={p.titulo} className="rounded-2xl border bg-card p-4 shadow-sm">
              <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground" aria-hidden>{i + 1}</span>
              <p className="font-medium">{p.titulo}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq" className="space-y-3">
        <h2 id="faq" className="text-lg font-semibold">Perguntas frequentes</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input className="pl-9" placeholder="Buscar nas perguntas" aria-label="Buscar nas perguntas frequentes" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        {perguntas.length === 0 ? (
          <EstadoVazio icon={SearchX} titulo="Nenhuma pergunta encontrada" texto="Tente outras palavras ou fale com o Suporte Técnico logo abaixo." />
        ) : (
          <div className="space-y-2">
            {perguntas.map((q) => (
              <details key={q.p} className="group rounded-xl border bg-card px-4 py-3 shadow-sm open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
                  {q.p}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{q.r}</p>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
        <h2 className="text-lg font-semibold">Ainda precisa de ajuda?</h2>
        <p className="mx-auto mb-4 mt-1 max-w-md text-sm text-muted-foreground">
          Nossa equipe de T.I. responde por e-mail. Descreva o problema e nós preenchemos os dados técnicos para você.
        </p>
        <Suporte destaque />
      </section>

      <p className="text-center text-xs text-muted-foreground">Casa de Cultura Evailton Vilela · versão {APP_VERSAO}</p>
    </div>
  )
}
