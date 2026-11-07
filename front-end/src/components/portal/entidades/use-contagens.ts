"use client"

import { useEffect, useState } from "react"
import { contarInscritos, type ContagemItem } from "@/lib/services/presencas"

export function useContagens() {
  const [mapa, setMapa] = useState<Record<string, ContagemItem>>({})
  useEffect(() => { contarInscritos().then(setMapa) }, [])
  return (tipo: string, id: string): ContagemItem => mapa[`${tipo}-${id}`] ?? { total: 0, presentes: 0 }
}
