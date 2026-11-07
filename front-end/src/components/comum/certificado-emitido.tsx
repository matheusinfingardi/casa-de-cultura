"use client"

import { useEffect, useState } from "react"
import { SearchX } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import EstadoVazio from "@/components/comum/estado-vazio"
import ModeloCertificado from "@/components/comum/modelo-certificado"
import { horasEmTexto } from "@/lib/certificados"
import { dataBR } from "@/lib/formatar"
import { listarCertificados, type CertificadoEmitido } from "@/lib/services/certificados"

const TIPO: Record<string, string> = { evento: "do evento", oficina: "da oficina", atividade: "da atividade", assistencia: "do atendimento", centro: "de" }
const juntar = (l: string[]) => (l.length < 2 ? l[0] ?? "" : `${l.slice(0, -1).join(", ")} e ${l[l.length - 1]}`)

/** Mostra um certificado já gerado, depois de conferir se a pessoa pode vê-lo. */
export default function CertificadoEmitidoView({ id, podeVer }: { id: string; podeVer: (c: CertificadoEmitido) => boolean }) {
  const [c, setC] = useState<CertificadoEmitido | null | undefined>(undefined)
  useEffect(() => { listarCertificados().then((l) => setC(l.find((x) => x.id === id) ?? null)) }, [id])

  if (c === undefined) return <Skeleton className="h-96 rounded-2xl" />
  if (!c || !podeVer(c)) return <EstadoVazio icon={SearchX} titulo="Certificado indisponível" texto="Ele não existe ou não pertence à sua conta." />

  const datas = [...c.datas].sort()
  const n = datas.length
  const voluntario = c.papel === "voluntario"
  const nomes = c.itens.map((i) => i.nome)
  const umItem = c.itens.length === 1
  const quando = n === 1 ? <>em {dataBR(datas[0])}</> : <>entre {dataBR(datas[0])} e {dataBR(datas[n - 1])}</>
  return (
    <ModeloCertificado titulo={voluntario ? "Certificado de Trabalho Voluntário" : "Certificado de Participação"} nome={c.pessoa_nome} area={umItem ? c.titulo : "Conjunto de atividades"} codigo={c.id}>
      {voluntario ? "atuou como voluntário(a)" : "participou"}{" "}
      {umItem ? <>{voluntario ? "na condução " : ""}{TIPO[c.itens[0].tipo] ?? "de"} <strong>{nomes[0]}</strong></> : <>{voluntario ? "na condução de" : "de"} <strong>{c.titulo}</strong>, que reúne {juntar(nomes)}</>}
      , {voluntario ? "conduzindo" : "comparecendo a"} <strong>{n} {n === 1 ? "encontro" : "encontros"}</strong>
      {c.horas > 0 && <>, totalizando <strong>{horasEmTexto(c.horas)}</strong></>}, {quando}, uma iniciativa da Casa de Cultura Evailton Vilela.
    </ModeloCertificado>
  )
}
