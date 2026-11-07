"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import AuthGuard from "@/components/auth/auth-guard"
import { useAuth } from "@/components/auth/auth-provider"
import Sino from "@/components/comum/sino"
import Tour from "@/components/comum/tour"
import NavPainel from "@/components/painel/nav-painel"
import { iniciais } from "@/lib/formatar"
import { ROLE_PERFIL } from "@/lib/perfis"
import { sair } from "@/lib/services/auth"
import { ROLE_LABELS } from "@/lib/services/usuarios"

function Corpo({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth()
  const router = useRouter()
  const nome = (user?.user_metadata?.nome as string | undefined) ?? user?.email ?? ""

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="nao-imprimir border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
          <Link href="/painel" className="flex min-w-0 items-center gap-3">
            <Image src="/logo-evailton.png" alt="" width={44} height={44} className="h-11 w-11 rounded-full bg-white object-contain" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-semibold">Casa de Cultura</span>
              <span className="block text-sm text-muted-foreground">{role ? ROLE_LABELS[role] : ""}</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Sino />
            <Link href="/painel/conta" aria-label="Minha conta" className="mx-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{iniciais(nome)}</Link>
            <Button variant="ghost" size="icon" aria-label="Sair" onClick={async () => { await sair(); router.push("/") }}><LogOut className="size-5" aria-hidden /></Button>
          </div>
        </div>
      </header>
      <NavPainel role={role} />
      <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      {role && <Tour perfil={ROLE_PERFIL[role]} />}
    </div>
  )
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allow={["cliente", "responsavel"]} redirectTo="/portal">
      <Corpo>{children}</Corpo>
    </AuthGuard>
  )
}
