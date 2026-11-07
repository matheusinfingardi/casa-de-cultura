"use client"

export type AbaItem = "geral" | "inscritos" | "diario" | "certificados"

/** Abas da página de um item, compartilhadas pela administração e pelo voluntário. */
export default function AbasItem({ abas, atual, onChange }: { abas: [AbaItem, string][]; atual: AbaItem; onChange: (a: AbaItem) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b" role="tablist" aria-label="Partes desta página">
      {abas.map(([v, r]) => (
        <button key={v} type="button" role="tab" aria-selected={atual === v} onClick={() => onChange(v)} className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 font-medium ${atual === v ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{r}</button>
      ))}
    </div>
  )
}

export const lerAba = (v: string | null, abas: [AbaItem, string][]): AbaItem => abas.find(([a]) => a === v)?.[0] ?? "geral"
