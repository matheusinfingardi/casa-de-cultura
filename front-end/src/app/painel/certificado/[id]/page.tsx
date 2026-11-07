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
import { useDemo } from "@/hooks/use-demo"
import { dataBR, paraData } from "@/lib/formatar"
import { carregarItem, datasDoItem } from "@/lib/itens"
import { registrosDaPessoa } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, listarMinhasPresencas, type MinhaPresenca } from "@/lib/services/presencas"

const minutos = (h: string) => { const [a, b] = h.split(":").map(Number); return a * 60 + (b || 0) }

export default function CertificadoPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const demo = useDemo()
  const [p, setP] = useState<MinhaPresenca | null | undefined>(undefined)
  const [qr, setQr] = useState("")
  const [resumo, setResumo] = useState<{ encontros: number; horas: number; de: string; ate: string } | null>(null)
  const nome = (user?.user_metadata?.nome as string | undefined) ?? user?.email

  useEffect(() => {
    listarMinhasPresencas().then((l) => setP(l.find((x) => x.id === id && x.status === "presente") ?? null))
    QRCode.toDataURL(`${window.location.origin}/verificar/${id}`, { width: 160, margin: 1 }).then(setQr)
  }, [id])

  // Só afirma encontros e horas quando existem registros reais de presença.
  useEffect(() => {
    if (!demo || !p || !user) return
    ;(async () => {
      const presentes = (await registrosDaPessoa(user.id)).filter((r) => r.item_id === p.item_id && r.status === "presente").map((r) => r.data).sort()
      if (!presentes.length) return
      const item = await carregarItem(p.item_tipo, p.item_id)
      const datas = item ? datasDoItem(item, 400, 0) : []
      const total = presentes.reduce((s, d) => {
        const o = datas.find((x) => x.data === d)
        return s + (o?.inicio && o.fim ? minutos(o.fim) - minutos(o.inicio) : 0)
      }, 0)
      setResumo({ encontros: presentes.length, horas: Math.round(total / 30) / 2, de: presentes[0], ate: presentes[presentes.length - 1] })
    })()
  }, [demo, p, user])

  if (p === undefined) return <Skeleton className="h-96 rounded-2xl" />
  if (!p) return <EstadoVazio icon={SearchX} titulo="Certificado indisponível" texto="O certificado aparece depois que sua presença é confirmada." />

  const hoje = new Date()

  return (
    <div className="space-y-4">
      <style>{`@media print { @page { size: A4 landscape; margin: 0 } .certificado { width: 297mm !important; height: 209mm !important; max-width: none !important; border-radius: 0 !important; box-shadow: none !important; margin: 0 !important; aspect-ratio: auto !important } }`}</style>
      <div className="nao-imprimir flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">No computador, escolha “Salvar como PDF” na janela de impressão.</p>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden /> Imprimir ou salvar PDF</Button>
      </div>

      <article className="certificado mx-auto aspect-[297/210] w-full max-w-5xl overflow-hidden rounded-xl bg-white text-slate-900 shadow-lg" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
        <div className="relative flex h-full flex-col p-[2.2%]">
          <div className="absolute inset-x-0 top-0 h-[2.2%] bg-[#0b3aa8]" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 h-[2.2%] bg-[#f59e0b]" aria-hidden />
          <div className="flex h-full flex-col items-center justify-between border-2 border-[#0b3aa8]/30 px-[6%] py-[3%] text-center">
            <header className="flex flex-col items-center gap-1">
              <Image src="/logo-evailton.png" alt="Casa de Cultura Evailton Vilela" width={84} height={84} className="h-[clamp(3rem,9vw,5.25rem)] w-auto print:h-[26mm]" />
              <p className="text-[clamp(0.6rem,1.3vw,0.875rem)] print:text-[11pt] font-semibold uppercase tracking-[0.25em] text-[#0b3aa8]">Casa de Cultura Evailton Vilela</p>
            </header>

            <div className="space-y-[1.5vw] print:space-y-[5mm]">
              <h1 className="text-[clamp(1.4rem,4.4vw,3.25rem)] print:text-[40pt] font-bold leading-none text-[#0b3aa8]">Certificado de Participação</h1>
              <p className="text-[clamp(0.7rem,1.5vw,1.05rem)] print:text-[14pt]">Certificamos que</p>
              <p className="border-b-2 border-[#f59e0b] px-6 pb-1 text-[clamp(1.2rem,3.2vw,2.4rem)] print:text-[30pt] font-semibold">{nome}</p>
              <p className="mx-auto max-w-3xl text-[clamp(0.7rem,1.5vw,1.05rem)] print:max-w-none print:text-[14pt] leading-relaxed">
                participou {p.item_tipo === "evento" ? "do evento" : p.item_tipo === "oficina" ? "da oficina" : p.item_tipo === "atividade" ? "da atividade" : "de"} <strong>{p.item_nome}</strong>
                {resumo ? <>, comparecendo a <strong>{resumo.encontros} {resumo.encontros === 1 ? "encontro" : "encontros"}</strong>{resumo.horas > 0 && <>, totalizando <strong>{String(resumo.horas).replace(".", ",")} horas</strong></>}, entre {dataBR(resumo.de)} e {dataBR(resumo.ate)}</> : ""}
                , uma iniciativa da Casa de Cultura Evailton Vilela.
              </p>
            </div>

            <footer className="grid w-full grid-cols-3 items-end gap-4 text-[clamp(0.55rem,1.1vw,0.8rem)] print:text-[10pt]">
              <div className="text-left">
                <p>Juiz de Fora, {paraData(`${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}.</p>
                <p className="mt-1 text-slate-600">Área: {ITEM_TIPO_LABELS[p.item_tipo]}</p>
              </div>
              <div>
                <div className="mx-auto w-4/5 border-t border-slate-500 pt-1 font-medium">Coordenação</div>
                <p className="text-slate-600">Casa de Cultura Evailton Vilela</p>
              </div>
              <div className="flex items-end justify-end gap-2 text-right">
                <p className="text-slate-600">Verifique a autenticidade<br />pelo QR Code<br /><span className="break-all">Código: {id}</span></p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {qr && <img src={qr} alt="QR Code para verificar este certificado" className="h-[clamp(2.75rem,7vw,5rem)] w-auto print:h-[22mm]" />}
              </div>
            </footer>
          </div>
        </div>
      </article>
    </div>
  )
}
