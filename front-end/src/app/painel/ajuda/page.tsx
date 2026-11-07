"use client"

import Ajuda from "@/components/ajuda/ajuda"
import { useAuth } from "@/components/auth/auth-provider"
import { ROLE_PERFIL } from "@/lib/perfis"

export default function AjudaPainelPage() {
  const { role } = useAuth()
  return <Ajuda perfil={role ? ROLE_PERFIL[role] : "assistido"} />
}
