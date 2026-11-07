"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { useDemo } from "@/hooks/use-demo"
import { buscarSeguranca } from "@/lib/services/extras"

/** Se a verificação em duas etapas estiver ativa, pede o código uma vez por sessão. */
export default function Exigir2fa() {
  const { user } = useAuth()
  const demo = useDemo()
  const router = useRouter()
  useEffect(() => {
    if (!demo || !user || sessionStorage.getItem("cc-2fa-ok")) return
    buscarSeguranca(user.id).then((s) => { if (s.totp_segredo) router.replace("/auth/verificacao") })
  }, [demo, user, router])
  return null
}
