"use client"

import { useState } from "react"
import Link from "next/link"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cadastrarAdmin } from "@/lib/services/auth"
import { traduzirErro } from "@/components/auth/traduzir-erro"

export default function AdminSignupPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setMsg("")
    setLoading(true)
    try {
      const { error } = await cadastrarAdmin(nome, email, senha)
      if (error) {
        setMsg(traduzirErro(error.message))
        return
      }
      setNome("")
      setEmail("")
      setSenha("")
      setMsg("✅ Admin criado! Você já pode fazer login.")
    } catch {
      setMsg("Erro de conexão com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex justify-center">
          <Link href="/">
            <img
              src="/logo-evailton.png"
              alt="Casa de Cultura Evailton Vilela"
              className="w-32 md:w-40 rounded-full"
            />
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Cadastro de Administrador</h1>
          <p className="text-muted-foreground text-sm">
            Cria uma conta com papel de administrador.
          </p>
        </div>

        {msg && (
          <p
            className={`text-sm text-center ${
              msg.includes("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {msg}
          </p>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              placeholder="Seu nome"
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
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Criar Administrador"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/auth?mode=login" className="text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </Card>
    </main>
  )
}
