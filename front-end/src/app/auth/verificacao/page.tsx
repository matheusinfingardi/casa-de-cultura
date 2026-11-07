"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { Campo } from "@/components/comum/campo"
import PaginaSimples from "@/components/comum/pagina-simples"
import { buscarSeguranca } from "@/lib/services/extras"
import { validarTotp } from "@/lib/totp"

export default function VerificacaoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [codigo, setCodigo] = useState("")
  const [erro, setErro] = useState("")

  return (
    <PaginaSimples titulo="Verificação em duas etapas" descricao="Digite o código de 6 números do seu aplicativo autenticador.">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!user) return
          const s = await buscarSeguranca(user.id)
          if (s.totp_segredo && (await validarTotp(s.totp_segredo, codigo))) {
            sessionStorage.setItem("cc-2fa-ok", "1")
            router.replace("/portal")
          } else setErro("Código incorreto. Tente o próximo que aparecer no aplicativo.")
        }}
      >
        <Campo label="Código" erro={erro}>{(p) => <Input {...p} inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus value={codigo} onChange={(e) => setCodigo(e.target.value)} />}</Campo>
        <Button type="submit" className="w-full">Confirmar</Button>
      </form>
    </PaginaSimples>
  )
}
