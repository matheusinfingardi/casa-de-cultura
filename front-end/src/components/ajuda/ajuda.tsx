"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Search, SearchX } from "lucide-react"

import { Input } from "@/components/ui/input"
import EstadoVazio from "@/components/comum/estado-vazio"
import { APP_VERSAO } from "@/lib/config"
import type { Perfil } from "@/lib/perfis"
import { PRIMEIROS_PASSOS, TEMAS } from "./conteudo"
import Suporte from "./suporte"

export default function Ajuda({ perfil }: { perfil: Perfil }) {
  const temas = TEMAS[perfil]
  const [busca, setBusca] = useState("")
  const [tema, setTema] = useState(temas[0].id)
  const termo = busca.trim().toLowerCase()

  const perguntas = useMemo(() => {
    if (termo) return temas.flatMap((t) => t.perguntas).filter((q) => `${q.p} ${q.r}`.toLowerCase().includes(termo))
    return temas.find((t) => t.id === tema)?.perguntas ?? []
  }, [termo, temas, tema])

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-primary px-6 py-10 text-center text-primary-foreground md:py-12">
        <h1 className="text-3xl font-bold md:text-4xl">Como podemos ajudar?</h1>
        <div className="relative mx-auto mt-5 max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input className="h-14 pl-12 text-base text-foreground" placeholder="Digite sua dúvida. Ex.: esqueci a senha" aria-label="Buscar nas perguntas" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
      </header>

      {!termo && (
        <section aria-labelledby="passos">
          <h2 id="passos" className="mb-3 text-xl font-semibold">Comece por aqui</h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {PRIMEIROS_PASSOS[perfil].map((p, i) => (
              <li key={p.titulo} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground" aria-hidden>{i + 1}</span>
                <div><p className="font-semibold">{p.titulo}</p><p className="mt-0.5 text-muted-foreground">{p.texto}</p></div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="duvidas" className="min-w-0 space-y-4">
          <h2 id="duvidas" className="text-xl font-semibold">{termo ? `Resultados para “${busca}”` : "Dúvidas por assunto"}</h2>
          {!termo && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Assuntos">
              {temas.map((t) => (
                <button key={t.id} type="button" aria-pressed={tema === t.id} onClick={() => setTema(t.id)} className={`rounded-full border px-4 py-2 text-sm font-medium ${tema === t.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
                  {t.titulo}
                </button>
              ))}
            </div>
          )}
          {perguntas.length === 0 ? (
            <EstadoVazio icon={SearchX} titulo="Não encontramos nada" texto="Tente outras palavras ou fale com o Suporte Técnico." />
          ) : (
            <div className="divide-y overflow-hidden rounded-2xl border bg-card shadow-sm">
              {perguntas.map((q) => (
                <details key={q.p} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-medium hover:bg-muted/40">
                    {q.p}
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="px-5 pb-5 leading-relaxed text-muted-foreground">{q.r}</p>
                </details>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold">Ainda com dúvida?</h2>
          <p className="text-muted-foreground">Fale com o T.I. Conte o que aconteceu e nós anexamos os dados técnicos para você.</p>
          <Suporte />
          <p className="pt-2 text-sm text-muted-foreground">Versão {APP_VERSAO}</p>
        </aside>
      </div>
    </div>
  )
}
