"use client"

import { useCallback, useEffect, useState } from "react"
import { useDemo } from "@/hooks/use-demo"
import { idade } from "@/lib/assiduidade"
import { cuidadosDaFamilia, cuidadosDaPessoa, resumoFamilia, type CuidadoFamiliar } from "@/lib/familia"
import { listarFichas, listarTodosDependentes, type Dependente, type Ficha } from "@/lib/services/extras"

export type InfoPessoa = { subtitulo: string; familia: string | null; cuidados: string[]; cuidadosFamilia: CuidadoFamiliar[] }

/** Junta ficha e família para mostrar quem é cada inscrito. Fora da demonstração, as tabelas ainda não existem. */
export function usePessoasInfo({ comSaude = true } = {}) {
  const demo = useDemo()
  const [fichas, setFichas] = useState<Ficha[]>([])
  const [deps, setDeps] = useState<Dependente[]>([])
  useEffect(() => {
    if (!demo) return
    listarFichas().then(setFichas)
    listarTodosDependentes().then(setDeps)
  }, [demo])
  return useCallback((id: string): InfoPessoa => {
    const dep = deps.find((d) => d.id === id)
    if (dep) {
      const a = idade(dep.nascimento)
      return { subtitulo: ["Dependente", a !== null ? `${a} anos` : ""].filter(Boolean).join(" · "), familia: null, cuidados: [dep.deficiencia, dep.cuidados].filter(Boolean) as string[], cuidadosFamilia: [] }
    }
    const f = fichas.find((x) => x.id === id)
    const dele = deps.filter((d) => d.responsavel_id === id)
    const anos = idade(f?.nascimento)
    return {
      subtitulo: [anos !== null ? `${anos} anos` : "", f?.bairro ?? ""].filter(Boolean).join(" · "),
      familia: resumoFamilia(dele),
      cuidados: cuidadosDaPessoa(f, { comSaude }),
      cuidadosFamilia: cuidadosDaFamilia(dele),
    }
  }, [fichas, deps, comSaude])
}
