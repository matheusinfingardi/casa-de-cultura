"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth/auth-provider"
import PageHeader from "@/components/comum/page-header"
import { codigoDaPessoa, codigoCurto } from "@/lib/checkin"

export default function MeuQrPage() {
  const { user } = useAuth()
  const [img, setImg] = useState("")
  const nome = (user?.user_metadata?.nome as string | undefined) ?? user?.email

  useEffect(() => {
    if (user) QRCode.toDataURL(codigoDaPessoa(user.id), { width: 320, margin: 2 }).then(setImg)
  }, [user])

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader titulo="Meu QR Code" descricao="Mostre esta tela ao voluntário para registrar sua presença." migalhas={[{ label: "Início", href: "/painel" }, { label: "Meu QR Code" }]} />
      <div className="flex flex-col items-center gap-3 rounded-3xl border bg-card p-6 text-center shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img ? <img src={img} alt="Seu QR Code" className="h-72 w-72 rounded-xl bg-white" /> : <Skeleton className="h-72 w-72 rounded-xl" />}
        <p className="text-xl font-semibold">{nome}</p>
        {user && <p className="text-muted-foreground">Código: <span className="font-mono font-semibold text-foreground">{codigoCurto(user.id)}</span></p>}
      </div>
    </div>
  )
}
