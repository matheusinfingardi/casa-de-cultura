"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import CertificadosGestao from "@/components/comum/certificados-gestao"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import { listarItensView, type ItemView } from "@/lib/itens"

function Conteudo() {
  const { user } = useAuth()
  const [itens, setItens] = useState<ItemView[]>([])
  useEffect(() => { listarItensView().then(setItens) }, [])
  return <CertificadosGestao itens={itens} autor={(user?.user_metadata?.nome as string) ?? "Coordenação"} hrefVer={(id) => `/portal/certificados/${id}`} />
}

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader titulo="Certificados" descricao="Gere certificados de uma atividade ou de um conjunto delas, por presença ou por conjunto de presenças." migalhas={[{ label: "Gestão" }, { label: "Certificados" }]} />
      <SoDemo><Conteudo /></SoDemo>
    </div>
  )
}
