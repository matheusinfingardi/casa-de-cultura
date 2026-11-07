"use client"

import { Clock } from "lucide-react"
import { useDemo } from "@/hooks/use-demo"
import type { Perfil } from "@/lib/perfis"
import EstadoVazio from "./estado-vazio"

/**
 * Recursos que ainda dependem de novas tabelas no back-end só funcionam na demonstração.
 * Na conta real, mostram "Em breve" em vez de falhar.
 */
export default function SoDemo({ children }: { perfil?: Perfil; rota?: string; publico?: boolean; children: React.ReactNode }) {
  const demo = useDemo()
  if (demo) return <>{children}</>
  // Fora da demonstração, nada revela que ela existe.
  return <EstadoVazio icon={Clock} titulo="Em breve" texto="Este recurso estará disponível em breve. Enquanto isso, fale com a coordenação da Casa de Cultura." />
}
