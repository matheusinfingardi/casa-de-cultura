"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"
import { cadastrar, entrar } from "@/lib/services/auth"
import { buscarMeuPerfil } from "@/lib/services/usuarios"
import { traduzirErro } from "./traduzir-erro"
import { notify } from "@/lib/notify"
import { ArrowLeft } from "lucide-react"
import {
  PERFIL_INFO,
  ROLE_PERFIL,
  isPerfil,
  rotaInicial,
  type Perfil,
} from "@/lib/perfis"

type Mode = "login" | "register"

export default function AuthContainer() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [modoLocal, setMode] = useState<Mode | null>(null)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  const perfilParam = searchParams.get("perfil")
  const perfil: Perfil = isPerfil(perfilParam) ? perfilParam : "assistido"
  const info = PERFIL_INFO[perfil]

  const mode: Mode =
    modoLocal ?? (searchParams.get("mode") === "register" && info.podeCadastrar ? "register" : "login")

  async function handleLogin(email: string, senha: string) {
    setErro("")
    setLoading(true)
    try {
      const { error } = await entrar(email, senha)
      if (error) {
        setErro(traduzirErro(error.message))
        return
      }
      const perfilDoUsuario = await buscarMeuPerfil()
      const papel = perfilDoUsuario?.role ?? null
      if (papel && ROLE_PERFIL[papel] !== perfil) {
        notify.success(
          `Sua conta é de ${PERFIL_INFO[ROLE_PERFIL[papel]].titulo}. Levamos você para a área certa.`
        )
      }
      router.push(rotaInicial(papel))
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
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {info.titulo}
          </p>
          <h1 className="text-2xl font-bold">
            {mode === "register" ? "Criar cadastro" : "Entrar"}
          </h1>
          <p className="text-muted-foreground text-sm">{info.boasVindas}</p>
        </div>

        {info.podeCadastrar && (
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
        )}

        {mode === "register" && (
          <p className="text-xs text-center text-muted-foreground">
            O cadastro cria uma conta de <strong>Assistido</strong>.
          </p>
        )}

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

        {!info.podeCadastrar && (
          <p className="text-xs text-center text-muted-foreground">
            O acesso de {info.titulo.toLowerCase()} é criado pela equipe da Casa de Cultura.
          </p>
        )}

        <Link
          href="/"
          className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Escolher outro tipo de acesso
        </Link>
      </Card>
    </div>
  )
}