"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Campo } from "@/components/comum/campo"
import PaginaSimples from "@/components/comum/pagina-simples"
import { pedirRecuperacaoSenha } from "@/lib/services/auth"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [ocupado, setOcupado] = useState(false)

  return (
    <PaginaSimples titulo="Esqueci minha senha" descricao="Enviaremos um link para você criar uma senha nova.">
      {enviado ? (
        <p role="status" className="rounded-xl bg-green-50 p-4 text-green-900 dark:bg-green-950 dark:text-green-100">
          Se este e-mail estiver cadastrado, a mensagem chega em alguns minutos. Confira também a caixa de spam.
        </p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setOcupado(true)
            await pedirRecuperacaoSenha(email)
            setOcupado(false)
            setEnviado(true)
          }}
        >
          <Campo label="E-mail do cadastro">
            {(p) => <Input {...p} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
          </Campo>
          <Button type="submit" className="w-full" disabled={ocupado}>{ocupado ? "Enviando..." : "Enviar link"}</Button>
        </form>
      )}
    </PaginaSimples>
  )
}
