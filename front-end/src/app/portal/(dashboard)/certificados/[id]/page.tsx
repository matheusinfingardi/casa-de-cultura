"use client"

import { useParams } from "next/navigation"
import CertificadoEmitidoView from "@/components/comum/certificado-emitido"
import PageHeader from "@/components/comum/page-header"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-6">
      <PageHeader titulo="Certificado" migalhas={[{ label: "Certificados", href: "/portal/certificados" }, { label: "Ver" }]} />
      <CertificadoEmitidoView id={id} podeVer={() => true} />
    </div>
  )
}
