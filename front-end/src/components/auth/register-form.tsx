"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  onSubmit: (nome: string, email: string, senha: string) => void
  loading: boolean
}

export default function RegisterForm({ onSubmit, loading }: Props) {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nome</Label>
        <Input
          placeholder="Nome do administrador"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Senha</Label>
        <Input
          type="password"
          placeholder="Crie uma senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </div>
      <Button
        className="w-full h-11 cursor-pointer"
        onClick={() => onSubmit(nome, email, senha)}
        disabled={loading}
      >
        {loading ? "Cadastrando..." : "Criar Conta"}
      </Button>
    </div>
  )
}