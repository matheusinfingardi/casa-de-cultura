"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import type { Role } from "@/lib/services/usuarios"

type Props = {
  children: React.ReactNode
  allow?: Role[]
  redirectTo?: string
}

export default function AuthGuard({
  children,
  allow = ["admin", "responsavel", "cliente"],
  redirectTo = "/",
}: Props) {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  const autorizado = !!user && !!role && allow.includes(role)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/auth?mode=login")
    } else if (!autorizado) {
      router.replace(redirectTo)
    }
  }, [loading, user, autorizado, redirectTo, router])

  if (loading || !autorizado) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return <>{children}</>
}
