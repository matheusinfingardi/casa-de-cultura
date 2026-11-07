"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  onSubmit: (email: string, senha: string) => void
  loading: boolean
}

export default function LoginForm({ onSubmit, loading }: Props) {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(email, senha)
      }}
    >
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          autoComplete="email"
          required
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Senha</Label>
        <Input
          type="password"
          autoComplete="current-password"
          required
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </div>
      <Button
        className="w-full h-11 cursor-pointer"
        type="submit"
        disabled={loading}
      >
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  )
}