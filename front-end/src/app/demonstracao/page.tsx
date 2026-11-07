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
    <PaginaSimples titulo="Demonstração" descricao="Conheça o sistema com dados de exemplo. Nada aqui afeta os dados reais." largura="max-w-5xl">
      <ul className="grid gap-5 md:grid-cols-3">
        {OPCOES.map((o) => (
          <li key={o.perfil} className="flex flex-col rounded-3xl border bg-card p-6 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><o.icon className="h-6 w-6" aria-hidden /></span>
            <h2 className="mt-4 text-xl font-semibold">{o.titulo}</h2>
            <p className="mt-1 flex-1 text-muted-foreground">{o.texto}</p>
            <Button className="mt-5 w-full" aria-label={`Entrar como ${o.titulo.toLowerCase()}`} onClick={() => { iniciarSessaoDemo(o.perfil); window.location.assign(o.rota) }}>Entrar sem senha</Button>
            <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div><dt className="text-muted-foreground">Ou faça login com o e-mail</dt><dd className="font-medium">{o.email}</dd></div>
              <div><dt className="text-muted-foreground">Senha</dt><dd className="font-medium">12345678</dd></div>
            </dl>
          </li>
        ))}
      </ul>
      <p className="flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-50"><FlaskConical className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /> Dentro da demonstração, a faixa amarela no topo troca de perfil e restaura os dados.</p>
    </PaginaSimples>
  )
}
