"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"
import { cadastrar, entrar } from "@/lib/services/auth"
import { buscarMeuPerfil } from "@/lib/services/usuarios"
import { traduzirErro } from "./traduzir-erro"
import { notify } from "@/lib/notify"
import { PERFIL_INFO, ROLE_PERFIL, isPerfil, rotaInicial, type Perfil } from "@/lib/perfis"

type Mode = "login" | "register"
const MAX_TENTATIVAS = 5
const ESPERA_MS = 60_000

export default function AuthContainer() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [modoLocal, setMode] = useState<Mode | null>(null)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [loading, setLoading] = useState(false)
  const [tentativas, setTentativas] = useState(0)
  const [bloqueadoAte, setBloqueadoAte] = useState(0)

  const perfilParam = searchParams.get("perfil")
  const perfil: Perfil = isPerfil(perfilParam) ? perfilParam : "assistido"
  const info = PERFIL_INFO[perfil]
  const mode: Mode = modoLocal ?? (searchParams.get("mode") === "register" && info.podeCadastrar ? "register" : "login")

  async function handleLogin(email: string, senha: string) {
    setErro(""); setSucesso("")
    if (Date.now() < bloqueadoAte) {
      setErro(`Muitas tentativas. Aguarde ${Math.ceil((bloqueadoAte - Date.now()) / 1000)} segundos e tente de novo.`)
      return
    }
    setLoading(true)
    try {
      const resultado = await entrar(email, senha)
      if ("demonstracao" in resultado) {
        const dadosDemo = await buscarMeuPerfil()
        window.location.assign(rotaInicial(dadosDemo?.role))
        return
      }
      const { error } = resultado
      if (error) {
        const t = tentativas + 1
        setTentativas(t)
        if (t >= MAX_TENTATIVAS) { setBloqueadoAte(Date.now() + ESPERA_MS); setTentativas(0) }
        setErro(traduzirErro(error.message))
        return
      }
      const dados = await buscarMeuPerfil()
      const papel = dados?.role ?? null
      if (papel && ROLE_PERFIL[papel] !== perfil) {
        notify.success(`Sua conta é de ${PERFIL_INFO[ROLE_PERFIL[papel]].titulo}. Levamos você para a área certa.`)
      }
      router.push(rotaInicial(papel))
    } catch {
      setErro("Não foi possível conectar ao servidor. Verifique sua internet e tente de novo.")
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(nome: string, email: string, senha: string) {
    setErro(""); setSucesso("")
    setLoading(true)
    try {
      const { error } = await cadastrar(nome, email, senha)
      if (error) { setErro(traduzirErro(error.message)); return }
      setMode("login")
      setSucesso("Conta criada! Agora é só entrar.")
    } catch {
      setErro("Não foi possível conectar ao servidor. Verifique sua internet e tente de novo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md space-y-5 p-6 md:p-8">
        <div className="flex justify-center">
          <Link href="/" aria-label="Voltar ao início">
            <Image src="/logo-evailton.png" alt="Casa de Cultura Evailton Vilela" width={112} height={112} className="h-24 w-24 rounded-full bg-white" />
          </Link>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">{info.titulo}</p>
          <h1 className="text-2xl font-bold">{mode === "register" ? "Criar cadastro" : "Entrar"}</h1>
          <p className="text-sm text-muted-foreground">{info.boasVindas}</p>
        </div>

        {info.podeCadastrar && (
          <div className="grid grid-cols-2 gap-2">
            <Button variant={mode === "login" ? "default" : "outline"} onClick={() => { setMode("login"); setErro(""); setSucesso("") }}>Entrar</Button>
            <Button variant={mode === "register" ? "default" : "outline"} onClick={() => { setMode("register"); setErro(""); setSucesso("") }}>Cadastrar</Button>
          </div>
        )}

        {erro && <p role="alert" className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-800 dark:bg-red-950 dark:text-red-100">{erro}</p>}
        {sucesso && <p role="status" className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-800 dark:bg-green-950 dark:text-green-100">{sucesso}</p>}

        {mode === "login" ? <LoginForm onSubmit={handleLogin} loading={loading} /> : <RegisterForm onSubmit={handleRegister} loading={loading} />}

        {mode === "login" && (
          <p className="text-center text-sm">
            <Link href="/auth/esqueci-senha" className="font-medium text-primary hover:underline">Esqueci minha senha</Link>
          </p>
        )}
        {!info.podeCadastrar && (
          <p className="text-center text-sm text-muted-foreground">
            O acesso de {info.titulo.toLowerCase()} é criado pela equipe da Casa de Cultura.
            {perfil === "voluntario" && <> <Link href="/quero-ser-voluntario" className="font-medium text-primary hover:underline">Quero ser voluntário</Link></>}
          </p>
        )}

        <Link href="/" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar ao início
        </Link>
      </Card>
    </div>
  )
}
