"use client"

import { Input } from "@/components/ui/input"

const separar = (v: string) => v.split(",").map((x) => x.trim()).filter(Boolean)

/** Opções prontas para marcar e um campo para o que não estiver na lista. O valor é guardado como texto, separado por vírgulas. */
export default function EscolhaMultipla({ titulo, dica, opcoes, valor, onChange, rotuloOutro = "Outro" }: { titulo: string; dica?: string; opcoes: string[]; valor: string; onChange: (v: string) => void; rotuloOutro?: string }) {
  const marcados = separar(valor)
  const outros = marcados.filter((m) => !opcoes.includes(m)).join(", ")
  const prontos = marcados.filter((m) => opcoes.includes(m))
  const juntar = (lista: string[], resto: string) => [...lista, ...separar(resto)].join(", ")
  return (
    <fieldset className="space-y-2">
      <legend className="font-medium">{titulo}</legend>
      {dica && <p className="text-sm text-muted-foreground">{dica}</p>}
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => {
          const on = prontos.includes(o)
          return (
            <button key={o} type="button" aria-pressed={on} onClick={() => onChange(juntar(on ? prontos.filter((x) => x !== o) : [...prontos, o], outros))}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>{o}</button>
          )
        })}
      </div>
      <Input aria-label={`${titulo}: ${rotuloOutro.toLowerCase()}`} placeholder={`${rotuloOutro} (escreva aqui)`} defaultValue={outros} key={outros} onBlur={(e) => onChange(juntar(prontos, e.target.value))} />
    </fieldset>
  )
}

export const OPCOES_CONDICAO = ["Deficiência visual", "Deficiência auditiva", "Mobilidade reduzida", "Deficiência intelectual", "Transtorno do espectro autista", "TDAH"]
export const OPCOES_ACESSIBILIDADE = ["Rampa e sala no térreo", "Banheiro adaptado", "Letras ampliadas", "Lugar perto da frente", "Intérprete de Libras", "Ambiente com pouco barulho", "Precisa de acompanhante"]
