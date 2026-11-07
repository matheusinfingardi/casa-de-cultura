"use client"

import { useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useDemo } from "@/hooks/use-demo"
import { ehDemo } from "@/lib/demo/modo"
import { notify } from "@/lib/notify"
import type { Extras } from "@/lib/tipos"
import { useUnidade } from "@/components/portal/unidade"
import { Campo, Secao } from "./campo"
import { CampoSelect } from "./campos"

/** Só entram no formulário na demonstração: o banco real ainda não tem estas colunas. */
export function extrasIniciais(item?: Extras, comUnidade = true): Extras {
  if (!ehDemo()) return {}
  return { descricao: item?.descricao ?? "", imagem_url: item?.imagem_url ?? "", endereco_mapa: item?.endereco_mapa ?? "", ...(comUnidade ? { centro_id: item?.centro_id ?? "" } : {}) }
}

/** A foto é obrigatória onde a coluna existe (na demonstração, por enquanto). */
export function erroFoto(v: Extras): string | undefined {
  return "imagem_url" in v && !v.imagem_url ? "Escolha uma foto: ela aparece para quem vai se inscrever" : undefined
}

/** Reduz a foto no navegador para não pesar. */
function reduzirImagem(arquivo: File, maximo = 1000): Promise<string> {
  return new Promise((ok, falha) => {
    const img = new window.Image()
    img.onload = () => {
      const f = Math.min(1, maximo / Math.max(img.width, img.height))
      const c = document.createElement("canvas")
      c.width = img.width * f
      c.height = img.height * f
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(img.src)
      ok(c.toDataURL("image/jpeg", 0.75))
    }
    img.onerror = falha
    img.src = URL.createObjectURL(arquivo)
  })
}

export default function CamposExtras({
  valores, definir, comUnidade = true, erroImagem,
}: {
  valores: Extras
  definir: (campo: "descricao" | "imagem_url" | "centro_id" | "endereco_mapa", valor: string) => void
  comUnidade?: boolean
  erroImagem?: string
}) {
  const demo = useDemo()
  const { centros } = useUnidade()
  const input = useRef<HTMLInputElement>(null)
  if (!demo) return null

  return (
    <Secao titulo="Apresentação" descricao="Foto e texto aparecem na página do item e para quem vai se inscrever.">
      <Campo label="Descrição" dica="Em uma ou duas frases, conte do que se trata.">
        {(p) => <Textarea {...p} rows={3} value={valores.descricao ?? ""} onChange={(e) => definir("descricao", e.target.value)} />}
      </Campo>
      {comUnidade && centros.length > 0 && (
        <Campo label="Unidade">
          {(p) => <CampoSelect {...p} valor={valores.centro_id ?? ""} opcoes={centros.map((c) => ({ valor: c.id, label: c.nome }))} onChange={(v) => definir("centro_id", v)} />}
        </Campo>
      )}
      {comUnidade && (
        <Campo label="Endereço para o mapa" dica="Opcional. Se ficar vazio, usamos o endereço da unidade.">
          {(p) => <Input {...p} value={valores.endereco_mapa ?? ""} placeholder="Ex.: Parque Halfeld, Juiz de Fora - MG" onChange={(e) => definir("endereco_mapa", e.target.value)} />}
        </Campo>
      )}
      <div className="space-y-2">
        <p className="text-sm font-medium">Foto <span className="text-red-600" aria-hidden>*</span><span className="sr-only">(obrigatório)</span></p>
        {valores.imagem_url ? (
          <div className="relative overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={valores.imagem_url} alt="Foto escolhida" className="h-48 w-full object-cover" />
            <Button type="button" size="icon-sm" variant="secondary" className="absolute right-2 top-2" aria-label="Remover foto" onClick={() => definir("imagem_url", "")}><X className="h-4 w-4" /></Button>
          </div>
        ) : (
          <Button type="button" variant="outline" aria-invalid={erroImagem ? true : undefined} onClick={() => input.current?.click()}><ImagePlus className="h-4 w-4" aria-hidden /> Escolher foto</Button>
        )}
        {erroImagem && <p role="alert" className="text-xs text-red-600">{erroImagem}</p>}
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="Escolher foto"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            try { definir("imagem_url", await reduzirImagem(f)) } catch { notify.error("Não foi possível abrir esta imagem") }
          }}
        />
      </div>
    </Secao>
  )
}
