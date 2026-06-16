"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import AuthGuard from "@/components/auth/auth-guard"
import { useAuth } from "@/components/auth/auth-provider"
import { sair } from "@/lib/services/auth"
import { ROLE_LABELS } from "@/lib/services/usuarios"

function Header() {
  const { user, role } = useAuth()
  const router = useRouter()

  const nome = (user?.user_metadata?.nome as string | undefined) ?? user?.email ?? "Usuário"

  async function handleSair() {
    await sair()
    router.push("/auth?mode=login")
  }

  return (
    <header className="flex items-center justify-between border-b bg-background px-4 md:px-8 h-16">
      <Link href="/painel" className="flex items-center gap-3">
        <img
          src="/logo-evailton.png"
          alt="Casa de Cultura Evailton Vilela"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="leading-tight">
          <p className="text-sm font-semibold">Casa de Cultura</p>
          <p className="text-xs text-muted-foreground">
            {role ? ROLE_LABELS[role] : ""}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[180px]">
          {nome}
        </span>
        <button
          onClick={handleSair}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </header>
  )
}

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allow={["cliente", "responsavel"]} redirectTo="/portal">
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 p-4 md:p-10 max-w-4xl w-full mx-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
