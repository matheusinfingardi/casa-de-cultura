"use client"

import { useEffect, useState } from "react"

import AuthGuard from "@/components/auth/auth-guard"
import { useAuth } from "@/components/auth/auth-provider"
import UsuariosTable from "@/components/portal/usuarios/usuarios-table"
import {
  listarUsuarios,
  atualizarRole,
  type Role,
  type Usuario,
} from "@/lib/services/usuarios"

function UsuariosDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<Usuario[]>([])

  async function carregarUsuarios() {
    const usuarios = await listarUsuarios()
    setData(usuarios)
  }

  useEffect(() => {
    carregarUsuarios()
  }, [])

  async function handleChangeRole(id: string, role: Role) {
    const anterior = data
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, role } : item))
    )

    try {
      await atualizarRole(id, role)
    } catch (error) {
      console.error("Erro ao atualizar papel:", error)
      // erro exibido via toast
      setData(anterior)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-muted-foreground text-sm">
          Defina o papel de cada usuário do sistema.
        </p>
      </div>
      <UsuariosTable
        data={data}
        currentUserId={user?.id}
        onChangeRole={handleChangeRole}
      />
    </div>
  )
}

export default function UsuariosPage() {
  return (
    <AuthGuard allow={["admin"]} redirectTo="/painel">
      <UsuariosDashboard />
    </AuthGuard>
  )
}
