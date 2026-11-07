"use client"

import { useId, useState } from "react"
import Link from "next/link"
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
  const [aceite, setAceite] = useState(false)
  // Pergunta simples contra robôs. Deriva de useId para ser igual no servidor e no navegador.
  const semente = [...useId()].reduce((t, c) => t + c.charCodeAt(0), new Date().getDate())
  const conta = { a: 2 + (semente % 7), b: 1 + (semente % 5) }
  const [resposta, setResposta] = useState("")
  const [erros, setErros] = useState<{ aceite?: string; conta?: string }>({})

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        const novos = {
          aceite: aceite ? undefined : "É preciso aceitar para criar a conta",
          conta: Number(resposta) === conta.a + conta.b ? undefined : "Resposta incorreta. Tente de novo",
        }
        setErros(novos)
        if (!novos.aceite && !novos.conta) onSubmit(nome, email, senha)
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
      <Campo label={`Para confirmar que você é uma pessoa: quanto é ${conta.a} + ${conta.b}?`} erro={erros.conta}>
        {(p) => <Input {...p} inputMode="numeric" required value={resposta} onChange={(e) => setResposta(e.target.value)} />}
      </Campo>
      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1 h-4 w-4" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
          <span>
            Li e aceito os <Link href="/termos" target="_blank" className="font-medium text-primary underline">termos de uso</Link> e a{" "}
            <Link href="/privacidade" target="_blank" className="font-medium text-primary underline">política de privacidade</Link>.
          </span>
        </label>
        {erros.aceite && <p role="alert" className="mt-1 text-sm text-red-600">{erros.aceite}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {loading ? "Cadastrando..." : "Criar conta"}
      </Button>
    </form>
  )
}
