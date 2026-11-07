"use client"

import { FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDemo } from "@/hooks/use-demo"
import { iniciarSessaoDemo } from "@/lib/demo/cliente"
import type { Perfil } from "@/lib/perfis"
import EstadoVazio from "./estado-vazio"

/**
 * Recursos que ainda dependem de novas tabelas no back-end funcionam na demonstração.
 * Na conta real, mostram este aviso em vez de falhar.
 */
export default function SoDemo({ perfil, rota, children }: { perfil: Perfil; rota: string; children: React.ReactNode }) {
  const demo = useDemo()
  if (demo) return <>{children}</>
  return (
    <EstadoVazio
      icon={FlaskConical}
      titulo="Este recurso ainda depende do back-end"
      texto="A tela está pronta, mas precisa de novas tabelas no banco. Você pode vê-la funcionando na demonstração, com dados fictícios."
      acao={<Button onClick={() => { iniciarSessaoDemo(perfil); window.location.href = rota }}>Abrir na demonstração</Button>}
    />
  )
}
