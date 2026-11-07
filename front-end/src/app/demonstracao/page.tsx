"use client"

import { FlaskConical, HandHeart, HeartHandshake, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import PaginaSimples from "@/components/comum/pagina-simples"
import { iniciarSessaoDemo } from "@/lib/demo/cliente"
import type { Perfil } from "@/lib/perfis"

const OPCOES: { perfil: Perfil; titulo: string; texto: string; rota: string; email: string; icon: typeof HandHeart }[] = [
  { perfil: "assistido", titulo: "Assistido", texto: "Encontrar atividades, se inscrever e acompanhar a participação.", rota: "/painel", email: "assistido@assistido.com", icon: HeartHandshake },
  { perfil: "voluntario", titulo: "Voluntário", texto: "Ver os compromissos dia a dia e fazer a chamada.", rota: "/painel", email: "voluntario@voluntario.com", icon: HandHeart },
  { perfil: "admin", titulo: "Administração", texto: "Cadastrar, cuidar das pessoas e acompanhar resultados.", rota: "/portal", email: "admin@admin.com", icon: ShieldCheck },
]

/** Endereço não divulgado na página inicial. Passe só para quem vai testar. */
export default function DemonstracaoPage() {
  return (
    <PaginaSimples titulo="Demonstração" descricao="Conheça o sistema com dados de exemplo. Nada aqui afeta os dados reais." largura="max-w-3xl">
      <ul className="grid gap-4 md:grid-cols-3">
        {OPCOES.map((o) => (
          <li key={o.perfil} className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
            <o.icon className="h-7 w-7 text-primary" aria-hidden />
            <h2 className="text-lg font-semibold">{o.titulo}</h2>
            <p className="flex-1 text-muted-foreground">{o.texto}</p>
            <Button onClick={() => { iniciarSessaoDemo(o.perfil); window.location.assign(o.rota) }}>Entrar como {o.titulo.toLowerCase()}</Button>
            <p className="break-all text-sm text-muted-foreground">Ou no login: {o.email}, senha 12345678</p>
          </li>
        ))}
      </ul>
      <p className="flex gap-2 rounded-xl bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-50"><FlaskConical className="h-5 w-5 shrink-0" aria-hidden /> Uma faixa amarela no topo permite trocar de perfil e restaurar os dados.</p>
    </PaginaSimples>
  )
}
