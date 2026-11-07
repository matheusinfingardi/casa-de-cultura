"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useDemo } from "@/hooks/use-demo"
import { centrosApi } from "@/lib/services/entidades"
import type { Centro } from "@/lib/tipos"

type Valor = {
  unidade: string
  definir: (id: string) => void
  centros: Centro[]
  filtrar: <T>(itens: T[]) => T[]
}

const Ctx = createContext<Valor>({ unidade: "", definir: () => {}, centros: [], filtrar: (i) => i })

/** Filtro global por unidade (centro). Usa a coluna centro_id, disponível na demonstração. */
export function UnidadeProvider({ children }: { children: React.ReactNode }) {
  const demo = useDemo()
  const [unidade, setUnidade] = useState("")
  const [centros, setCentros] = useState<Centro[]>([])

  useEffect(() => {
    if (demo) centrosApi.listar().then(setCentros)
  }, [demo])

  const filtrar = useCallback(
    <T,>(itens: T[]) => (unidade ? itens.filter((i) => (i as { centro_id?: string; id?: string }).centro_id === unidade || (i as { id?: string }).id === unidade) : itens),
    [unidade]
  )
  const valor = useMemo(() => ({ unidade, definir: setUnidade, centros, filtrar }), [unidade, centros, filtrar])
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export const useUnidade = () => useContext(Ctx)
