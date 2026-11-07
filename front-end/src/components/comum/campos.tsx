"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listarResponsaveis, type Usuario } from "@/lib/services/usuarios"
import { DIAS_SEMANA } from "@/lib/formatar"
import { resumoRecorrencia } from "@/lib/agenda"
import type { DiaSemana, Recorrencia } from "@/lib/tipos"
import { Campo } from "./campo"

const NENHUM = "__nenhum__"

type Aria = { id?: string; "aria-label"?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }

/** Select simples com lista de opções. O valor vazio ("") mostra o placeholder. */
export function CampoSelect({
  valor, onChange, opcoes, placeholder = "Selecione", desativado, ...aria
}: {
  valor: string
  desativado?: boolean
  onChange: (v: string) => void
  opcoes: { valor: string; label: string }[]
  placeholder?: string
} & Aria) {
  // preserva valores antigos do banco que não estão na lista
  const lista = valor && !opcoes.some((o) => o.valor === valor) ? [...opcoes, { valor, label: valor }] : opcoes
  return (
    <Select value={valor} onValueChange={onChange} disabled={desativado}>
      <SelectTrigger className="w-full" {...aria}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {lista.map((o) => <SelectItem key={o.valor} value={o.valor}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

/** Escolha do voluntário responsável. Opcional. */
export function CampoResponsavel({
  valorId, onChange, label = "Voluntário responsável",
}: {
  valorId: string | null
  onChange: (id: string | null, nome: string) => void
  label?: string
}) {
  const [lista, setLista] = useState<Usuario[] | null>(null)
  useEffect(() => { listarResponsaveis().then(setLista) }, [])

  return (
    <Campo
      label={label}
      dica={lista && lista.length === 0 ? undefined : "Quem poderá registrar a presença deste item no painel de voluntário."}
    >
      {(p) => (
        <>
          <CampoSelect
            {...p}
            valor={valorId ?? NENHUM}
            placeholder={lista ? "Selecione" : "Carregando…"}
            opcoes={[{ valor: NENHUM, label: "Sem responsável por enquanto" }, ...(lista ?? []).map((u) => ({ valor: u.id, label: u.nome ?? u.email ?? "Sem nome" }))]}
            onChange={(v) => {
              if (v === NENHUM) return onChange(null, "")
              const u = lista?.find((x) => x.id === v)
              onChange(v, u?.nome ?? u?.email ?? "")
            }}
          />
          {lista && lista.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Ainda não há voluntários. Defina o papel “Voluntário” a uma conta em{" "}
              <Link href="/portal/usuarios" className="text-primary underline">Usuários</Link>.
            </p>
          )}
        </>
      )}
    </Campo>
  )
}

/** Par início/fim com validação visual. */
export function CampoHorarios({
  inicio, fim, onChange, erroInicio, erroFim, rotuloInicio = "Início", rotuloFim = "Término",
}: {
  inicio: string
  fim: string
  onChange: (inicio: string, fim: string) => void
  erroInicio?: string
  erroFim?: string
  rotuloInicio?: string
  rotuloFim?: string
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Campo label={rotuloInicio} obrigatorio erro={erroInicio}>
        {(p) => <Input {...p} type="time" value={inicio} onChange={(e) => onChange(e.target.value, fim)} />}
      </Campo>
      <Campo label={rotuloFim} obrigatorio erro={erroFim}>
        {(p) => <Input {...p} type="time" value={fim} onChange={(e) => onChange(inicio, e.target.value)} />}
      </Campo>
    </div>
  )
}

/** "Acontece uma vez" ou "Toda semana", com horário por dia. */
export function CampoRecorrencia({
  valor, onChange, erros = {},
}: {
  valor: Recorrencia
  onChange: (r: Recorrencia) => void
  erros?: { data?: string; dias?: string; unica?: { inicio?: string; fim?: string }; semanal?: Partial<Record<DiaSemana, { inicio?: string; fim?: string }>> }
}) {
  const dias = valor.tipo === "Semanal" ? (Object.keys(valor.horarios) as DiaSemana[]) : []

  function trocarTipo(t: "Unica" | "Semanal") {
    if (t === valor.tipo) return
    onChange(t === "Unica" ? { tipo: "Unica", data: "", horarioInicio: "", horarioFim: "" } : { tipo: "Semanal", horarios: {} })
  }

  function alternarDia(d: DiaSemana) {
    if (valor.tipo !== "Semanal") return
    const h = { ...valor.horarios }
    if (h[d]) delete h[d]
    else {
      const ref = Object.values(h)[0]
      h[d] = ref ? { ...ref } : { horarioInicio: "", horarioFim: "" }
    }
    onChange({ tipo: "Semanal", horarios: h })
  }

  function definirHorario(d: DiaSemana, horarioInicio: string, horarioFim: string) {
    if (valor.tipo !== "Semanal") return
    onChange({ tipo: "Semanal", horarios: { ...valor.horarios, [d]: { horarioInicio, horarioFim } } })
  }

  function copiarParaTodos() {
    if (valor.tipo !== "Semanal" || !dias.length) return
    const ref = valor.horarios[dias[0]]!
    onChange({ tipo: "Semanal", horarios: Object.fromEntries(dias.map((d) => [d, { ...ref }])) })
  }

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Frequência <span className="text-red-600" aria-hidden>*</span></legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup">
          {([
            ["Unica", "Acontece uma vez", "Uma data específica"],
            ["Semanal", "Toda semana", "Escolha os dias e horários"],
          ] as const).map(([t, titulo, sub]) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={valor.tipo === t}
              onClick={() => trocarTipo(t)}
              className={`rounded-xl border p-3 text-left transition-colors ${valor.tipo === t ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted"}`}
            >
              <span className="block text-sm font-medium">{titulo}</span>
              <span className="block text-xs text-muted-foreground">{sub}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {valor.tipo === "Unica" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo label="Data" obrigatorio erro={erros.data}>
            {(p) => <Input {...p} type="date" value={valor.data} onChange={(e) => onChange({ ...valor, data: e.target.value })} />}
          </Campo>
          <div className="sm:col-span-2">
            <CampoHorarios
              inicio={valor.horarioInicio}
              fim={valor.horarioFim}
              erroInicio={erros.unica?.inicio}
              erroFim={erros.unica?.fim}
              onChange={(i, f) => onChange({ ...valor, horarioInicio: i, horarioFim: f })}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-sm font-medium">Dias da semana <span className="text-red-600" aria-hidden>*</span></p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Dias da semana">
              {DIAS_SEMANA.map((d) => (
                <Button key={d} type="button" size="sm" variant={valor.horarios[d] ? "default" : "outline"} aria-pressed={!!valor.horarios[d]} onClick={() => alternarDia(d)}>
                  {d.slice(0, 3)}
                </Button>
              ))}
            </div>
            {erros.dias && <p role="alert" className="mt-1.5 text-xs text-red-600">{erros.dias}</p>}
          </div>

          {dias.length > 0 && (
            <div className="space-y-3">
              {DIAS_SEMANA.filter((d) => valor.horarios[d]).map((d) => (
                <div key={d} className="rounded-xl border p-3">
                  <p className="mb-2 text-sm font-semibold">{d}</p>
                  <CampoHorarios
                    inicio={valor.horarios[d]!.horarioInicio}
                    fim={valor.horarios[d]!.horarioFim}
                    erroInicio={erros.semanal?.[d]?.inicio}
                    erroFim={erros.semanal?.[d]?.fim}
                    onChange={(i, f) => definirHorario(d, i, f)}
                  />
                </div>
              ))}
              {dias.length > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={copiarParaTodos}>
                  <Copy className="h-3.5 w-3.5" aria-hidden /> Usar o horário de {dias[0].toLowerCase()} em todos os dias
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Resumo: </span>{resumoRecorrencia(valor)}
      </p>
    </div>
  )
}
