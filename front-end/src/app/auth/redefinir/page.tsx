"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Campo } from "@/components/comum/campo"
import PaginaSimples from "@/components/comum/pagina-simples"
import { alterarSenha } from "@/lib/services/auth"
import { notify } from "@/lib/notify"

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")

  return (
    <PaginaSimples titulo="Criar nova senha">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          if (senha.length < 6) return setErro("Use pelo menos 6 caracteres")
          const { error } = await alterarSenha(senha)
          if (error) return setErro("O link expirou. Peça um novo em “Esqueci minha senha”.")
          notify.success("Senha alterada")
          router.push("/auth")
        }}
      >
        <Campo label="Nova senha" erro={erro}>
          {(p) => <Input {...p} type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />}
        </Campo>
        <Button type="submit" className="w-full">Salvar senha</Button>
      </form>
    </PaginaSimples>
  )
}
