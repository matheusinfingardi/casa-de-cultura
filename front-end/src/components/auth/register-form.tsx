"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Campo } from "@/components/comum/campo"

interface Props {
  onSubmit: (nome: string, email: string, senha: string) => void
  loading: boolean
}

export default function RegisterForm({ onSubmit, loading }: Props) {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(nome, email, senha)
      }}
    >
      <Campo label="Nome">
        {(p) => <Input {...p} autoComplete="name" required placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />}
      </Campo>
      <Campo label="E-mail">
        {(p) => <Input {...p} type="email" autoComplete="email" required placeholder="Digite seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />}
      </Campo>
      <Campo label="Senha" dica="Use pelo menos 6 caracteres.">
        {(p) => <Input {...p} type="password" autoComplete="new-password" required minLength={6} placeholder="Crie uma senha" value={senha} onChange={(e) => setSenha(e.target.value)} />}
      </Campo>
      <Button type="submit" className="w-full h-11 cursor-pointer" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {loading ? "Cadastrando..." : "Criar Conta"}
      </Button>
    </form>
  )
}
