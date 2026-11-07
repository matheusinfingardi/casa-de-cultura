"use client"

import { useEffect, useRef } from "react"
import { FlaskConical, RotateCcw, X } from "lucide-react"
import { useDemo } from "@/hooks/use-demo"
import { useAuth } from "@/components/auth/auth-provider"
import { iniciarSessaoDemo, restaurarDadosDemo } from "@/lib/demo/cliente"
import { sair } from "@/lib/services/auth"
import { ROLE_PERFIL, type Perfil } from "@/lib/perfis"

const OPCOES: { perfil: Perfil; rotulo: string; rota: string }[] = [
  { perfil: "assistido", rotulo: "Assistido", rota: "/painel" },
  { perfil: "voluntario", rotulo: "Voluntário", rota: "/painel" },
  { perfil: "admin", rotulo: "Administração", rota: "/portal" },
]

/** Faixa no topo: lembra que os dados são fictícios e troca de perfil com um clique. */
export default function BannerDemo() {
  const demo = useDemo()
  const { role } = useAuth()
  const faixa = useRef<HTMLDivElement>(null)

  // Informa a altura da faixa para o menu lateral e a barra superior ficarem abaixo dela.
  useEffect(() => {
    const raiz = document.documentElement
    if (!demo || !faixa.current) { raiz.style.removeProperty("--altura-banner"); return }
    const el = faixa.current
    const medir = () => raiz.style.setProperty("--altura-banner", window.innerWidth >= 768 ? `${el.offsetHeight}px` : "0px")
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    window.addEventListener("resize", medir)
    return () => { ro.disconnect(); window.removeEventListener("resize", medir); raiz.style.removeProperty("--altura-banner") }
  }, [demo])

  if (!demo) return null
  const atual = role ? ROLE_PERFIL[role] : null

  function trocar(perfil: Perfil, rota: string) {
    iniciarSessaoDemo(perfil)
    window.location.href = rota
  }

  return (
    <div ref={faixa} className="nao-imprimir z-40 bg-amber-100 md:sticky md:top-0 text-amber-950 dark:bg-amber-900 dark:text-amber-50">
      {/* Celular: uma linha só */}
      <div className="flex items-center gap-2 px-4 py-1.5 text-sm md:hidden">
        <FlaskConical className="h-4 w-4 shrink-0" aria-hidden />
        <span className="font-medium">Demonstração</span>
        <select
          aria-label="Ver o sistema como"
          value={atual ?? ""}
          onChange={(e) => { const o = OPCOES.find((x) => x.perfil === e.target.value); if (o) trocar(o.perfil, o.rota) }}
          className="ml-auto h-9 rounded-lg border border-amber-800/40 bg-transparent px-2 font-medium"
        >
          {OPCOES.map((o) => <option key={o.perfil} value={o.perfil}>{o.rotulo}</option>)}
        </select>
        <button type="button" aria-label="Sair da demonstração" className="flex h-9 w-9 items-center justify-center" onClick={async () => { await sair(); window.location.href = "/" }}><X className="h-4 w-4" aria-hidden /></button>
      </div>

      <div className="mx-auto hidden flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-sm md:flex">
        <p className="flex items-center gap-2 font-medium">
          <FlaskConical className="h-4 w-4 shrink-0" aria-hidden />
          Demonstração: dados fictícios
        </p>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Ver o sistema como">
          <span>Ver como:</span>
          {OPCOES.map((o) => (
            <button
              key={o.perfil}
              type="button"
              aria-pressed={atual === o.perfil}
              onClick={() => trocar(o.perfil, o.rota)}
              className={`rounded-full border border-amber-800/40 px-3 py-1 font-medium dark:border-amber-100/40 ${atual === o.perfil ? "bg-amber-900 text-white dark:bg-amber-100 dark:text-amber-950" : "hover:bg-amber-200 dark:hover:bg-amber-800"}`}
            >
              {o.rotulo}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button type="button" className="flex items-center gap-1 underline-offset-2 hover:underline" onClick={() => { restaurarDadosDemo(); window.location.reload() }}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Restaurar dados
          </button>
          <button type="button" className="flex items-center gap-1 underline-offset-2 hover:underline" onClick={async () => { await sair(); window.location.href = "/" }}>
            <X className="h-3.5 w-3.5" aria-hidden /> Sair da demonstração
          </button>
        </div>
      </div>
    </div>
  )
}
