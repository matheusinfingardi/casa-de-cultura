"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import QRCode from "qrcode"
import { Printer, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth/auth-provider"
import EstadoVazio from "@/components/comum/estado-vazio"
import { ITEM_TIPO_LABELS, listarMinhasPresencas, type MinhaPresenca } from "@/lib/services/presencas"

export default function CertificadoPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [p, setP] = useState<MinhaPresenca | null | undefined>(undefined)
  const [qr, setQr] = useState("")
  const nome = (user?.user_metadata?.nome as string | undefined) ?? user?.email

  useEffect(() => {
    listarMinhasPresencas().then((l) => setP(l.find((x) => x.id === id && x.status === "presente") ?? null))
    QRCode.toDataURL(`${window.location.origin}/verificar/${id}`, { width: 140, margin: 1 }).then(setQr)
  }, [id])

  if (p === undefined) return <Skeleton className="h-96 rounded-2xl" />
  if (!p) return <EstadoVazio icon={SearchX} titulo="Certificado indisponível" texto="O certificado aparece depois que sua presença é confirmada." />

  return (
    <div className="space-y-4">
      <div className="nao-imprimir flex justify-end"><Button onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden /> Imprimir ou salvar PDF</Button></div>
      <article className="mx-auto max-w-3xl space-y-6 rounded-3xl border-4 border-primary bg-white p-8 text-center text-slate-900 md:p-14">
        <Image src="/logo-evailton.png" alt="Casa de Cultura Evailton Vilela" width={96} height={96} className="mx-auto h-24 w-24" />
        <h1 className="text-3xl font-bold md:text-4xl">Certificado de participação</h1>
        <p className="text-lg leading-relaxed">
          Certificamos que <strong className="text-xl">{nome}</strong> participou de{" "}
          <strong className="text-xl">{p.item_nome}</strong> ({ITEM_TIPO_LABELS[p.item_tipo].toLowerCase()}), promovido pela Casa de Cultura Evailton Vilela.
        </p>
        <p>Juiz de Fora, {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {qr && <img src={qr} alt="QR Code para verificar este certificado" className="mx-auto h-28 w-28" />}
        <p className="text-sm text-slate-600">Código de verificação: {id}</p>
      </article>
    </div>
  )
}
