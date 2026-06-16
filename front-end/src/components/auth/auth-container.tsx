"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"
import { cadastrar, entrar } from "@/lib/services/auth"

type Mode = "login" | "register"

function traduzirErro(mensagem: string): string {
  const msg = mensagem.toLowerCase()
  if (msg.includes("invalid login credentials")) return "E-mail ou senha incorretos"
  if (msg.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar"
  if (msg.includes("user already registered")) return "E-mail já cadastrado"
  if (msg.includes("password should be at least")) return "A senha é muito curta"
  if (msg.includes("unable to validate email address") || msg.includes("invalid email"))
    return "E-mail inválido"
  if (msg.includes("email rate limit") || msg.includes("rate limit"))
    return "Muitas tentativas. Tente novamente em alguns minutos."
  return mensagem || "Ocorreu um erro. Tente novamente."
}

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
      const { error } = await entrar(email, senha)
      if (error) {
        setErro(traduzirErro(error.message))
        return
      }
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
      const { error } = await cadastrar(nome, email, senha)
      if (error) {
        setErro(traduzirErro(error.message))
        return
      }
      setMode("login")
      setErro("✅ Conta criada! Verifique seu e-mail para confirmar antes de entrar.")
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