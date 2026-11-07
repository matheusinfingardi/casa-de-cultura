"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import CertificadoEmitidoView from "@/components/comum/certificado-emitido"
import { listarItensView } from "@/lib/itens"

/** A pessoa vê os próprios certificados e os dos dependentes; o voluntário, também os das atividades dele. */
export default function CertificadoPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [meus, setMeus] = useState<string[] | null>(null)
  useEffect(() => {
    if (user) listarItensView().then((l) => setMeus(l.filter((i) => i.responsavel_id === user.id).map((i) => i.id)))
  }, [user])
  if (!user || meus === null) return null
  return <CertificadoEmitidoView id={id} podeVer={(c) => c.pessoa_id === user.id || c.responsavel_id === user.id || c.itens.some((i) => meus.includes(i.id))} />
}
