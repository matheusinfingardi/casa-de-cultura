"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"

type Mode = "login" | "register"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function AuthContainer() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const urlMode = searchParams.get("mode")
    if (urlMode === "register") {
      setMode("register")
    } else {
      setMode("login")
    }
  }, [searchParams])

  async function handleLogin(email: string, senha: string) {
    setErro("")
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.detail || "Erro ao fazer login")
        return
      }
      localStorage.setItem("user", JSON.stringify(data.user))
      router.push("/portal")
    } catch {
      setErro("Erro de conexão com o servidor")
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(nome: string, email: string, senha: string) {
    setErro("")
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, password: senha }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.detail || "Erro ao cadastrar")
        return
      }
      setMode("login")
      setErro("✅ Conta criada! Faça login para continuar.")
    } catch {
      setErro("Erro de conexão com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex justify-center">
          <Link href="/">
            <img
              src="/logo-evailton.png"
              alt="Casa de Cultura Evailton Vilela"
              className="w-40 md:w-56 rounded-full"
            />
          </Link>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Portal Administrativo</h1>
          <p className="text-muted-foreground text-sm">
            Casa de Cultura Evailton Vilela
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            className="cursor-pointer"
            variant={mode === "login" ? "default" : "outline"}
            onClick={() => { setMode("login"); setErro("") }}
          >
            Entrar
          </Button>
          <Button
            className="cursor-pointer"
            variant={mode === "register" ? "default" : "outline"}
            onClick={() => { setMode("register"); setErro("") }}
          >
            Cadastrar
          </Button>
        </div>

        {erro && (
          <p className={`text-sm text-center ${erro.includes("✅") ? "text-green-600" : "text-red-500"}`}>
            {erro}
          </p>
        )}

        {mode === "login" ? (
          <LoginForm onSubmit={handleLogin} loading={loading} />
        ) : (
          <RegisterForm onSubmit={handleRegister} loading={loading} />
        )}
      </Card>
    </div>
  )
}